import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, TriangleAlert, ChevronDown, ChevronUp } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AssetsService, Asset } from '../../core/services/assets.service';
@Component({
  selector: 'app-assets',
  imports: [CurrencyPipe, LucideAngularModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent implements OnInit {
  triangleAlert = TriangleAlert;
  chevronDown = ChevronDown;
  chevronUp = ChevronUp;

  firstName = '';
  assets: Asset[] = [];
  warrantyAlerts: string[] = [];
  assetsCount = 0;
  totalValue = 0;

  categories = [
    'Tous',
    'High-tech',
    'Meuble',
    'Véhicule',
    'Électroménager',
    'Sport & Loisirs',
    'Outil',
    'Jardin',
    'Vêtement & Accessoire',
    'Autre',
  ];
  activeCategory = 'Tous';

  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.isDropdownOpen = false;
  }

  constructor(
    private authService: AuthService,
    private assetsService: AssetsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) this.firstName = user.first_name;

    this.assetsService.getAssets().subscribe((response) => {
      this.assets = [...response.data];
      this.assetsCount = this.assets.length;
      this.totalValue = this.assets.reduce((sum, a) => sum + a.purchase_price_cents, 0) / 100;
      this.warrantyAlerts = response.data
        .filter((a) => this.isWarrantyExpiringSoon(a.warranty_end_date))
        .map((a) => a.name);
      this.cdr.detectChanges();
    });
  }

  isWarrantyExpiringSoon(date: string | null): boolean {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }
}
