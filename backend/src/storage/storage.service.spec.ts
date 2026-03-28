import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import type { MulterFile } from '../common/interfaces/multer-file.interface';

// Mock Supabase client
const mockSupabaseStorage = {
  from: jest.fn(),
};

const mockFrom = {
  upload: jest.fn(),
  remove: jest.fn(),
  createSignedUrl: jest.fn(),
};

const mockFile: MulterFile = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 12345,
  buffer: Buffer.from('mock content'),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: mockSupabaseStorage,
  })),
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn<string, [string]>()
              .mockReturnValue('https://mock.supabase.co'),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
    mockSupabaseStorage.from.mockReturnValue(mockFrom);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("devrait utiliser une string vide si les variables d'env sont absentes", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn<undefined, [string]>().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    const serviceWithoutEnv = module.get<StorageService>(StorageService);
    expect(serviceWithoutEnv).toBeDefined();
  });

  // -------------------------
  // uploadFile
  // -------------------------
  describe('uploadFile', () => {
    it('devrait uploader un fichier et retourner le path', async () => {
      mockFrom.upload.mockResolvedValue({
        data: { path: 'documents/test.pdf' },
        error: null,
      });

      const result = await service.uploadFile(
        mockFile,
        'documents',
        'documents/test.pdf',
      );

      expect(mockSupabaseStorage.from).toHaveBeenCalledWith('documents');
      expect(result).toBe('documents/test.pdf');
    });

    it('devrait lever InternalServerErrorException si upload échoue', async () => {
      mockFrom.upload.mockResolvedValue({
        data: null,
        error: new Error('Upload failed'),
      });

      await expect(
        service.uploadFile(mockFile, 'documents', 'documents/test.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // -------------------------
  // deleteFile
  // -------------------------
  describe('deleteFile', () => {
    it('devrait supprimer un fichier', async () => {
      mockFrom.remove.mockResolvedValue({ error: null });

      await expect(
        service.deleteFile('documents', 'documents/test.pdf'),
      ).resolves.not.toThrow();

      expect(mockSupabaseStorage.from).toHaveBeenCalledWith('documents');
      expect(mockFrom.remove).toHaveBeenCalledWith(['documents/test.pdf']);
    });

    it('devrait lever InternalServerErrorException si suppression échoue', async () => {
      mockFrom.remove.mockResolvedValue({
        error: new Error('Delete failed'),
      });

      await expect(
        service.deleteFile('documents', 'documents/test.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // -------------------------
  // getSignedUrl
  // -------------------------
  describe('getSignedUrl', () => {
    it('devrait retourner une URL signée', async () => {
      mockFrom.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://supabase.co/signed-url' },
        error: null,
      });

      const result = await service.getSignedUrl(
        'documents',
        'documents/test.pdf',
      );

      expect(result).toBe('https://supabase.co/signed-url');
      expect(mockSupabaseStorage.from).toHaveBeenCalledWith('documents');
    });

    it('devrait lever InternalServerErrorException si URL échoue', async () => {
      mockFrom.createSignedUrl.mockResolvedValue({
        data: null,
        error: new Error('Signed URL failed'),
      });

      await expect(
        service.getSignedUrl('documents', 'documents/test.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('devrait lever InternalServerErrorException si signedUrl absent', async () => {
      mockFrom.createSignedUrl.mockResolvedValue({
        data: { signedUrl: null },
        error: null,
      });

      await expect(
        service.getSignedUrl('documents', 'documents/test.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
