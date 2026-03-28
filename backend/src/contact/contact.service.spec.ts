import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { EmailService } from '../email/email.service';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: EmailService,
          useValue: {
            sendContactEmail: jest
              .fn<Promise<void>, []>()
              .mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
