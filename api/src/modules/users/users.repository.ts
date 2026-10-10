import { Injectable } from '@nestjs/common';
import { Prisma, type PlaceCategory, type User } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface CreateUserData {
  email: string;
  username: string;
  name: string;
  passwordHash: string;
  /** Localização opcional informada no próprio cadastro, ver `RegisterDto`. */
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Campos editáveis pela Fase 3 — deliberadamente não é `Prisma.UserUpdateInput`.
 * Um tipo genérico deixaria `passwordHash`/`email`/`role` alcançáveis por este
 * mesmo caminho; a lista explícita fecha essa porta por padrão.
 */
export interface UpdateUserData {
  name?: string;
  avatar?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  preferredCategories?: PlaceCategory[];
}

/**
 * Persistência de usuários.
 *
 * Avatar é preset (um emoji), não upload: Storage fica pra Fase 11, não
 * entra neste corte. `preferredCategories` é preferência declarada, sinal
 * de cold start, não o DNA construído por comportamento (Cap. 57).
 *
 * Única camada do sistema autorizada a tocar o Prisma para esta entidade.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * O e-mail é normalizado para minúsculas na entrada, então a busca é direta.
   * Sem isso, `Ana@x.com` e `ana@x.com` criariam duas contas.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  markEmailVerified(id: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { emailVerified: true } });
  }

  /**
   * Separado de `update()` de propósito: `UpdateUserData` não alcança
   * `passwordHash`, e deve continuar assim. Troca de senha é o único
   * caminho autorizado a escrever este campo fora do cadastro.
   */
  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  /**
   * Traduz a violação de unicidade do Postgres para o campo que a causou.
   *
   * Existe para o `AuthService` distinguir "e-mail já usado" de "username já
   * usado" sem precisar de duas consultas prévias — que, além de mais lentas,
   * não eliminariam a corrida entre a consulta e o insert. O banco é a única
   * autoridade confiável sobre unicidade.
   */
  static conflictField(error: unknown): 'email' | 'username' | null {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return null;
    }

    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target.map(String) : [String(target)];

    if (fields.some((field) => field.includes('email'))) return 'email';
    if (fields.some((field) => field.includes('username'))) return 'username';
    return null;
  }
}
