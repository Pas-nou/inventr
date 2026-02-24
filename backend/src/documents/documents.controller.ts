import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(
      createDocumentDto,
      createDocumentDto.assetId,
    );
  }

  @Get('asset/:assetId')
  findAll(@Param('assetId') assetId: string) {
    return this.documentsService.findAll(assetId);
  }

  @Get('asset/:assetId/:id')
  findOne(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.documentsService.findOne(id, assetId);
  }

  @Patch('asset/:assetId/:id')
  update(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, updateDocumentDto, assetId);
  }

  @Delete('asset/:assetId/:id')
  remove(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.documentsService.remove(id, assetId);
  }
}
