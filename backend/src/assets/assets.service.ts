import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  /**
   * Returns the total count of assets and documents for a given user.
   * Uses a QueryBuilder for documents to traverse the asset→user relation.
   */
  async getStats(
    userId: string,
  ): Promise<{ assetsCount: number; documentsCount: number }> {
    const assetsCount = await this.assetsRepository.count({
      where: { user: { id: userId } },
    });

    const documentsCount = await this.documentsRepository
      .createQueryBuilder('document')
      .innerJoin('document.asset', 'asset')
      .innerJoin('asset.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();

    return { assetsCount, documentsCount };
  }

  async create(createAssetDto: CreateAssetDto, userId: string) {
    return await this.assetsRepository.save({
      ...createAssetDto,
      user: { id: userId },
    });
  }

  /**
   * Returns a paginated list of assets for a given user.
   * Supports search by name, and sorting by name, price, purchase date, or warranty.
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    limit = Math.min(limit, 100);

    const allowedSortFields: Record<string, string> = {
      name: 'asset.name',
      price: 'asset.purchase_price_cents',
      purchase_date: 'asset.purchase_date',
      warranty_end_date: 'asset.warranty_end_date',
      created_at: 'asset.created_at',
    };

    const orderField = allowedSortFields[sortBy ?? ''] ?? 'asset.created_at';

    const qb = this.assetsRepository
      .createQueryBuilder('asset')
      .where('asset.user = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit);

    if (sortBy === 'warranty_end_date') {
      qb.orderBy(
        `CASE 
    WHEN ${orderField} IS NULL THEN 2
    WHEN ${orderField} < NOW() THEN 1
    ELSE 0
  END`,
        'ASC',
      ).addOrderBy(orderField, sortOrder);
    } else {
      qb.orderBy(orderField, sortOrder);
    }
    if (search?.trim()) {
      qb.andWhere('asset.name ILIKE :search', { search: `%${search.trim()}%` });
    }

    const [data, total] = await qb.getManyAndCount();

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

  async findOne(id: string, userId: string) {
    const asset = await this.assetsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!asset) throw new NotFoundException(`Bien ${id} introuvable`);
    return asset;
  }

  /**
   * Uses TypeORM preload to merge the DTO with the existing entity before saving.
   * Ownership is enforced by including userId in the preload query.
   */
  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string) {
    const asset = await this.assetsRepository.preload({
      id,
      ...updateAssetDto,
      user: { id: userId },
    });
    if (!asset) throw new NotFoundException(`Bien ${id} introuvable`);
    return await this.assetsRepository.save(asset);
  }

  async remove(id: string, userId: string) {
    const result = await this.assetsRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0)
      throw new NotFoundException(`Bien ${id} introuvable`);
    return result;
  }
}
