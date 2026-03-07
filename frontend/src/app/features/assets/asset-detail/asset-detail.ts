import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  ArrowLeft,
  TriangleAlert,
  Laptop,
  LucideIconData,
} from 'lucide-angular';
import { Asset } from '../../../core/services/assets.service';

type ActiveTab = 'infos' | 'documents' | 'maintenance';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetailComponent implements OnInit {
  // Icons
  readonly arrowLeft = ArrowLeft;
  readonly triangleAlert = TriangleAlert;

  readonly categoryIcon: LucideIconData = Laptop; // * Donnée mockée

  // State
  assetId = '';
  activeTab: ActiveTab = 'infos';

  // Tabs
  readonly tabs = [
    { key: 'infos' as const, label: 'Infos' },
    { key: 'documents' as const, label: 'Documents' },
    { key: 'maintenance' as const, label: 'Maintenance' },
  ];

  // Mock data
  asset: Asset = {
    id: '',
    name: 'MacBook Pro M3',
    category: 'High-tech',
    purchase_date: '2024-01-15',
    purchase_price_cents: 249900,
    condition: 'Bon état',
    warranty_end_date: '2026-03-15',
    notes: 'Acheté sur apple.com',
    created_at: '',
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.assetId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  goBack(): void {
    this.location.back();
  }

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  get warrantyDaysLeft(): number {
    if (!this.asset.warranty_end_date) return 0;
    return Math.ceil(
      (new Date(this.asset.warranty_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  }

  isWarrantyExpiringSoon(date: string | null): boolean {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }
}
