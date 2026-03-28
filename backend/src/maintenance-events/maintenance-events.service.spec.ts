import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceEventsService } from './maintenance-events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaintenanceEvent } from './entities/maintenance-event.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MaintenanceEventType } from './enums/maintenance-event-type.enum';

const mockMaintenanceEvent = {
  id: 'event-1',
  name: 'Vidange',
  type: 'Entretien',
  date: new Date('2024-01-01'),
  cost_cents: 5000,
  notes: null,
  next_due_date: null,
  created_at: new Date(),
};

const mockAsset = {
  id: 'asset-1',
  user: { id: 'user-1' },
};

const mockMaintenanceEventsRepository = {
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAssetRepository = {
  findOne: jest.fn(),
};

describe('MaintenanceEventsService', () => {
  let service: MaintenanceEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceEventsService,
        {
          provide: getRepositoryToken(MaintenanceEvent),
          useValue: mockMaintenanceEventsRepository,
        },
        {
          provide: getRepositoryToken(Asset),
          useValue: mockAssetRepository,
        },
      ],
    }).compile();

    service = module.get<MaintenanceEventsService>(MaintenanceEventsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it("devrait créer un événement si asset appartient à l'utilisateur", async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.save.mockResolvedValue(
        mockMaintenanceEvent,
      );

      const result = await service.create(
        {
          name: 'Vidange',
          type: MaintenanceEventType.SERVICE,
          date: new Date(),
          cost_cents: 5000,
          notes: undefined,
          next_due_date: undefined,
          assetId: 'asset-1',
        },
        'asset-1',
        'user-1',
      );

      expect(result).toEqual(mockMaintenanceEvent);
      expect(mockMaintenanceEventsRepository.save).toHaveBeenCalledTimes(1);
    });

    it("devrait lever ForbiddenException si asset n'appartient pas à l'utilisateur", async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'Vidange',
            type: MaintenanceEventType.SERVICE,
            date: new Date(),
            cost_cents: 5000,
            notes: undefined,
            next_due_date: undefined,
            assetId: 'asset-1',
          },
          'asset-1',
          'user-2',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMaintenanceEventsRepository.save).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    it('devrait retourner les événements paginés', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.findAndCount.mockResolvedValue([
        [mockMaintenanceEvent],
        1,
      ]);

      const result = await service.findAll('asset-1', 'user-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
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
    it('devrait retourner un événement existant', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.findOne.mockResolvedValue(
        mockMaintenanceEvent,
      );

      const result = await service.findOne('event-1', 'asset-1', 'user-1');

      expect(result).toEqual(mockMaintenanceEvent);
    });

    it('devrait lever NotFoundException si événement introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('event-inexistant', 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('event-1', 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un événement existant', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        'event-1',
        { name: 'Vidange modifiée' },
        'asset-1',
        'user-1',
      );

      expect((result as { affected: number }).affected).toBe(1);
    });

    it('devrait lever NotFoundException si événement introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('event-inexistant', {}, 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('event-1', {}, 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer un événement existant', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('event-1', 'asset-1', 'user-1');

      expect((result as { affected: number }).affected).toBe(1);
    });

    it('devrait lever NotFoundException si événement introuvable', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockMaintenanceEventsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.remove('event-inexistant', 'asset-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si accès non autorisé', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('event-1', 'asset-1', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
