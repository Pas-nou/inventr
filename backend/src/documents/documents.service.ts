import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { StorageService } from 'src/storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: MulterFile,
    assetId: string,
  ) {
    const filePath = `${uuidv4()}-${file.originalname}`;
    const storageKey = await this.storageService.uploadFile(
      file,
      'documents',
      filePath,
    );
    return await this.documentRepository.save({
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      storage_key: storageKey,
      type: createDocumentDto.type,
      asset: { id: assetId },
    });
  }

  async findAll(assetId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.documentRepository.findAndCount({
      where: { asset: { id: assetId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
