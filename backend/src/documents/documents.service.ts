import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Asset } from '../assets/entities/asset.entity';
import { StorageService } from '../storage/storage.service';
import { randomUUID } from 'crypto';
import { MulterFile } from '../common/interfaces/multer-file.interface';

@Injectable()
export class DocumentsService {
  private readonly BUCKET = 'documents';

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Verifies that the asset belongs to the user before any operation.
   * Throws ForbiddenException if the asset is not found or does not belong to the user.
   */
  private async verifyAssetOwnership(
    assetId: string,
    userId: string,
  ): Promise<void> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, user: { id: userId } },
    });
    if (!asset)
      throw new ForbiddenException('Bien introuvable ou accès non autorisé');
  }

  /**
   * Upload a file to Supabase Storage and save the document metadata to the database.
   * The filename is sanitized to remove accents and special characters.
   */
  async create(
    createDocumentDto: CreateDocumentDto,
    file: MulterFile,
    assetId: string,
    userId: string,
  ) {
    await this.verifyAssetOwnership(assetId, userId);
    const sanitizeName = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${randomUUID()}-${sanitizeName}`;
    const storageKey = await this.storageService.uploadFile(
      file,
      this.BUCKET,
      filePath,
    );
    return await this.documentRepository.save({
      name: createDocumentDto.documentName ?? file.originalname,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      storage_key: storageKey,
      type: createDocumentDto.type,
      asset: { id: assetId },
    });
  }

  /**
   * Returns a paginated list of documents for a given asset.
   */
  async findAll(
    assetId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    limit = Math.min(limit, 100);
    await this.verifyAssetOwnership(assetId, userId);
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

  async findOne(id: string, assetId: string, userId: string) {
    await this.verifyAssetOwnership(assetId, userId);
    const document = await this.documentRepository.findOne({
      where: { id, asset: { id: assetId } },
    });
    if (!document) throw new NotFoundException(`Document ${id} introuvable`);
    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    assetId: string,
    userId: string,
  ) {
    await this.verifyAssetOwnership(assetId, userId);
    const result = await this.documentRepository.update(
      { id, asset: { id: assetId } },
      {
        name: updateDocumentDto.name,
        type: updateDocumentDto.type,
      },
    );
    if (result.affected === 0)
      throw new NotFoundException(`Document ${id} introuvable`);
    return this.findOne(id, assetId, userId);
  }

  async remove(id: string, assetId: string, userId: string) {
    await this.verifyAssetOwnership(assetId, userId);

    // Retrieve the document to get the storage_key before deletion
    const document = await this.documentRepository.findOne({
      where: { id, asset: { id: assetId } },
    });
    if (!document) throw new NotFoundException(`Document ${id} introuvable`);

    // Delete the file from Supabase Storage
    await this.storageService.deleteFile(this.BUCKET, document.storage_key);

    // Delete from database
    await this.documentRepository.delete({
      id,
      asset: { id: assetId },
    });
    return document;
  }

  /**
   * Returns a temporary signed URL to access a document from Supabase Storage.
   * The URL expires after 60 seconds by default.
   */
  async getSignedUrl(
    id: string,
    assetId: string,
    userId: string,
  ): Promise<{ url: string }> {
    const document = await this.findOne(id, assetId, userId);
    const url = await this.storageService.getSignedUrl(
      this.BUCKET,
      document.storage_key,
    );
    return { url };
  }
}
