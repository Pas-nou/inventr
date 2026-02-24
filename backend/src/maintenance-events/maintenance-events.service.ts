import { Injectable } from '@nestjs/common';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceEvent } from './entities/maintenance-event.entity';

@Injectable()
export class MaintenanceEventsService {
  constructor(
    @InjectRepository(MaintenanceEvent)
    private maintenanceEventsRepository: Repository<MaintenanceEvent>,
  ) {}

  async create(
    createMaintenanceEventDto: CreateMaintenanceEventDto,
    assetId: string,
  ) {
    return await this.maintenanceEventsRepository.save({
      ...createMaintenanceEventDto,
      asset: { id: assetId },
    });
  }

  async findAll(assetId: string) {
    return await this.maintenanceEventsRepository.find({
      where: { asset: { id: assetId } },
    });
  }

  async findOne(id: string, assetId: string) {
    return await this.maintenanceEventsRepository.findOne({
      where: { id, asset: { id: assetId } },
    });
  }

  async update(
    id: string,
    updateMaintenanceEventDto: UpdateMaintenanceEventDto,
    assetId: string,
  ) {
    return await this.maintenanceEventsRepository.update(
      { id, asset: { id: assetId } },
      updateMaintenanceEventDto,
    );
  }

  async remove(id: string, assetId: string) {
    return await this.maintenanceEventsRepository.delete({
      id,
      asset: { id: assetId },
    });
  }
}
