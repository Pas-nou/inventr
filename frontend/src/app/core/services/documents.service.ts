import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Document {
  id: string;
  name: string;
  type: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string,
  created_at: string;
}

export interface DocumentsResponse {
  data: Document[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(assetId: string): Observable<DocumentsResponse> {
    return this.http.get<DocumentsResponse>(`${this.apiUrl}/asset/${assetId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }

  uploadDocument(assetId: string, file: File, name?: string, type?: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('documentName', name);
    if (type) formData.append('type', type);
    return this.http.post<Document>(`${this.apiUrl}/asset/${assetId}`, formData);
  }

  deleteDocument(assetId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/asset/${assetId}/${documentId}`);
  }

  updateDocument(assetId: string, documentId: string, payload: { name?: string; type?: string }): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/asset/${assetId}/${documentId}`, payload);
  }
}
