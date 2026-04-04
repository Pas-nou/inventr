import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Document } from '../documents/entities/document.entity';
import { NotFoundException } from '@nestjs/common';
import { AssetCategory } from './enums/asset-category.enum';
import { AssetCondition } from './enums/asset-condition.enum';

const mockAsset = {
  id: 'asset-1',
  name: 'MacBook Pro',
  category: AssetCategory.TECH,
  purchase_date: new Date('2023-01-01'),
  purchase_price_cents: 250000,
  condition: AssetCondition.NEW,
  warranty_end_date: new Date('2026-01-01'),
  notes: undefined,
  created_at: new Date(),
  user: { id: 'user-1' },
};

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(3),
};

const mockAssetsRepository = {
  count: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockDocumentsRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: getRepositoryToken(Asset), useValue: mockAssetsRepository },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentsRepository,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------
  // getStats
  // -------------------------
  describe('getStats', () => {
    it("devrait retourner le nombre d'assets et de documents", async () => {
      mockAssetsRepository.count.mockResolvedValue(5);
      mockDocumentsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getStats('user-1');

      expect(result.assetsCount).toBe(5);
      expect(result.documentsCount).toBe(3);
    });
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('devrait créer un asset', async () => {
      mockAssetsRepository.save.mockResolvedValue(mockAsset);

      const result = await service.create(
        {
          name: 'MacBook Pro',
          category: AssetCategory.TECH,
          purchase_date: new Date('2023-01-01'),
          purchase_price_cents: 250000,
          condition: AssetCondition.NEW,
          warranty_end_date: new Date('2026-01-01'),
        },
        'user-1',
      );

      expect(result).toEqual(mockAsset);
      expect(mockAssetsRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    const mockQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      mockAssetsRepository.createQueryBuilder.mockReturnValue(mockQb);
      jest.clearAllMocks();
      mockAssetsRepository.createQueryBuilder.mockReturnValue(mockQb);
    });

    it('devrait retourner les assets paginés sans recherche', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[mockAsset], 1]);

      const result = await service.findAll('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('devrait filtrer par nom avec le paramètre search', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[mockAsset], 1]);

      const result = await service.findAll('user-1', 1, 10, 'MacBook');

      expect(mockQb.andWhere).toHaveBeenCalledWith('asset.name ILIKE :search', {
        search: '%MacBook%',
      });
      expect(result.data).toHaveLength(1);
    });

    it('devrait ignorer un search vide ou avec espaces', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', 1, 10, '   ');

      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    it('devrait limiter à 100 même si limit > 100', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', 1, 999);

      expect(mockQb.take).toHaveBeenCalledWith(100);
    });
  });

  // -------------------------
  // findOne
  // -------------------------
  describe('findOne', () => {
    it('devrait retourner un asset existant', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(mockAsset);

      const result = await service.findOne('asset-1', 'user-1');

      expect(result).toEqual(mockAsset);
    });

    it('devrait lever NotFoundException si asset introuvable', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('asset-inexistant', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever NotFoundException si asset appartient à un autre utilisateur', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('asset-1', 'user-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un asset existant', async () => {
      mockAssetsRepository.preload.mockResolvedValue(mockAsset);
      mockAssetsRepository.save.mockResolvedValue({
        ...mockAsset,
        name: 'MacBook Air',
      });

      const result = await service.update(
        'asset-1',
        { name: 'MacBook Air' },
        'user-1',
      );

      expect(result.name).toBe('MacBook Air');
    });

    it('devrait lever NotFoundException si asset introuvable', async () => {
      mockAssetsRepository.preload.mockResolvedValue(null);

      await expect(
        service.update('asset-inexistant', {}, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer un asset existant', async () => {
      mockAssetsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('asset-1', 'user-1');

      expect((result as { affected: number }).affected).toBe(1);
    });

    it('devrait lever NotFoundException si asset introuvable', async () => {
      mockAssetsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.remove('asset-inexistant', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever NotFoundException si asset appartient à un autre utilisateur', async () => {
      mockAssetsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('asset-1', 'user-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
