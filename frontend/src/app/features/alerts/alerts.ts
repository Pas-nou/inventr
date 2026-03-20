import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  TriangleAlert,
  ShieldCheck,
  Laptop,
  Sofa,
  Car,
  WashingMachine,
  Bike,
  Wrench,
  Flower,
  Package,
  LucideIconData,
} from 'lucide-angular';
import { AssetsService, Asset } from '../../core/services/assets.service';

const WARRANTY_ALERT_DAYS = 90;

@Component({
  selector: 'app-alerts',
  imports: [LucideAngularModule, RouterLink, DatePipe],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class AlertsComponent implements OnInit {
  readonly triangleAlert = TriangleAlert;
  readonly shieldCheck = ShieldCheck;

  private readonly categoryIcons: Record<string, LucideIconData> = {
    'High-tech': Laptop,
    Meuble: Sofa,
    Véhicule: Car,
    Électroménager: WashingMachine,
    'Sport & Loisirs': Bike,
    Outil: Wrench,
    Jardin: Flower,
    Autre: Package,
  };

  isLoading = true;
  expiringAssets: Asset[] = [];

  constructor(
    private assetsService: AssetsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assetsService.getAssets().subscribe((response) => {
      this.expiringAssets = response.data
        .filter((a) => this.isWarrantyExpiringSoon(a.warranty_end_date))
        .sort(
          (a, b) =>
            new Date(a.warranty_end_date!).getTime() - new Date(b.warranty_end_date!).getTime(),
        );
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  getCategoryIcon(category: string): LucideIconData {
    return this.categoryIcons[category] ?? Package;
  }

  isWarrantyExpiringSoon(date: string | null): boolean {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < WARRANTY_ALERT_DAYS * 24 * 60 * 60 * 1000;
  }

  warrantyDaysLeft(date: string): number {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
