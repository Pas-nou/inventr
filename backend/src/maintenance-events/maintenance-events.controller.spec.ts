import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceEventsController } from './maintenance-events.controller';
import { MaintenanceEventsService } from './maintenance-events.service';

describe('MaintenanceEventsController', () => {
  let controller: MaintenanceEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceEventsController],
      providers: [
        {
          provide: MaintenanceEventsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MaintenanceEventsController>(
      MaintenanceEventsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
