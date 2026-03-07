import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  LucideIconData,
} from 'lucide-angular';
import { Asset, AssetsService } from '../../../core/services/assets.service';
import { Document, DocumentsService } from '../../../core/services/documents.service';
import { MaintenanceEvent, MaintenanceEventsService } from '../../../core/services/maintenance-events.service';

type ActiveTab = 'infos' | 'documents' | 'maintenance';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule, DecimalPipe],
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

  readonly categoryIcon: LucideIconData = Laptop; // * Donnée mockée

  // State
  assetId = '';
  activeTab: ActiveTab = 'infos';
  asset: Asset | null = null;
  documents: Document[] = [];
  maintenanceEvents: MaintenanceEvent[] = []

  // Tabs
  readonly tabs = [
    { key: 'infos' as const, label: 'Infos' },
    { key: 'documents' as const, label: 'Documents' },
    { key: 'maintenance' as const, label: 'Maintenance' },
  ];

  // ------ Mock data
  // documents = [
  //   {
  //     id: '1',
  //     name: "Facture d'achat",
  //     type: 'Facture',
  //     size: '245 Ko',
  //     date: '2024-01-15',
  //   },
  //   {
  //     id: '2',
  //     name: 'Certificat de garantie',
  //     type: 'Garantie',
  //     size: '120 Ko',
  //     date: '2024-01-15',
  //   },
  //   {
  //     id: '3',
  //     name: 'Manuel utilisateur',
  //     type: 'Manuel',
  //     size: '8,4 Mo',
  //     date: '2024-01-15',
  //   },
  // ];

  // maintenanceEvents = [
  //   {
  //     id: '1',
  //     type: 'Entretien',
  //     name: 'Nettoyage ventilateurs',
  //     date: '2024-06-12',
  //     cost_cents: 5000,
  //     notes: 'Nettoyage complet poussières internes',
  //     next_due_date: '2025-06-01',
  //   },
  //   {
  //     id: '2',
  //     type: 'Réparation',
  //     name: 'Remplacement SSD',
  //     date: '2024-03-03',
  //     cost_cents: 32000,
  //     notes: 'SSD 1To remplacé par 2To',
  //     next_due_date: null,
  //   },
  //   {
  //     id: '3',
  //     type: 'Inspection',
  //     name: 'Diagnostic général',
  //     date: '2024-01-15',
  //     cost_cents: 0,
  //     notes: null,
  //     next_due_date: null,
  //   },
  // ];

  // --------

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
}
