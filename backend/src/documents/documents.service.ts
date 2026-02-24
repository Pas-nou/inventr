import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, assetId: string) {
    return await this.documentRepository.save({
      ...createDocumentDto,
      asset: { id: assetId },
    });
  }

  async findAll(assetId: string) {
    return await this.documentRepository.find({
      where: { asset: { id: assetId } },
    });
  }

  async findOne(id: string, assetId: string) {
    return await this.documentRepository.findOne({
      where: { id, asset: { id: assetId } },
    });
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    assetId: string,
  ) {
    return await this.documentRepository.update(
      { id, asset: { id: assetId } },
      updateDocumentDto,
    );
  }

  async remove(id: string, assetId: string) {
    return await this.documentRepository.delete({ id, asset: { id: assetId } });
  }
}
