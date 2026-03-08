import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink} from '@angular/router';
import { Location, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  ArrowLeft,
  TriangleAlert,
  Laptop,
  FileText,
  Plus,
  Wrench,
  CalendarClock,
  Package,
  Sofa,
  Car,
  WashingMachine,
  Bike,
  Flower,
  LucideIconData,
} from 'lucide-angular';
import { Asset, AssetsService } from '../../../core/services/assets.service';
import { Document, DocumentsService } from '../../../core/services/documents.service';
import { MaintenanceEvent, MaintenanceEventsService } from '../../../core/services/maintenance-events.service';

type ActiveTab = 'infos' | 'documents' | 'maintenance';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule, DecimalPipe, RouterLink],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetailComponent implements OnInit {
  // Icons
  readonly arrowLeft = ArrowLeft;
  readonly triangleAlert = TriangleAlert;
  readonly fileText = FileText;
  readonly plus = Plus;
  readonly wrench = Wrench;
  readonly calendarClock = CalendarClock;

  private readonly categoryIcons: Record<string, LucideIconData> = {
  'High-tech': Laptop,
  'Meuble': Sofa,
  'Véhicule': Car,
  'Électroménager': WashingMachine,
  'Sport & Loisirs': Bike,
  'Outil': Wrench,
  'Jardin': Flower,
  'Autre': Package,
};

  // State
  assetId = '';
  activeTab: ActiveTab = 'infos';
  asset: Asset | null = null;
  documents: Document[] = [];
  maintenanceEvents: MaintenanceEvent[] = []
  isLoading = true;

  // Tabs
  readonly tabs = [
    { key: 'infos' as const, label: 'Infos' },
    { key: 'documents' as const, label: 'Documents' },
    { key: 'maintenance' as const, label: 'Maintenance' },
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private assetsService: AssetsService,
    private documentsService: DocumentsService,
    private maintenanceEventsService: MaintenanceEventsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assetId = this.route.snapshot.paramMap.get('id') ?? '';

    this.assetsService.getAssetById(this.assetId).subscribe((asset) => {
      this.asset = asset;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.documentsService.getDocuments(this.assetId).subscribe((response) => {
      this.documents = response.data;
      this.cdr.detectChanges();
    });

    this.maintenanceEventsService.getMaintenanceEvents(this.assetId).subscribe((response) => {
      this.maintenanceEvents = response.data;
      this.cdr.detectChanges();
    });
  }

  goBack(): void {
    this.location.back();
  }

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  get warrantyDaysLeft(): number {
    if (!this.asset?.warranty_end_date) return 0;
    return Math.ceil(
      (new Date(this.asset.warranty_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  }

  isWarrantyExpiringSoon(date: string | null): boolean {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }

  get categoryIcon(): LucideIconData {
    return this.categoryIcons[this.asset?.category ?? ''] ?? Package;
  }
}
