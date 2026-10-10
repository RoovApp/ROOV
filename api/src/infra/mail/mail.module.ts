import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Global pelo mesmo motivo do `PrismaModule`: infraestrutura compartilhada, uma instância por processo. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
