import { Module } from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { MaintenanceEventsController } from './maintenance-events.controller';

@Module({
  controllers: [MaintenanceEventsController],
  providers: [MaintenanceEventsService],
})
export class MaintenanceEventsModule {}
