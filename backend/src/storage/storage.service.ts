import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      configService.get<string>('SUPABASE_URL') ?? '',
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    ) as SupabaseClient;
  }

  async uploadFile(
    file: MulterFile,
    bucket: string,
    path: string,
  ): Promise<string> {
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, blob);
    if (error) {
      throw new InternalServerErrorException('File upload failed');
    }
    return data.path;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new InternalServerErrorException('File deletion failed');
    }
  }
}
