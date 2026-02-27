import {
  IsString,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory } from '../enums/asset-category.enum';
import { AssetCondition } from '../enums/asset-condition.enum';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsDate()
  @Type(() => Date)
  purchase_date: Date;

  @IsInt()
  @Min(0)
  purchase_price_cents: number;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition: AssetCondition;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  warranty_end_date?: Date;
}
