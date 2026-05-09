import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetCategory } from './enums/asset-category.enum';
import { AssetCondition } from './enums/asset-condition.enum';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

const mockAssetsService = {
  getStats: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockRequest = {
  user: { userId: 'uuid-1', email: 'john@inventr.app' },
} as unknown as RequestWithUser;

describe('AssetsController', () => {
  let controller: AssetsController;
  let assetsService: typeof mockAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
    assetsService = module.get(AssetsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------
  // getStats
  // -------------------------
  describe('getStats', () => {
    it("devrait retourner les stats de l'utilisateur", async () => {
      const mockStats = { assetsCount: 5, documentsCount: 10 };
      assetsService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockRequest);

      expect(assetsService.getStats).toHaveBeenCalledWith('uuid-1');
      expect(result).toBe(mockStats);
    });
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('devrait créer un bien', async () => {
      const dto: CreateAssetDto = {
        name: 'MacBook Pro',
        category: AssetCategory.TECH,
        purchase_price_cents: 250000,
        purchase_date: new Date(),
        condition: AssetCondition.NEW,
      };
      const mockAsset = { id: 'asset-1', ...dto };
      assetsService.create.mockResolvedValue(mockAsset);

      const result = await controller.create(dto, mockRequest);

      expect(assetsService.create).toHaveBeenCalledWith(dto, 'uuid-1');
      expect(result).toBe(mockAsset);
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    it('devrait retourner la liste des biens', async () => {
      const mockResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      assetsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(
        mockRequest,
        1,
        10,
        undefined,
        undefined,
        undefined,
      );

      expect(assetsService.findAll).toHaveBeenCalledWith(
        'uuid-1',
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toBe(mockResponse);
    });

    it('devrait passer les paramètres de recherche et tri', async () => {
      const mockResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      assetsService.findAll.mockResolvedValue(mockResponse);

      await controller.findAll(mockRequest, 1, 10, 'MacBook', 'name', 'ASC');

      expect(assetsService.findAll).toHaveBeenCalledWith(
        'uuid-1',
        1,
        10,
        'MacBook',
        'name',
        'ASC',
      );
    });
  });

  // -------------------------
  // findOne
  // -------------------------
  describe('findOne', () => {
    it('devrait retourner un bien par id', async () => {
      const mockAsset = { id: 'asset-1', name: 'MacBook Pro' };
      assetsService.findOne.mockResolvedValue(mockAsset);

      const result = await controller.findOne('asset-1', mockRequest);

      expect(assetsService.findOne).toHaveBeenCalledWith('asset-1', 'uuid-1');
      expect(result).toBe(mockAsset);
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un bien', async () => {
      const dto: UpdateAssetDto = { name: 'MacBook Pro M3' };
      const mockAsset = { id: 'asset-1', name: 'MacBook Pro M3' };
      assetsService.update.mockResolvedValue(mockAsset);

      const result = await controller.update('asset-1', dto, mockRequest);

      expect(assetsService.update).toHaveBeenCalledWith(
        'asset-1',
        dto,
        'uuid-1',
      );
      expect(result).toBe(mockAsset);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer un bien', async () => {
      assetsService.remove.mockResolvedValue(undefined);

      await controller.remove('asset-1', mockRequest);

      expect(assetsService.remove).toHaveBeenCalledWith('asset-1', 'uuid-1');
    });
  });
});
