import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;
}
