import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MaintenanceEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  cost_cents: number;
  notes: string | null;
  next_due_date: string | null;
}

export interface MaintenanceEventsResponse {
  data: MaintenanceEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class MaintenanceEventsService {
  private readonly apiUrl = `${environment.apiUrl}/maintenance-events`;

  constructor(private http: HttpClient) {}

  getMaintenanceEvents(assetId: string): Observable<MaintenanceEventsResponse> {
    return this.http.get<MaintenanceEventsResponse>(`${this.apiUrl}/asset/${assetId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }

  createMaintenanceEvent(
    assetId: string,
    payload: {
      name: string;
      type?: string;
      date: string;
      cost_cents: number;
      notes?: string;
      next_due_date: string;
    },
  ): Observable<MaintenanceEvent> {
    return this.http.post<MaintenanceEvent>(`${this.apiUrl}/asset/${assetId}`, payload);
  }
}
