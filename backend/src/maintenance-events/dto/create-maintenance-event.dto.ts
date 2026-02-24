import {
  IsEnum,
  IsUUID,
  IsDate,
  IsOptional,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceEventType } from '../enums/maintenance-event-type.enum';
export class CreateMaintenanceEventDto {
  @IsEnum(MaintenanceEventType)
  type: MaintenanceEventType;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  @IsOptional()
  cost_cents?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  next_due_date?: Date;

  @IsUUID()
  assetId: string;
}
