import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceEventsController } from './maintenance-events.controller';
import { MaintenanceEventsService } from './maintenance-events.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

const mockMaintenanceEventsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockRequest = {
  user: { userId: 'uuid-1', email: 'john@inventr.app' },
} as unknown as RequestWithUser;

const mockEvent = {
  id: 'event-1',
  name: 'Vidange',
  type: 'Entretien',
  date: '2024-01-01',
  cost_cents: 5000,
  notes: null,
  next_due_date: null,
};

describe('MaintenanceEventsController', () => {
  let controller: MaintenanceEventsController;
  let maintenanceEventsService: typeof mockMaintenanceEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceEventsController],
      providers: [
        {
          provide: MaintenanceEventsService,
          useValue: mockMaintenanceEventsService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceEventsController>(
      MaintenanceEventsController,
    );
    maintenanceEventsService = module.get(MaintenanceEventsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('devrait créer un événement de maintenance', async () => {
      const dto: CreateMaintenanceEventDto = {
        name: 'Vidange',
        date: new Date('2024-01-01'),
        cost_cents: 5000,
        assetId: 'asset-1',
      };
      maintenanceEventsService.create.mockResolvedValue(mockEvent);

      const result = await controller.create('asset-1', dto, mockRequest);

      expect(maintenanceEventsService.create).toHaveBeenCalledWith(
        dto,
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockEvent);
    });
  });

  // -------------------------
  // findAll
  // -------------------------
  describe('findAll', () => {
    it('devrait retourner la liste des événements', async () => {
      const mockResponse = {
        data: [mockEvent],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      maintenanceEventsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('asset-1', mockRequest, 1, 10);

      expect(maintenanceEventsService.findAll).toHaveBeenCalledWith(
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
    it('devrait retourner un événement par id', async () => {
      maintenanceEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne(
        'event-1',
        'asset-1',
        mockRequest,
      );

      expect(maintenanceEventsService.findOne).toHaveBeenCalledWith(
        'event-1',
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockEvent);
    });
  });

  // -------------------------
  // update
  // -------------------------
  describe('update', () => {
    it('devrait mettre à jour un événement', async () => {
      const dto: UpdateMaintenanceEventDto = { name: 'Vidange complète' };
      const updatedEvent = { ...mockEvent, name: 'Vidange complète' };
      maintenanceEventsService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update(
        'event-1',
        'asset-1',
        mockRequest,
        dto,
      );

      expect(maintenanceEventsService.update).toHaveBeenCalledWith(
        'event-1',
        dto,
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(updatedEvent);
    });
  });

  // -------------------------
  // remove
  // -------------------------
  describe('remove', () => {
    it('devrait supprimer un événement', async () => {
      maintenanceEventsService.remove.mockResolvedValue(mockEvent);

      const result = await controller.remove('event-1', 'asset-1', mockRequest);

      expect(maintenanceEventsService.remove).toHaveBeenCalledWith(
        'event-1',
        'asset-1',
        'uuid-1',
      );
      expect(result).toBe(mockEvent);
    });
  });
});
