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

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private readonly apiUrl = `${environment.apiUrl}/assets`;

  constructor(private http: HttpClient) {}

  getAssets(page: number = 1, limit: number = 100): Observable<AssetsResponse> {
    return this.http.get<AssetsResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
