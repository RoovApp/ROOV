import { Injectable } from '@nestjs/common';
import type { EmailVerificationCode } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface CreateCodeData {
  userId: string;
  codeHash: string;
  expiresAt: Date;
}

/**
 * Persistência dos códigos de verificação de e-mail.
 *
 * Única camada do sistema autorizada a tocar o Prisma para esta entidade.
 */
@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCodeData): Promise<EmailVerificationCode> {
    return this.prisma.emailVerificationCode.create({ data });
  }

  /** O código mais recente do usuário — só ele é válido, os anteriores foram substituídos. */
  findLatest(userId: string): Promise<EmailVerificationCode | null> {
    return this.prisma.emailVerificationCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.prisma.emailVerificationCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  /** Limpa códigos antigos ao gerar um novo ou confirmar um — não deixa lixo acumular. */
  async deleteAllForUser(userId: string): Promise<void> {
    await this.prisma.emailVerificationCode.deleteMany({ where: { userId } });
  }
}
