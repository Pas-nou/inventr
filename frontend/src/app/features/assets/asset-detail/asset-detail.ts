import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Asset } from '../../../core/services/assets.service';

type ActiveTab = 'infos' | 'documents' | 'maintenance';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetailComponent implements OnInit {
  // State
  assetId = '';
  activeTab: ActiveTab = 'infos';

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
}
