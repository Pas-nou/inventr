import { Module } from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { MaintenanceEventsController } from './maintenance-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceEvent } from './entities/maintenance-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceEvent])],
  controllers: [MaintenanceEventsController],
  providers: [MaintenanceEventsService],
})
export class MaintenanceEventsModule {}
