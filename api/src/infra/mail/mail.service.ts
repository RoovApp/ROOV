import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AppConfigService } from '../../config/app-config.service';

/**
 * Envio de e-mail transacional — hoje, só o código de verificação do
 * cadastro.
 *
 * Sem `RESEND_API_KEY` configurada, não falha: loga o código no servidor
 * (modo de desenvolvimento) em vez de enviar de verdade. A API inteira não
 * deveria recusar subir por causa de uma integração nova e não crítica —
 * mesmo raciocínio de `fetchRealPlaces` no frontend (nunca derrubar o que já
 * funciona por causa do que ainda está em construção).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: AppConfigService) {
    const apiKey = config.resendApiKey;
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY não configurada — códigos de verificação serão apenas logados, não enviados por e-mail.',
      );
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[modo dev] Código de verificação para ${to}: ${code}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.config.resendFromEmail,
        to,
        subject: 'Seu código de verificação ROOV',
        html: `<p>Seu código de verificação é <strong>${code}</strong>.</p><p>Ele expira em 15 minutos.</p>`,
      });
    } catch (error) {
      // Best-effort: envio falhar não deve derrubar o cadastro. O usuário
      // ainda pode pedir reenvio depois (POST /auth/resend-verification).
      this.logger.error({ err: error, to }, 'Falha ao enviar código de verificação por e-mail');
    }
  }
}
