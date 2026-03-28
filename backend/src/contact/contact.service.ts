import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ContactService {
  constructor(private emailService: EmailService) {}

  async sendContact(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    await this.emailService.sendContactEmail(name, email, subject, message);
  }
}
