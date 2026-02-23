import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceEventDto } from './create-maintenance-event.dto';

export class UpdateMaintenanceEventDto extends PartialType(CreateMaintenanceEventDto) {}
