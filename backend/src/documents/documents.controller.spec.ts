import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentType } from './enums/document-type.enum';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { BadRequestException } from '@nestjs/common';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import type { MulterFile } from '../common/interfaces/multer-file.interface';

const mockDocumentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getSignedUrl: jest.fn(),
};

const mockRequest = {
  user: { userId: 'uuid-1', email: 'john@inventr.app' },
} as unknown as RequestWithUser;

const mockFile: MulterFile = {
  fieldname: 'file',
  originalname: 'facture.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  buffer: Buffer.from('test'),
  size: 1024,
};

const mockDocument = {
  id: 'doc-1',
  name: 'Facture',
  type: 'Facture',
  original_filename: 'facture.pdf',
  mime_type: 'application/pdf',
  size_bytes: 1024,
  storage_key: 'documents/uuid-facture.pdf',
  created_at: new Date(),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let documentsService: typeof mockDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    documentsService = module.get(DocumentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('devrait uploader un document', async () => {
      const dto: CreateDocumentDto = {
        documentName: 'Facture',
        type: DocumentType.INVOICE,
      };
      documentsService.create.mockResolvedValue(mockDocument);

      const result = await controller.create(
        dto,
        mockFile,
        'asset-1',
        mockRequest,
      );

      expect(documentsService.create).toHaveBeenCalledWith(
        dto,
        mockFile,
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockDocument);
    });

    it('devrait lever BadRequestException si aucun fichier fourni', async () => {
      await expect(async () =>
        controller.create(
          {} as unknown as CreateDocumentDto,
          undefined as unknown as MulterFile,
          'asset-1',
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    it('devrait retourner la liste des documents', async () => {
      const mockResponse = {
        data: [mockDocument],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      documentsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('asset-1', mockRequest, 1, 10);

      expect(documentsService.findAll).toHaveBeenCalledWith(
        'asset-1',
        'uuid-1',
        1,
        10,
      );
      expect(result).toBe(mockResponse);
    });
  });

  // -------------------------
  // findOne
  // -------------------------
  describe('findOne', () => {
    it('devrait retourner un document par id', async () => {
      documentsService.findOne.mockResolvedValue(mockDocument);

      const result = await controller.findOne('doc-1', 'asset-1', mockRequest);

      expect(documentsService.findOne).toHaveBeenCalledWith(
        'doc-1',
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockDocument);
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un document', async () => {
      const dto: UpdateDocumentDto = {
        name: 'Nouvelle facture',
        type: DocumentType.INVOICE,
      };
      const updatedDoc = { ...mockDocument, name: 'Nouvelle facture' };
      documentsService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update(
        'doc-1',
        'asset-1',
        dto,
        mockRequest,
      );

      expect(documentsService.update).toHaveBeenCalledWith(
        'doc-1',
        dto,
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(updatedDoc);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer un document', async () => {
      documentsService.remove.mockResolvedValue(mockDocument);

      const result = await controller.remove('doc-1', 'asset-1', mockRequest);

      expect(documentsService.remove).toHaveBeenCalledWith(
        'doc-1',
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockDocument);
    });
  });

  // -------------------------
  // getSignedUrl
  // -------------------------
  describe('getSignedUrl', () => {
    it('devrait retourner une URL signée', async () => {
      const mockUrl = { url: 'https://supabase.co/signed-url' };
      documentsService.getSignedUrl.mockResolvedValue(mockUrl);

      const result = await controller.getSignedUrl(
        'doc-1',
        'asset-1',
        mockRequest,
      );

      expect(documentsService.getSignedUrl).toHaveBeenCalledWith(
        'doc-1',
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockUrl);
    });
  });
});
