import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
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
    return (data as { path: string }).path;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new InternalServerErrorException('File deletion failed');
    }
  }
}
