import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertsStateService {
  private _count = new BehaviorSubject<number>(0);
  count$ = this._count.asObservable();

  setCount(count: number): void {
    this._count.next(count);
  }
}