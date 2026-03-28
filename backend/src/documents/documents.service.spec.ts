import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Asset } from '../assets/entities/asset.entity';
import { StorageService } from '../storage/storage.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentType } from './enums/document-type.enum';
import type { MulterFile } from '../common/interfaces/multer-file.interface';

const mockDocument = {
  id: 'doc-1',
  name: 'Facture MacBook',
  type: DocumentType.INVOICE,
  original_filename: 'facture.pdf',
  mime_type: 'application/pdf',
  size_bytes: 12345,
  storage_key: 'documents/uuid-facture.pdf',
  created_at: new Date(),
};

const mockAsset = {
  id: 'asset-1',
  user: { id: 'user-1' },
};

const mockFile: MulterFile = {
  fieldname: 'file',
  originalname: 'facture.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 12345,
  buffer: Buffer.from('mock'),
};

const mockDocumentRepository = {
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAssetRepository = {
  findOne: jest.fn(),
};

const mockStorageService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        { provide: getRepositoryToken(Asset), useValue: mockAssetRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('devrait uploader et créer un document', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockStorageService.uploadFile.mockResolvedValue(
        'documents/uuid-facture.pdf',
      );
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      const result = await service.create(
        {
          documentName: 'Facture MacBook',
          type: DocumentType.INVOICE,
        },
        mockFile,
        'asset-1',
        'user-1',
      );

      expect(result).toEqual(mockDocument);
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockDocumentRepository.save).toHaveBeenCalledTimes(1);
    });

    it('devrait lever ForbiddenException si asset non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            documentName: 'Facture',
            type: DocumentType.INVOICE,
          },
          mockFile,
          'asset-1',
          'user-2',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    it('devrait retourner les documents paginés', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findAndCount.mockResolvedValue([
        [mockDocument],
        1,
      ]);

      const result = await service.findAll('asset-1', 'user-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll('asset-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // -------------------------
  // findOne
  // -------------------------
  describe('findOne', () => {
    it('devrait retourner un document existant', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne('doc-1', 'asset-1', 'user-1');

      expect(result).toEqual(mockDocument);
    });

    it('devrait lever NotFoundException si document introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('doc-inexistant', 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('doc-1', 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un document existant', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.update.mockResolvedValue({ affected: 1 });
      mockDocumentRepository.findOne.mockResolvedValue({
        ...mockDocument,
        name: 'Nouvelle facture',
      });

      const result = await service.update(
        'doc-1',
        { name: 'Nouvelle facture' },
        'asset-1',
        'user-1',
      );

      expect(result.name).toBe('Nouvelle facture');
    });

    it('devrait lever NotFoundException si document introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('doc-inexistant', {}, 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('doc-1', {}, 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer le document et le fichier Storage', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockStorageService.deleteFile.mockResolvedValue(undefined);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('doc-1', 'asset-1', 'user-1');

      expect(result).toEqual(mockDocument);
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        'documents',
        mockDocument.storage_key,
      );
      expect(mockDocumentRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('devrait lever NotFoundException si document introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('doc-inexistant', 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('doc-1', 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------
  // getSignedUrl
  // -------------------------
  describe('getSignedUrl', () => {
    it('devrait retourner une URL signée', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockStorageService.getSignedUrl.mockResolvedValue(
        'https://supabase.co/signed-url',
      );

      const result = await service.getSignedUrl('doc-1', 'asset-1', 'user-1');

      expect(result.url).toBe('https://supabase.co/signed-url');
      expect(mockStorageService.getSignedUrl).toHaveBeenCalledWith(
        'documents',
        mockDocument.storage_key,
      );
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSignedUrl('doc-1', 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
