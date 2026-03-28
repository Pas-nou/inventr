import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Global mockups
const mockUser = {
  id: 'uuid-1',
  email: 'john@inventr.app',
  password_hash: 'hashed_password',
  first_name: 'John',
  last_name: 'Doe',
  role: 'user',
  email_verified: true,
  refresh_token: 'hashed_refresh',
  verification_token: null,
  verification_token_expires_at: null,
  reset_password_token: null,
  reset_password_token_expires_at: null,
  created_at: new Date('2024-01-01'),
  assets: [],
};

const mockUsersRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('mock_value'),
  get: jest.fn().mockReturnValue('mock_value'),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
};

const mockStorageService = {
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

const expectedUpdate: { reset_password_token: string } = {
  reset_password_token: expect.stringMatching(
    /^[0-9a-f-]{36}$/,
  ) as unknown as string,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // -------------------------
  // register
  // -------------------------
  describe('register', () => {
    it('devrait créer un utilisateur et envoyer un email de vérification', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue({
        ...mockUser,
        email_verified: false,
      });
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });

      const result = await service.register(
        'john@inventr.app',
        'password123',
        'John',
        'Doe',
      );

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@inventr.app' },
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('devrait lever ConflictException si email déjà utilisé', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register('john@inventr.app', 'password123', 'John', 'Doe'),
      ).rejects.toThrow(ConflictException);

      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // login
  // -------------------------
  describe('login', () => {
    it('devrait retourner les tokens si credentials valides', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_refresh');
      mockUsersRepository.update.mockResolvedValue(undefined);

      const result = await service.login('john@inventr.app', 'password123');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe('john@inventr.app');
    });

    it('devrait lever UnauthorizedException si utilisateur inexistant', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login('unknown@inventr.app', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si mot de passe incorrect', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('john@inventr.app', 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si email non vérifié', async () => {
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login('john@inventr.app', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // -------------------------
  // verifyEmail
  // -------------------------
  describe('verifyEmail', () => {
    it("devrait vérifier l'email avec un token valide", async () => {
      const futureDate = new Date(Date.now() + 10000);
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        verification_token: 'valid_token',
        verification_token_expires_at: futureDate,
      });
      mockUsersRepository.update.mockResolvedValue(undefined);

      await expect(service.verifyEmail('valid_token')).resolves.not.toThrow();
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ email_verified: true }),
      );
    });

    it('devrait lever UnauthorizedException si token invalide', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('devrait lever UnauthorizedException si token expiré', async () => {
      const pastDate = new Date(Date.now() - 10000);
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        verification_token: 'expired_token',
        verification_token_expires_at: pastDate,
      });

      await expect(service.verifyEmail('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // -------------------------
  // refresh
  // -------------------------
  describe('refresh', () => {
    it('devrait retourner de nouveaux tokens si refresh token valide', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_refresh');
      mockUsersRepository.update.mockResolvedValue(undefined);

      const result = await service.refresh('uuid-1', 'valid_refresh_token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('devrait lever UnauthorizedException si utilisateur inexistant', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('uuid-1', 'token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('devrait lever UnauthorizedException si refresh token invalide', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('uuid-1', 'wrong_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // -------------------------
  // logout
  // -------------------------
  describe('logout', () => {
    it('devrait révoquer le refresh token', async () => {
      mockUsersRepository.update.mockResolvedValue(undefined);

      await service.logout('uuid-1');

      expect(mockUsersRepository.update).toHaveBeenCalledWith('uuid-1', {
        refresh_token: null,
      });
    });
  });

  // -------------------------
  // forgotPassword
  // -------------------------
  describe('forgotPassword', () => {
    it('devrait envoyer un email de reset si utilisateur vérifié', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue(undefined);

      await service.forgotPassword('john@inventr.app');

      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining(expectedUpdate),
      );
    });

    it('ne devrait rien faire si utilisateur inexistant', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await service.forgotPassword('unknown@inventr.app');

      expect(mockEmailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });

    it('ne devrait rien faire si email non vérifié', async () => {
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });

      await service.forgotPassword('john@inventr.app');

      expect(mockEmailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // resetPassword
  // -------------------------
  describe('resetPassword', () => {
    it('devrait réinitialiser le mot de passe avec un token valide', async () => {
      const futureDate = new Date(Date.now() + 10000);
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        reset_password_token: 'valid_token',
        reset_password_token_expires_at: futureDate,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockUsersRepository.update.mockResolvedValue(undefined);

      await expect(
        service.resetPassword('valid_token', 'new_password'),
      ).resolves.not.toThrow();
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ reset_password_token: null }),
      );
    });

    it('devrait lever BadRequestException si token invalide', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid_token', 'new_password'),
      ).rejects.toThrow();
    });

    it('devrait lever BadRequestException si token expiré', async () => {
      const pastDate = new Date(Date.now() - 10000);
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        reset_password_token: 'expired_token',
        reset_password_token_expires_at: pastDate,
      });

      await expect(
        service.resetPassword('expired_token', 'new_password'),
      ).rejects.toThrow();
    });
  });

  // -------------------------
  // updateProfile
  // -------------------------
  describe('updateProfile', () => {
    it('devrait mettre à jour le profil sans changer le mot de passe', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        first_name: 'Pascal',
        last_name: 'Dupont',
      });

      const result = await service.updateProfile('uuid-1', {
        first_name: 'Pascal',
        last_name: 'Dupont',
      });

      expect(result.first_name).toBe('Pascal');
      expect(result.last_name).toBe('Dupont');
    });

    it('devrait changer le mot de passe si current_password correct', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      mockUsersRepository.save.mockResolvedValue(mockUser);

      await expect(
        service.updateProfile('uuid-1', {
          current_password: 'password123',
          new_password: 'new_password',
        }),
      ).resolves.not.toThrow();
    });

    it('devrait lever UnauthorizedException si current_password incorrect', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateProfile('uuid-1', {
          current_password: 'wrong_password',
          new_password: 'new_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // -------------------------
  // exportUserData
  // -------------------------
  describe('exportUserData', () => {
    it("devrait retourner la structure d'export complète", async () => {
      const assetWithRelations = {
        id: 'asset-1',
        name: 'MacBook Pro',
        category: 'High-tech',
        purchase_date: new Date('2023-01-01'),
        purchase_price_cents: 250000,
        condition: 'Excellent',
        warranty_end_date: new Date('2026-01-01'),
        notes: null,
        documents: [
          {
            name: 'Facture',
            type: 'Facture',
            original_filename: 'facture.pdf',
            size_bytes: 12345,
            created_at: new Date(),
          },
        ],
        maintenanceEvents: [
          {
            name: 'Nettoyage',
            type: 'Nettoyage',
            date: new Date(),
            cost_cents: 0,
            notes: null,
            next_due_date: null,
          },
        ],
      };

      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        assets: [assetWithRelations],
      });

      const result = await service.exportUserData('uuid-1');

      expect(result).toHaveProperty('exportDate');
      expect(result).toHaveProperty('profil');
      expect(result).toHaveProperty('biens');
      expect(result.profil.email).toBe('john@inventr.app');
      expect(result.biens).toHaveLength(1);
      expect(result.biens[0].nom).toBe('MacBook Pro');
      expect(result.biens[0].prixAchat).toBe(2500);
      expect(result.biens[0].documents).toHaveLength(1);
      expect(result.biens[0].evenementsMaintenance).toHaveLength(1);
    });

    it('devrait lever NotFoundException si utilisateur inexistant', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.exportUserData('uuid-inexistant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------
  // deleteAccount
  // -------------------------
  describe('deleteAccount', () => {
    it('devrait supprimer le compte et les fichiers Storage', async () => {
      const userWithAssets = {
        ...mockUser,
        assets: [
          {
            documents: [
              { storage_key: 'documents/file1.pdf' },
              { storage_key: 'documents/file2.pdf' },
            ],
          },
        ],
      };
      mockUsersRepository.findOne.mockResolvedValue(userWithAssets);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersRepository.remove.mockResolvedValue(undefined);

      await service.deleteAccount('uuid-1', 'password123');

      expect(mockStorageService.deleteFile).toHaveBeenCalledTimes(2);
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'documents',
        'documents/file1.pdf',
      );
      expect(mockUsersRepository.remove).toHaveBeenCalledWith(userWithAssets);
    });

    it('devrait lever NotFoundException si utilisateur inexistant', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteAccount('uuid-inexistant', 'password123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever UnauthorizedException si mot de passe incorrect', async () => {
      mockUsersRepository.findOne.mockResolvedValue({
        ...mockUser,
        assets: [],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteAccount('uuid-1', 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersRepository.remove).not.toHaveBeenCalled();
    });

    it('ne devrait pas supprimer le compte si un fichier Storage échoue', async () => {
      const userWithAssets = {
        ...mockUser,
        assets: [{ documents: [{ storage_key: 'documents/file1.pdf' }] }],
      };
      mockUsersRepository.findOne.mockResolvedValue(userWithAssets);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockStorageService.deleteFile.mockRejectedValueOnce(
        new Error('Storage error'),
      );

      await expect(
        service.deleteAccount('uuid-1', 'password123'),
      ).rejects.toThrow('Storage error');
      expect(mockUsersRepository.remove).not.toHaveBeenCalled();
    });
  });
});
