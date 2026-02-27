import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { MaintenanceEventsService } from './maintenance-events.service';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { UpdateMaintenanceEventDto } from './dto/update-maintenance-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('maintenance-events')
export class MaintenanceEventsController {
  constructor(
    private readonly maintenanceEventsService: MaintenanceEventsService,
  ) {}

  @Post()
  create(
    @Body() createMaintenanceEventDto: CreateMaintenanceEventDto,
    @Request() req: RequestWithUser,
  ) {
    return this.maintenanceEventsService.create(
      createMaintenanceEventDto,
      createMaintenanceEventDto.assetId,
      req.user.userId,
    );
  }

  @Get('asset/:assetId')
  findAll(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Request() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.maintenanceEventsService.findAll(
      assetId,
      req.user.userId,
      page,
      limit,
    );
  }

  @Get('asset/:assetId/:id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.maintenanceEventsService.findOne(id, assetId, req.user.userId);
  }

  @Patch('asset/:assetId/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Request() req: RequestWithUser,
    @Body() updateMaintenanceEventDto: UpdateMaintenanceEventDto,
  ) {
    return this.maintenanceEventsService.update(
      id,
      updateMaintenanceEventDto,
      assetId,
      req.user.userId,
    );
  }

  @Delete('asset/:assetId/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.maintenanceEventsService.remove(id, assetId, req.user.userId);
  }
}
