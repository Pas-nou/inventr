import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterFile } from 'src/common/interfaces/multer-file.interface';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Type de fichier non autorisé. Formats acceptés: PDF, JPEG, PNG, WEBP',
            ),
            false,
          );
        }
      },
    }),
  )
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: MulterFile,
  ) {
    return this.documentsService.create(
      createDocumentDto,
      file,
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
