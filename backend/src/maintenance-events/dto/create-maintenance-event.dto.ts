import {
  IsEnum,
  IsUUID,
  IsDate,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceEventType } from '../enums/maintenance-event-type.enum';
export class CreateMaintenanceEventDto {
  @IsEnum(MaintenanceEventType)
  type: MaintenanceEventType;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsInt()
  @Min(0)
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
