import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import type { StringValue } from 'ms';
import { StorageService } from '../storage/storage.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private storageService: StorageService,
  ) {}

  /**
   * Registers a new user, hashes the password and sends a verification email.
   * The password_hash is stripped from the returned object.
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000,
    );
    const newUser = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt,
    });

    const savedUser = await this.usersRepository.save(newUser);

    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.first_name,
      verificationToken,
    );

    const { password_hash: _password_hash, ...result } = savedUser;

    return result;
  }

  /**
   * Returns JWT tokens and user profile including onboarding steps state.
   * Used by the frontend to initialize the onboarding checklist on login.
   */
  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        onboarding_steps: user.onboarding_steps,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new UnauthorizedException('Token invalide');
    }

    if (
      !user.verification_token_expires_at ||
      user.verification_token_expires_at < new Date()
    ) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    await this.usersRepository.update(user.id, {
      email_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || user.email_verified) {
      return;
    }

    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000,
    );

    await this.usersRepository.update(user.id, {
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt,
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationToken,
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !user.email_verified) {
      return;
    }

    const resetToken = randomUUID();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersRepository.update(user.id, {
      reset_password_token: resetToken,
      reset_password_token_expires_at: resetTokenExpiresAt,
    });

    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.first_name,
      resetToken,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { reset_password_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    if (
      !user.reset_password_token_expires_at ||
      user.reset_password_token_expires_at < new Date()
    ) {
      throw new BadRequestException('TOKEN_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(user.id, {
      password_hash: hashedPassword,
      reset_password_token: null,
      reset_password_token_expires_at: null,
    });
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token)
      throw new UnauthorizedException('Accès refusé');
    const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isValid) throw new UnauthorizedException('Accès refusé');
    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refresh_token: null });
  }

  /**
   * Generates and stores a hashed refresh token alongside the access token.
   * The refresh token is hashed with bcrypt before being stored in the database.
   */
  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    const JwtExpiration =
      this.configService.getOrThrow<string>('JWT_EXPIRATION');
    const JwtRefreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const JwtRefreshExpiration = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    const access_token = this.jwtService.sign(payload, {
      expiresIn: JwtExpiration as StringValue,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: JwtRefreshSecret,
      expiresIn: JwtRefreshExpiration as StringValue,
    });
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersRepository.update(user.id, {
      refresh_token: hashedRefreshToken,
    });
    return { access_token, refresh_token };
  }

  async updateProfile(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    },
  ): Promise<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (data.first_name) user.first_name = data.first_name;
    if (data.last_name) user.last_name = data.last_name;
    if (data.email) user.email = data.email;
    if (data.new_password) {
      if (!data.current_password) {
        throw new UnauthorizedException('Mot de passe actuel requis');
      }
      const isValid = await bcrypt.compare(
        data.current_password,
        user.password_hash,
      );
      if (!isValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
      }
      user.password_hash = await bcrypt.hash(data.new_password, 10);
    }
    await this.usersRepository.save(user);
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  /**
   * Exports all user data in a structured JSON format for GDPR compliance.
   * Includes profile, assets, documents metadata and maintenance events.
   */
  async exportUserData(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['assets', 'assets.documents', 'assets.maintenanceEvents'],
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return {
      exportDate: new Date().toISOString(),
      profil: {
        email: user.email,
        prenom: user.first_name,
        nom: user.last_name,
        inscritLe: user.created_at,
      },
      biens: user.assets.map((asset) => ({
        nom: asset.name,
        categorie: asset.category,
        dateAchat: asset.purchase_date,
        prixAchat: asset.purchase_price_cents
          ? asset.purchase_price_cents / 100
          : null,
        valeurActuelle: null, // Field not yet implemented
        etat: asset.condition,
        finGarantie: asset.warranty_end_date,
        notes: asset.notes,
        documents: asset.documents.map((doc) => ({
          nom: doc.name,
          type: doc.type,
          fichierOriginal: doc.original_filename,
          taille: doc.size_bytes,
          ajouteLe: doc.created_at,
        })),
        evenementsMaintenance: asset.maintenanceEvents.map((ev) => ({
          nom: ev.name,
          type: ev.type,
          date: ev.date,
          cout: ev.cost_cents ? ev.cost_cents / 100 : null,
          notes: ev.notes,
          prochaineEcheance: ev.next_due_date,
        })),
      })),
    };
  }

  async exportUserDataAsCSV(userId: string): Promise<string> {
    const data = await this.exportUserData(userId);

    const lines: string[] = [];

    // Profile
    lines.push('PROFIL');
    lines.push('Email,Prénom,Nom,Inscrit le');
    lines.push(
      `${data.profil.email},${data.profil.prenom},${data.profil.nom},${data.profil.inscritLe instanceof Date ? data.profil.inscritLe.toISOString() : data.profil.inscritLe}`,
    );
    lines.push('');

    // Assets
    lines.push('BIENS');
    lines.push(
      'Nom,Catégorie,Date achat,Prix achat (€),État,Fin garantie,Notes',
    );
    for (const bien of data.biens) {
      lines.push(
        [
          bien.nom ?? '',
          bien.categorie ?? '',
          bien.dateAchat ?? '',
          bien.prixAchat ?? '',
          bien.etat ?? '',
          bien.finGarantie ?? '',
          (bien.notes ?? '').replace(/,/g, ';'),
        ].join(','),
      );
    }
    lines.push('');

    // Events
    lines.push('ÉVÉNEMENTS DE MAINTENANCE');
    lines.push('Bien,Nom,Type,Date,Coût (€),Notes,Prochaine échéance');
    for (const bien of data.biens) {
      for (const ev of bien.evenementsMaintenance) {
        lines.push(
          [
            bien.nom ?? '',
            ev.nom ?? '',
            ev.type ?? '',
            ev.date ?? '',
            ev.cout ?? '',
            (ev.notes ?? '').replace(/,/g, ';'),
            ev.prochaineEcheance ?? '',
          ].join(','),
        );
      }
    }

    return lines.join('\n');
  }

  async exportUserDataAsXLSX(userId: string): Promise<ArrayBuffer> {
    const data = await this.exportUserData(userId);
    const workbook = new ExcelJS.Workbook();

    // Profile
    const profilSheet = workbook.addWorksheet('Profil');
    profilSheet.addRow(['Email', 'Prénom', 'Nom', 'Inscrit le']);
    profilSheet.addRow([
      data.profil.email,
      data.profil.prenom,
      data.profil.nom,
      data.profil.inscritLe,
    ]);

    // Assets
    const biensSheet = workbook.addWorksheet('Biens');
    biensSheet.addRow([
      'Nom',
      'Catégorie',
      'Date achat',
      'Prix achat (€)',
      'État',
      'Fin garantie',
      'Notes',
    ]);
    for (const bien of data.biens) {
      biensSheet.addRow([
        bien.nom,
        bien.categorie,
        bien.dateAchat,
        bien.prixAchat,
        bien.etat,
        bien.finGarantie,
        bien.notes,
      ]);
    }

    // Events
    const maintenanceSheet = workbook.addWorksheet('Maintenance');
    maintenanceSheet.addRow([
      'Bien',
      'Nom',
      'Type',
      'Date',
      'Coût (€)',
      'Notes',
      'Prochaine échéance',
    ]);
    for (const bien of data.biens) {
      for (const ev of bien.evenementsMaintenance) {
        maintenanceSheet.addRow([
          bien.nom,
          ev.nom,
          ev.type,
          ev.date,
          ev.cout,
          ev.notes,
          ev.prochaineEcheance,
        ]);
      }
    }
    return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
  }

  /**
   * Permanently deletes the account, all associated Supabase Storage files,
   * and cascades deletion to assets, documents and maintenance events.
   */
  async deleteAccount(userId: string, password: string) {
    const BUCKET = 'documents';
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['assets', 'assets.documents'],
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Password verification
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Mot de passe incorrect');

    // Deleting Supabase Storage files
    for (const asset of user.assets) {
      for (const doc of asset.documents) {
        await this.storageService.deleteFile(BUCKET, doc.storage_key);
      }
    }

    // User deletion (database cascade)
    await this.usersRepository.remove(user);
  }

  /**
   * Marks a single onboarding step as completed for the given user.
   * Steps are stored as a JSONB object and merged with existing state.
   * Called automatically by the frontend when the user completes each step.
   */
  async completeOnboardingStep(
    userId: string,
    step: 'first_asset' | 'first_document' | 'app_installed',
  ): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const current = user.onboarding_steps ?? {
      first_asset: false,
      first_document: false,
      app_installed: false,
    };

    await this.usersRepository.update(userId, {
      onboarding_steps: { ...current, [step]: true },
    });
  }
}
