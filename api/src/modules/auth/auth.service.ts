import { createHash, randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { User } from '@prisma/client';
import { AppException } from '../../common/errors/app.exception';
import { MailService } from '../../infra/mail/mail.service';
import { UsersRepository } from '../users/users.repository';
import { toPublicUser, type PublicUser } from '../users/users.service';
import { PasswordService } from './password.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { EmailVerificationRepository } from './email-verification.repository';
import { TokenService } from './token.service';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

/** 15 minutos de validade, 5 tentativas erradas — depois disso, só reenvio. */
const VERIFICATION_CODE_TTL_MINUTES = 15;
const VERIFICATION_MAX_ATTEMPTS = 5;
/** Intervalo mínimo entre reenvios, pra não virar um disparador de spam. */
const VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

export type { PublicUser };

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

/** Status que impedem autenticação, independentemente da senha estar correta. */
const BLOCKED_STATUSES: ReadonlyArray<User['status']> = [
  'suspenso',
  'banido',
  'excluido',
];

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly verificationCodes: EmailVerificationRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(dto: RegisterDto): Promise<AuthSession> {
    const passwordHash = await this.passwords.hash(dto.password);

    let user: User;
    try {
      user = await this.users.create({
        email: dto.email,
        username: dto.username,
        name: dto.name,
        passwordHash,
        city: dto.city,
        state: dto.state,
        country: dto.country,
      });
    } catch (error) {
      /**
       * Deixamos o banco decidir sobre unicidade em vez de consultar antes.
       * Consultar-e-depois-inserir tem uma janela de corrida entre as duas
       * operações; a restrição UNIQUE não tem.
       */
      const field = UsersRepository.conflictField(error);

      if (field === 'email') {
        throw AppException.conflict('Este e-mail já está cadastrado.');
      }
      if (field === 'username') {
        throw AppException.conflict('Este nome de usuário já está em uso.');
      }
      throw error;
    }

    this.logger.info({ userId: user.id }, 'Usuário cadastrado');

    // Best-effort de verdade: captura aqui, não só dentro de `MailService`.
    // Se gerar/guardar o código falhar (ex.: banco fora do ar por um
    // instante), o cadastro segue — o usuário pede reenvio depois. A conta
    // já foi criada; não existe motivo para derrubá-la por causa disso.
    try {
      await this.sendVerificationCode(user);
    } catch (error) {
      this.logger.error(
        { err: error, userId: user.id },
        'Falha ao gerar/enviar código de verificação no cadastro',
      );
    }

    return this.createSession(user);
  }

  /**
   * Confirma o código enviado no cadastro.
   *
   * Trava depois de `VERIFICATION_MAX_ATTEMPTS` tentativas erradas na mesma
   * linha — força reenvio em vez de permitir força bruta sobre um código de
   * 6 dígitos (10^6 combinações, pouco pra quem tenta sem limite).
   */
  async verifyEmail(userId: string, code: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw AppException.unauthenticated('Sessão inválida.');
    }
    if (user.emailVerified) {
      return toPublicUser(user);
    }

    const latest = await this.verificationCodes.findLatest(userId);
    if (!latest) {
      throw AppException.badRequest('Nenhum código pendente. Peça um novo.');
    }
    if (latest.attempts >= VERIFICATION_MAX_ATTEMPTS) {
      throw AppException.badRequest('Muitas tentativas erradas. Peça um código novo.');
    }
    if (latest.expiresAt <= new Date()) {
      throw AppException.badRequest('Código expirado. Peça um novo.');
    }

    if (latest.codeHash !== this.hashVerificationCode(code)) {
      await this.verificationCodes.incrementAttempts(latest.id);
      throw AppException.badRequest('Código inválido.');
    }

    const verified = await this.users.markEmailVerified(userId);
    await this.verificationCodes.deleteAllForUser(userId);
    this.logger.info({ userId }, 'E-mail verificado');

    return toPublicUser(verified);
  }

  /** Reenvio sob pedido — ex.: código não chegou, ou expirou antes de ser usado. */
  async resendVerification(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw AppException.unauthenticated('Sessão inválida.');
    }
    if (user.emailVerified) {
      throw AppException.badRequest('Este e-mail já está verificado.');
    }

    const latest = await this.verificationCodes.findLatest(userId);
    if (latest) {
      const secondsSinceLast = (Date.now() - latest.createdAt.getTime()) / 1000;
      if (secondsSinceLast < VERIFICATION_RESEND_COOLDOWN_SECONDS) {
        throw AppException.rateLimited(
          `Aguarde ${Math.ceil(VERIFICATION_RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s para pedir um novo código.`,
        );
      }
    }

    await this.sendVerificationCode(user);
  }

  /** Gera um código novo, substitui qualquer anterior e dispara o e-mail. */
  private async sendVerificationCode(user: User): Promise<void> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000);

    await this.verificationCodes.deleteAllForUser(user.id);
    await this.verificationCodes.create({
      userId: user.id,
      codeHash: this.hashVerificationCode(code),
      expiresAt,
    });

    await this.mail.sendVerificationCode(user.email, code);
  }

  /**
   * SHA-256, não Argon2: ao contrário de senha, um código de 6 dígitos não
   * ganha segurança real de um hash lento — o que impede força bruta aqui é
   * `VERIFICATION_MAX_ATTEMPTS`, não o custo do hash. Mesmo raciocínio do
   * `TokenService.hashRefreshToken`.
   */
  private hashVerificationCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.users.findByEmail(dto.email);

    /**
     * Enumeração de usuários.
     *
     * Se e-mail inexistente devolvesse "usuário não encontrado" e senha errada
     * devolvesse "senha incorreta", qualquer pessoa poderia descobrir quem tem
     * conta no ROOV testando endereços. A mensagem é idêntica nos dois casos.
     *
     * Resta a diferença de tempo: sem usuário não há verificação de hash, e a
     * resposta volta mais rápido. Por isso executamos o Argon2 mesmo quando o
     * usuário não existe, contra um hash descartável.
     */
    if (!user) {
      await this.passwords.verifyAgainstDummy(dto.password);
      throw AppException.unauthenticated('E-mail ou senha inválidos.');
    }

    const passwordMatches = await this.passwords.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordMatches) {
      this.logger.warn({ userId: user.id }, 'Tentativa de login com senha inválida');
      throw AppException.unauthenticated('E-mail ou senha inválidos.');
    }

    if (BLOCKED_STATUSES.includes(user.status)) {
      /**
       * Mensagem distinta aqui é intencional e não vaza nada: quem chegou até
       * este ponto já provou conhecer a senha, então a existência da conta não
       * é mais segredo para ele. E o usuário precisa entender por que não
       * consegue entrar.
       */
      throw AppException.forbidden(
        'Esta conta não está disponível. Entre em contato com o suporte.',
      );
    }

    return this.createSession(user);
  }

  /**
   * Renova a sessão, rotacionando o refresh token.
   *
   * Rotação significa que o token usado é revogado e um novo é emitido. Sem
   * isso, um refresh token roubado valeria 30 dias em silêncio. Com rotação, o
   * atacante e o usuário legítimo passam a competir pelo mesmo token, e a
   * segunda tentativa dispara a detecção de reuso abaixo.
   */
  async refresh(refreshToken: string): Promise<AuthSession> {
    const tokenHash = this.tokens.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);

    if (!stored) {
      throw AppException.unauthenticated('Sessão inválida.');
    }

    /**
     * Detecção de reuso.
     *
     * Um token já revogado sendo apresentado outra vez significa uma de duas
     * coisas: ou o token vazou, ou o cliente repetiu uma requisição. Não há
     * como distinguir — e o custo de errar é assimétrico. Encerrar todas as
     * sessões força um login novo no pior caso, e corta o acesso do atacante
     * no caso ruim.
     */
    if (stored.revokedAt) {
      this.logger.warn(
        { userId: stored.userId },
        'Reuso de refresh token detectado — todas as sessões revogadas',
      );
      await this.refreshTokens.revokeAllForUser(stored.userId);
      throw AppException.unauthenticated('Sessão inválida.');
    }

    if (stored.expiresAt <= new Date()) {
      throw AppException.unauthenticated('Sessão expirada.');
    }

    const user = await this.users.findById(stored.userId);

    if (!user || BLOCKED_STATUSES.includes(user.status)) {
      await this.refreshTokens.revokeAllForUser(stored.userId);
      throw AppException.unauthenticated('Sessão inválida.');
    }

    await this.refreshTokens.revoke(stored.id);

    return this.createSession(user);
  }

  /**
   * Logout.
   *
   * Revoga apenas a sessão apresentada, não todas — sair no celular não deve
   * derrubar o notebook.
   *
   * Não lança quando o token não existe: logout precisa ser idempotente. Um
   * cliente que já apagou o token local e tenta sair de novo deve receber
   * sucesso, não erro.
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.tokens.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.refreshTokens.revoke(stored.id);
    }
  }

  /**
   * Troca de senha — Fase 3.
   *
   * Encerra todas as sessões (inclusive a atual) ao final, via o mesmo
   * `revokeAllForUser` usado na detecção de reuso de refresh token. Trocar
   * senha é, na prática, uma resposta a "posso ter vazado minha senha";
   * deixar sessões antigas vivas contradiria o propósito.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw AppException.unauthenticated('Sessão inválida.');
    }

    const currentMatches = await this.passwords.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!currentMatches) {
      throw AppException.unauthenticated('Senha atual incorreta.');
    }

    const passwordHash = await this.passwords.hash(dto.newPassword);
    await this.users.updatePasswordHash(user.id, passwordHash);
    await this.refreshTokens.revokeAllForUser(user.id);

    this.logger.info({ userId: user.id }, 'Senha alterada — sessões encerradas');
  }

  /** Perfil do usuário autenticado. */
  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);

    if (!user) {
      // Token válido de usuário removido: sessão sem dono.
      throw AppException.unauthenticated('Sessão inválida.');
    }

    return toPublicUser(user);
  }

  private async createSession(user: User): Promise<AuthSession> {
    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      role: user.role,
    });

    const { token, tokenHash } = this.tokens.generateRefreshToken();

    await this.refreshTokens.create({
      tokenHash,
      userId: user.id,
      expiresAt: this.tokens.refreshTokenExpiresAt(),
    });

    return { accessToken, refreshToken: token, user: toPublicUser(user) };
  }
}
