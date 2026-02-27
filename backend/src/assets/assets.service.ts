import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
  ) {}

  async create(createAssetDto: CreateAssetDto, userId: string) {
    return await this.assetsRepository.save({
      ...createAssetDto,
      user: { id: userId },
    });
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.assetsRepository.findAndCount({
      where: { user: { id: userId } },
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

  async findOne(id: string, userId: string) {
    const asset = await this.assetsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!asset) throw new NotFoundException(`Bien ${id} introuvable`);
    return asset;
  }

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
