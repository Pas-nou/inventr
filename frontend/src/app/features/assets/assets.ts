import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';
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

  firstName = '';
  assets: Asset[] = [];
  warrantyAlerts: string[] = [];
  assetsCount = 0;
  totalValue = 0;

  categories = ['Tous', 'Tech', 'Auto'];
  activeCategory = 'Tous';

  // get assetsCount(): number {
  //   return this.assets.length;
  // }

  // get totalValue(): number {
  //   return this.assets.reduce((sum, a) => sum + a.purchase_price_cents, 0) / 100;
  // }

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

  setCategory(category: string): void {
    this.activeCategory = category;
  }
}
