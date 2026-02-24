import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('maintenance-events')
export class MaintenanceEventsController {
  constructor(
    private readonly maintenanceEventsService: MaintenanceEventsService,
  ) {}

  @Post()
  create(@Body() createMaintenanceEventDto: CreateMaintenanceEventDto) {
    return this.maintenanceEventsService.create(
      createMaintenanceEventDto,
      createMaintenanceEventDto.assetId,
    );
  }

  @Get('asset/:assetId')
  findAll(@Param('assetId') assetId: string) {
    return this.maintenanceEventsService.findAll(assetId);
  }

  @Get('asset/:assetId/:id')
  findOne(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.maintenanceEventsService.findOne(id, assetId);
  }

  @Patch('asset/:assetId/:id')
  update(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @Body() updateMaintenanceEventDto: UpdateMaintenanceEventDto,
  ) {
    return this.maintenanceEventsService.update(
      id,
      updateMaintenanceEventDto,
      assetId,
    );
  }

  @Delete('asset/:assetId/:id')
  remove(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.maintenanceEventsService.remove(id, assetId);
  }
}
