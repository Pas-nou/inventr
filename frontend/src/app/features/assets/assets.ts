import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  LucideIconData,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  Laptop,
  Sofa,
  Car,
  WashingMachine,
  Bike,
  Wrench,
  Flower,
  Shirt,
  Package,
  Plus,
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AssetsService, Asset } from '../../core/services/assets.service';
import { Router, RouterLink } from '@angular/router';
import { AlertsStateService } from '../../core/services/alerts-state.service';

const WARRANTY_ALERT_DAYS = 30;

@Component({
  selector: 'app-assets',
  imports: [CurrencyPipe, LucideAngularModule, RouterLink, DatePipe],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent implements OnInit {
  // Icons
  readonly triangleAlert = TriangleAlert;
  readonly chevronDown = ChevronDown;
  readonly chevronUp = ChevronUp;
  readonly package = Package;
  readonly plus = Plus;

  // State
  firstName = '';
  assets: Asset[] = [];
  warrantyAlerts: string[] = [];
  assetsCount = 0;
  totalValue = 0;
  documentsCount: number | null = null;
  activeCategory = 'Tous';
  isDropdownOpen = false;
  isLoading = true;

  // Category config
  readonly categories = [
    'Tous',
    'High-tech',
    'Meuble',
    'Véhicule',
    'Électroménager',
    'Sport & Loisirs',
    'Outil',
    'Jardin',
    'Autre',
  ];

  private readonly categoryIcons: Record<string, LucideIconData> = {
    'High-tech': Laptop,
    Meuble: Sofa,
    Véhicule: Car,
    Électroménager: WashingMachine,
    'Sport & Loisirs': Bike,
    Outil: Wrench,
    Jardin: Flower,
    'Vêtement & Accessoire': Shirt,
    Autre: Package,
  };

  constructor(
    private authService: AuthService,
    private assetsService: AssetsService,
    private cdr: ChangeDetectorRef,
    private alertsStateService: AlertsStateService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) this.firstName = user.first_name;

    this.assetsService.getAssets().subscribe({
      next: (response) => {
        this.assets = [...response.data];
        this.assetsCount = this.assets.length;
        this.totalValue = this.assets.reduce((sum, a) => sum + a.purchase_price_cents, 0) / 100;
        this.warrantyAlerts = response.data
          .filter((a) => this.isWarrantyExpiringSoon(a.warranty_end_date))
          .map((a) => a.name);
        this.isLoading = false;
        this.alertsStateService.setCount(this.warrantyAlerts.length);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.assetsService.getStats().subscribe({
      next: (stats) => {
        this.documentsCount = stats.documentsCount;
        this.cdr.detectChanges();   
      },
      error: () => {
        this.documentsCount = 0;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredAssets(): Asset[] {
    if (this.activeCategory === 'Tous') return this.assets;
    return this.assets.filter((a) => a.category === this.activeCategory);
  }

  getCategoryIcon(category: string): LucideIconData {
    return this.categoryIcons[category] ?? Package;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.isDropdownOpen = false;
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
