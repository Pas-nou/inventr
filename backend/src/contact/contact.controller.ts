import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Throttle } from '@nestjs/throttler';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post()
  async sendContact(
    @Body()
    body: {
      name: string;
      email: string;
      subject: string;
      message: string;
    },
  ): Promise<void> {
    await this.contactService.sendContact(
      body.name,
      body.email,
      body.subject,
      body.message,
    );
  }
}
