import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';

@Controller('maintenance-events')
export class MaintenanceEventsController {
  constructor(private readonly maintenanceEventsService: MaintenanceEventsService) {}

  @Post()
  create(@Body() createMaintenanceEventDto: CreateMaintenanceEventDto) {
    return this.maintenanceEventsService.create(createMaintenanceEventDto);
  }

  @Get()
  findAll() {
    return this.maintenanceEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceEventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaintenanceEventDto: UpdateMaintenanceEventDto) {
    return this.maintenanceEventsService.update(+id, updateMaintenanceEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceEventsService.remove(+id);
  }
}
