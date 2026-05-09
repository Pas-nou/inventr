import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Asset {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_price_cents: number;
  condition: string;
  warranty_end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface AssetsResponse {
  data: Asset[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssetsStats {
  assetsCount: number;
  documentsCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private readonly apiUrl = `${environment.apiUrl}/assets`;

  constructor(private http: HttpClient) {}

  getAssets(page: number = 1, limit: number = 100, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Observable<AssetsResponse> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search?.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (sortOrder) url += `&sortOrder=${sortOrder}`;
    return this.http.get<AssetsResponse>(url, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }

  getAssetById(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${id}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }

  createAsset(payload: Partial<Asset>): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, payload);
  }

  updateAsset(id: string, payload: Partial<Asset>): Observable<Asset> {
    return this.http.patch<Asset>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAsset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<AssetsStats> {
    return this.http.get<AssetsStats>(`${this.apiUrl}/stats`);
  }
}
