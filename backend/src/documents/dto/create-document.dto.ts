import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsUUID()
  assetId: string;
}
