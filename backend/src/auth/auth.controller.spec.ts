import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  exportUserData: jest.fn(),
  exportUserDataAsCSV: jest.fn(),
  exportUserDataAsXLSX: jest.fn(),
  deleteAccount: jest.fn(),
  completeOnboardingStep: jest.fn(),
};

const mockRequest = {
  user: { userId: 'uuid-1', email: 'john@inventr.app' },
} as unknown as RequestWithUser;

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------
  // login
  // -------------------------
  describe('login', () => {
    it('devrait appeler authService.login avec les bons paramètres', async () => {
      const dto = { email: 'john@inventr.app', password: 'password123' };
      const mockResult = {
        access_token: 'token',
        refresh_token: 'refresh',
        user: {},
      };
      authService.login.mockResolvedValue(mockResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toBe(mockResult);
    });
  });

  // -------------------------
  // register
  // -------------------------
  describe('register', () => {
    it('devrait appeler authService.register avec les bons paramètres', async () => {
      const dto = {
        email: 'john@inventr.app',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };
      authService.register.mockResolvedValue(undefined);

      await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.first_name,
        dto.last_name,
      );
    });
  });

  // -------------------------
  // verifyEmail
  // -------------------------
  describe('verifyEmail', () => {
    it('devrait appeler authService.verifyEmail avec le token', async () => {
      authService.verifyEmail.mockResolvedValue(undefined);

      await controller.verifyEmail('valid_token');

      expect(authService.verifyEmail).toHaveBeenCalledWith('valid_token');
    });
  });

  // -------------------------
  // resendVerification
  // -------------------------
  describe('resendVerification', () => {
    it('devrait appeler authService.resendVerificationEmail', async () => {
      authService.resendVerificationEmail.mockResolvedValue(undefined);

      await controller.resendVerification({ email: 'john@inventr.app' });

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(
        'john@inventr.app',
      );
    });
  });

  // -------------------------
  // forgotPassword
  // -------------------------
  describe('forgotPassword', () => {
    it('devrait appeler authService.forgotPassword', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword({ email: 'john@inventr.app' });

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'john@inventr.app',
      );
    });
  });

  // -------------------------
  // resetPassword
  // -------------------------
  describe('resetPassword', () => {
    it('devrait appeler authService.resetPassword', async () => {
      authService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword({
        token: 'valid_token',
        new_password: 'new_password',
      });

      expect(authService.resetPassword).toHaveBeenCalledWith(
        'valid_token',
        'new_password',
      );
    });
  });

  // -------------------------
  // refresh
  // -------------------------
  describe('refresh', () => {
    it('devrait appeler authService.refresh', async () => {
      const mockResult = {
        access_token: 'new_token',
        refresh_token: 'new_refresh',
      };
      authService.refresh.mockResolvedValue(mockResult);

      const result = await controller.refresh({
        userId: 'uuid-1',
        refresh_token: 'token',
      });

      expect(authService.refresh).toHaveBeenCalledWith('uuid-1', 'token');
      expect(result).toBe(mockResult);
    });
  });

  // -------------------------
  // logout
  // -------------------------
  describe('logout', () => {
    it('devrait appeler authService.logout avec userId', async () => {
      authService.logout.mockResolvedValue(undefined);

      await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('uuid-1');
    });
  });

  // -------------------------
  // updateProfile
  // -------------------------
  describe('updateProfile', () => {
    it('devrait appeler authService.updateProfile', async () => {
      const mockResult = {
        id: 'uuid-1',
        email: 'john@inventr.app',
        first_name: 'John',
        last_name: 'Doe',
      };
      authService.updateProfile.mockResolvedValue(mockResult);

      const result = await controller.updateProfile(mockRequest, {
        first_name: 'John',
      });

      expect(authService.updateProfile).toHaveBeenCalledWith('uuid-1', {
        first_name: 'John',
      });
      expect(result).toBe(mockResult);
    });
  });

  // -------------------------
  // deleteAccount
  // -------------------------
  describe('deleteAccount', () => {
    it('devrait appeler authService.deleteAccount et retourner un message', async () => {
      authService.deleteAccount.mockResolvedValue(undefined);

      const result = await controller.deleteAccount(mockRequest, {
        password: 'password123',
      });

      expect(authService.deleteAccount).toHaveBeenCalledWith(
        'uuid-1',
        'password123',
      );
      expect(result).toEqual({ message: 'Compte supprimé avec succès' });
    });
  });

  // -------------------------
  // completeOnboardingStep
  // -------------------------
  describe('completeOnboardingStep', () => {
    it('devrait appeler authService.completeOnboardingStep', async () => {
      authService.completeOnboardingStep.mockResolvedValue(undefined);

      await controller.completeOnboardingStep(mockRequest, 'first_asset');

      expect(authService.completeOnboardingStep).toHaveBeenCalledWith(
        'uuid-1',
        'first_asset',
      );
    });
  });
});
