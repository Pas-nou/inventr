import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceEvent } from './entities/maintenance-event.entity';
import { Asset } from '../assets/entities/asset.entity';

@Injectable()
export class MaintenanceEventsService {
  constructor(
    @InjectRepository(MaintenanceEvent)
    private maintenanceEventsRepository: Repository<MaintenanceEvent>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

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

  async create(
    createMaintenanceEventDto: CreateMaintenanceEventDto,
    assetId: string,
    userId: string,
  ) {
    await this.verifyAssetOwnership(assetId, userId);
    return await this.maintenanceEventsRepository.save({
      ...createMaintenanceEventDto,
      asset: { id: assetId },
    });
  }

  async findAll(
    assetId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    limit = Math.min(limit, 100);
    await this.verifyAssetOwnership(assetId, userId);
    const [data, total] = await this.maintenanceEventsRepository.findAndCount({
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
    const event = await this.maintenanceEventsRepository.findOne({
      where: { id, asset: { id: assetId } },
    });
    if (!event) throw new NotFoundException(`Événement ${id} introuvable`);
    return event;
  }

  async update(
    id: string,
    updateMaintenanceEventDto: UpdateMaintenanceEventDto,
    assetId: string,
    userId: string,
  ) {
    await this.verifyAssetOwnership(assetId, userId);
    const result = await this.maintenanceEventsRepository.update(
      { id, asset: { id: assetId } },
      updateMaintenanceEventDto,
    );
    if (result.affected === 0)
      throw new NotFoundException(`Événement ${id} introuvable`);
    return result;
  }

  async remove(id: string, assetId: string, userId: string) {
    await this.verifyAssetOwnership(assetId, userId);
    const result = await this.maintenanceEventsRepository.delete({
      id,
      asset: { id: assetId },
    });
    if (result.affected === 0)
      throw new NotFoundException(`Événement ${id} introuvable`);
    return result;
  }
}
