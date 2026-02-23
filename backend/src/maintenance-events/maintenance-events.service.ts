import { Injectable } from '@nestjs/common';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';

@Injectable()
export class MaintenanceEventsService {
  create(createMaintenanceEventDto: CreateMaintenanceEventDto) {
    return 'This action adds a new maintenanceEvent';
  }

  findAll() {
    return `This action returns all maintenanceEvents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} maintenanceEvent`;
  }

  update(id: number, updateMaintenanceEventDto: UpdateMaintenanceEventDto) {
    return `This action updates a #${id} maintenanceEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} maintenanceEvent`;
  }
}
