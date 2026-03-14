import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromAddress: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.fromAddress = this.configService.getOrThrow<string>('EMAIL_FROM');
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(
    toEmail: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: this.fromAddress,
      to: toEmail,
      subject: 'Confirmez votre adresse email - Inventr',
      html: this.buildVerificationEmailHtml(firstName, verificationUrl),
    });
  }

  private buildVerificationEmailHtml(
    firstName: string,
    verificationUrl: string,
  ): string {
    return `
    <!DOCTYPE html>
          <html lang="fr">
            <body style="margin:0;padding:0;background-color:#0A0F1A;font-family:Inter,sans-serif;color:#F1F5F9;">
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111827;border-radius:12px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
                                <tr>
                                    <td style="padding-bottom:32px;">
                                        <span style="font-family:Inter,sans-serif;font-size:24px;font-weight:700;color:#F1F5F9;">
                                            Invent<span style="color:#00BFA6;">r</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:16px;font-size:18px;font-weight:600;color:#F1F5F9;">
                                        Bonjour ${firstName},
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:32px;font-size:15px;line-height:1.6;color:#94A3B8;">
                                        Merci de vous être inscrit sur Inventr. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email. Ce lien est valable <strong style="color:#F1F5F9;">48 heures</strong>.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom:32px;">
                                        <a href="${verificationUrl}"
                                            style="display:inline-block;background-color:#00BFA6;color:#0A0F1A;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                                                Confirmer mon email
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:13px;color:#64748B;line-height:1.6;">
                                        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                                        <a href="${verificationUrl}" style="color:#00BFA6;word-break:break-all;">${verificationUrl}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top:32px;font-size:12px;color:#475569;border-top:1px solid rgba(255,255,255,0.08);">
                                        Si vous n'avez pas créé de compte Inventr, ignorez cet email.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
  }
}
