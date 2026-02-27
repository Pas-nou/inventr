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
  Query,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterFile } from 'src/common/interfaces/multer-file.interface';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

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
          'image/webp',
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
    @Request() req: RequestWithUser,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    return this.documentsService.create(
      createDocumentDto,
      file,
      createDocumentDto.assetId,
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
    return this.documentsService.findAll(assetId, req.user.userId, page, limit);
  }

  @Get('asset/:assetId/:id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.documentsService.findOne(id, assetId, req.user.userId);
  }

  @Patch('asset/:assetId/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.documentsService.update(
      id,
      updateDocumentDto,
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
    return this.documentsService.remove(id, assetId, req.user.userId);
  }
}
