import { createHash } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { EmailVerificationRepository } from './email-verification.repository';
import { TokenService } from './token.service';
import { MailService } from '../../infra/mail/mail.service';
import { UsersRepository } from '../users/users.repository';
import { AppException } from '../../common/errors/app.exception';
import { ErrorCode } from '../../common/errors/error-code';

/**
 * O que está sob teste aqui não é "o login funciona" — é o conjunto de
 * comportamentos de segurança que um refactor descuidado apaga sem quebrar
 * nenhum caminho feliz: mensagens que não vazam existência de conta, hash que
 * nunca sai na resposta e detecção de reuso de refresh token.
 */
describe('AuthService', () => {
  const baseUser = {
    id: 'user-1',
    email: 'ana@exemplo.com',
    passwordHash: 'hash-armazenado',
    username: 'ana',
    name: 'Ana',
    avatar: null,
    bio: null,
    city: null,
    state: null,
    country: null,
    preferredCategories: [] as const,
    emailVerified: false,
    status: 'ativo' as const,
    role: 'usuario' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const buildLogger = () =>
    ({
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }) as unknown as PinoLogger;

  async function build(overrides: {
    users?: Partial<UsersRepository>;
    refreshTokens?: Partial<RefreshTokenRepository>;
    passwords?: Partial<PasswordService>;
    verificationCodes?: Partial<EmailVerificationRepository>;
  }) {
    const users = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      markEmailVerified: jest.fn(),
      ...overrides.users,
    };
    const refreshTokens = {
      create: jest.fn().mockResolvedValue({}),
      findByHash: jest.fn(),
      revoke: jest.fn().mockResolvedValue(undefined),
      revokeAllForUser: jest.fn().mockResolvedValue(undefined),
      ...overrides.refreshTokens,
    };
    const passwords = {
      hash: jest.fn().mockResolvedValue('novo-hash'),
      verify: jest.fn().mockResolvedValue(true),
      verifyAgainstDummy: jest.fn().mockResolvedValue(undefined),
      ...overrides.passwords,
    };
    const tokens = {
      signAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest
        .fn()
        .mockReturnValue({ token: 'refresh-token', tokenHash: 'refresh-hash' }),
      hashRefreshToken: jest.fn((token: string) => `${token}-hash`),
      refreshTokenExpiresAt: jest.fn().mockReturnValue(new Date(Date.now() + 8.64e7)),
    };
    const verificationCodes = {
      create: jest.fn().mockResolvedValue({}),
      findLatest: jest.fn().mockResolvedValue(null),
      incrementAttempts: jest.fn().mockResolvedValue(undefined),
      deleteAllForUser: jest.fn().mockResolvedValue(undefined),
      ...overrides.verificationCodes,
    };
    const mail = {
      sendVerificationCode: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: users },
        { provide: RefreshTokenRepository, useValue: refreshTokens },
        { provide: EmailVerificationRepository, useValue: verificationCodes },
        { provide: PasswordService, useValue: passwords },
        { provide: TokenService, useValue: tokens },
        { provide: MailService, useValue: mail },
        { provide: PinoLogger, useValue: buildLogger() },
      ],
    }).compile();

    return {
      service: moduleRef.get(AuthService),
      users,
      refreshTokens,
      passwords,
      tokens,
      verificationCodes,
      mail,
    };
  }

  describe('login', () => {
    it('usa a mesma mensagem para e-mail inexistente e senha errada', async () => {
      const semUsuario = await build({
        users: { findByEmail: jest.fn().mockResolvedValue(null) },
      });
      const senhaErrada = await build({
        users: { findByEmail: jest.fn().mockResolvedValue(baseUser) },
        passwords: { verify: jest.fn().mockResolvedValue(false) },
      });

      const erro1 = await semUsuario.service
        .login({ email: 'x@x.com', password: 'senha12345' })
        .catch((e: AppException) => e);
      const erro2 = await senhaErrada.service
        .login({ email: 'ana@exemplo.com', password: 'errada12345' })
        .catch((e: AppException) => e);

      // Mensagens idênticas: caso contrário, é possível enumerar quem tem conta.
      expect((erro1 as AppException).message).toBe(
        (erro2 as AppException).message,
      );
      expect((erro1 as AppException).code).toBe(ErrorCode.UNAUTHENTICATED);
    });

    it('verifica um hash falso quando o e-mail não existe, para igualar o tempo', async () => {
      const { service, passwords } = await build({
        users: { findByEmail: jest.fn().mockResolvedValue(null) },
      });

      await service
        .login({ email: 'inexistente@x.com', password: 'senha12345' })
        .catch(() => undefined);

      // Sem esta chamada, a resposta mais rápida denunciaria o e-mail ausente.
      expect(passwords.verifyAgainstDummy).toHaveBeenCalled();
    });

    it('bloqueia conta banida mesmo com a senha correta', async () => {
      const { service } = await build({
        users: {
          findByEmail: jest
            .fn()
            .mockResolvedValue({ ...baseUser, status: 'banido' as const }),
        },
      });

      const erro = await service
        .login({ email: 'ana@exemplo.com', password: 'senha12345' })
        .catch((e: AppException) => e);

      expect((erro as AppException).code).toBe(ErrorCode.FORBIDDEN);
    });

    it('nunca devolve o hash da senha na sessão', async () => {
      const { service } = await build({
        users: { findByEmail: jest.fn().mockResolvedValue(baseUser) },
      });

      const session = await service.login({
        email: 'ana@exemplo.com',
        password: 'senha12345',
      });

      expect(JSON.stringify(session)).not.toContain('hash-armazenado');
      expect(session.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('refresh', () => {
    it('revoga todas as sessões ao detectar reuso de token revogado', async () => {
      const { service, refreshTokens } = await build({
        refreshTokens: {
          findByHash: jest.fn().mockResolvedValue({
            id: 'rt-1',
            userId: 'user-1',
            revokedAt: new Date(),
            expiresAt: new Date(Date.now() + 8.64e7),
          }),
        },
      });

      await service.refresh('token-vazado').catch(() => undefined);

      expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('rejeita token expirado sem revogar as demais sessões', async () => {
      const { service, refreshTokens } = await build({
        refreshTokens: {
          findByHash: jest.fn().mockResolvedValue({
            id: 'rt-1',
            userId: 'user-1',
            revokedAt: null,
            expiresAt: new Date(Date.now() - 1000),
          }),
        },
      });

      const erro = await service.refresh('token-velho').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.UNAUTHENTICATED);
      // Expirar é normal, não é sinal de comprometimento.
      expect(refreshTokens.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('rotaciona o token: revoga o antigo e emite um novo', async () => {
      const { service, refreshTokens } = await build({
        refreshTokens: {
          findByHash: jest.fn().mockResolvedValue({
            id: 'rt-1',
            userId: 'user-1',
            revokedAt: null,
            expiresAt: new Date(Date.now() + 8.64e7),
          }),
        },
        users: { findById: jest.fn().mockResolvedValue(baseUser) },
      });

      const session = await service.refresh('token-valido');

      expect(refreshTokens.revoke).toHaveBeenCalledWith('rt-1');
      expect(refreshTokens.create).toHaveBeenCalled();
      expect(session.accessToken).toBe('access-token');
    });
  });

  describe('logout', () => {
    it('é idempotente com token inexistente', async () => {
      const { service } = await build({
        refreshTokens: { findByHash: jest.fn().mockResolvedValue(null) },
      });

      await expect(service.logout('token-qualquer')).resolves.toBeUndefined();
    });

    it('revoga apenas a sessão apresentada', async () => {
      const { service, refreshTokens } = await build({
        refreshTokens: {
          findByHash: jest
            .fn()
            .mockResolvedValue({ id: 'rt-1', userId: 'user-1', revokedAt: null }),
        },
      });

      await service.logout('token-valido');

      expect(refreshTokens.revoke).toHaveBeenCalledWith('rt-1');
      // Sair no celular não pode derrubar o notebook.
      expect(refreshTokens.revokeAllForUser).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('envia um código de verificação ao cadastrar', async () => {
      const { service, users, mail } = await build({
        users: { create: jest.fn().mockResolvedValue(baseUser) },
      });

      await service.register({
        email: 'ana@exemplo.com',
        username: 'ana',
        name: 'Ana',
        password: 'senha12345',
      });

      expect(users.create).toHaveBeenCalled();
      expect(mail.sendVerificationCode).toHaveBeenCalledWith('ana@exemplo.com', expect.any(String));
    });

    it('não deixa o cadastro falhar se o envio do e-mail falhar', async () => {
      const { service, mail } = await build({
        users: { create: jest.fn().mockResolvedValue(baseUser) },
      });
      mail.sendVerificationCode.mockRejectedValue(new Error('provedor fora do ar'));

      // A conta já foi criada nesse ponto — uma falha de e-mail não pode
      // derrubar um cadastro que já aconteceu.
      const session = await service.register({
        email: 'ana@exemplo.com',
        username: 'ana',
        name: 'Ana',
        password: 'senha12345',
      });

      expect(session.accessToken).toBe('access-token');
    });
  });

  describe('verifyEmail', () => {
    const activeCode = {
      id: 'code-1',
      userId: 'user-1',
      codeHash: createHash('sha256').update('123456').digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      createdAt: new Date(),
    };

    it('confirma com o código certo e marca o e-mail como verificado', async () => {
      const { service, users, verificationCodes } = await build({
        users: {
          findById: jest.fn().mockResolvedValue(baseUser),
          markEmailVerified: jest
            .fn()
            .mockResolvedValue({ ...baseUser, emailVerified: true }),
        },
        verificationCodes: { findLatest: jest.fn().mockResolvedValue(activeCode) },
      });

      const result = await service.verifyEmail('user-1', '123456');

      expect(result.emailVerified).toBe(true);
      expect(users.markEmailVerified).toHaveBeenCalledWith('user-1');
      expect(verificationCodes.deleteAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('rejeita código errado e soma uma tentativa, sem verificar', async () => {
      const { service, users, verificationCodes } = await build({
        users: { findById: jest.fn().mockResolvedValue(baseUser) },
        verificationCodes: { findLatest: jest.fn().mockResolvedValue(activeCode) },
      });

      const erro = await service.verifyEmail('user-1', '000000').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.BAD_REQUEST);
      expect(verificationCodes.incrementAttempts).toHaveBeenCalledWith('code-1');
      expect(users.markEmailVerified).not.toHaveBeenCalled();
    });

    it('rejeita código expirado', async () => {
      const { service } = await build({
        users: { findById: jest.fn().mockResolvedValue(baseUser) },
        verificationCodes: {
          findLatest: jest
            .fn()
            .mockResolvedValue({ ...activeCode, expiresAt: new Date(Date.now() - 1000) }),
        },
      });

      const erro = await service.verifyEmail('user-1', '123456').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.BAD_REQUEST);
    });

    it('trava depois de muitas tentativas erradas, mesmo com o código certo', async () => {
      const { service } = await build({
        users: { findById: jest.fn().mockResolvedValue(baseUser) },
        verificationCodes: {
          findLatest: jest.fn().mockResolvedValue({ ...activeCode, attempts: 5 }),
        },
      });

      const erro = await service.verifyEmail('user-1', '123456').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.BAD_REQUEST);
    });
  });

  describe('resendVerification', () => {
    it('respeita o cooldown entre reenvios', async () => {
      const { service, mail } = await build({
        users: { findById: jest.fn().mockResolvedValue(baseUser) },
        verificationCodes: {
          findLatest: jest.fn().mockResolvedValue({
            id: 'code-1',
            userId: 'user-1',
            codeHash: 'qualquer',
            expiresAt: new Date(Date.now() + 60_000),
            attempts: 0,
            createdAt: new Date(),
          }),
        },
      });

      const erro = await service.resendVerification('user-1').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.RATE_LIMITED);
      expect(mail.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('rejeita reenvio para e-mail já verificado', async () => {
      const { service } = await build({
        users: { findById: jest.fn().mockResolvedValue({ ...baseUser, emailVerified: true }) },
      });

      const erro = await service.resendVerification('user-1').catch((e) => e);

      expect((erro as AppException).code).toBe(ErrorCode.BAD_REQUEST);
    });
  });
});
