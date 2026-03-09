import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  Trash,
  LucideIconData,
} from 'lucide-angular';
import { Asset, AssetsService } from '../../../core/services/assets.service';
import { Document, DocumentsService } from '../../../core/services/documents.service';
import {
  MaintenanceEvent,
  MaintenanceEventsService,
} from '../../../core/services/maintenance-events.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

type ActiveTab = 'infos' | 'documents' | 'maintenance';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule, DecimalPipe, RouterLink, FormsModule],
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
  readonly trash = Trash;

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

  // State
  assetId = '';
  activeTab: ActiveTab = 'infos';
  asset: Asset | null = null;
  documents: Document[] = [];
  maintenanceEvents: MaintenanceEvent[] = [];
  isLoading = true;

  // Modal delete file
  showDeleteDocumentModal = false;
  pendingDeleteDocumentId: string | null = null;

  // Modal upload
  showUploadModal = false;
  pendingFile: File | null = null;
  uploadName = '';
  uploadType = '';

  readonly documentTypes = ['Facture', 'Garantie', 'Manuel', 'Certificat', 'Photo', 'Autre'];

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
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
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

  openFilePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf, .doc, .docx, .jpg, .jpeg, .png, .webp';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.pendingFile = file;
        this.uploadName = file.name.replace(/\.[^/.]+$/, '');
        this.uploadType = '';
        this.showUploadModal = true;
        this.cdr.detectChanges();
      }
    };
    input.click();
  }

  uploadDocument(file: File): void {
    this.documentsService.uploadDocument(this.assetId, file).subscribe({
      next: (doc) => {
        this.documents = [...this.documents, doc];
        this.showUploadModal = false;
        this.pendingFile = null;
        this.toastService.show('Document ajouté avec succès');
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show("Erreur lors de l'upload", 'error'),
    });
  }

  confirmUpload(): void {
    if (!this.pendingFile) return;
    this.documentsService
      .uploadDocument(this.assetId, this.pendingFile, this.uploadName, this.uploadType || undefined)
      .subscribe({
        next: (doc) => {
          this.documents = [...this.documents, doc];
          this.showUploadModal = false;
          this.pendingFile = null;
          this.toastService.show('Document ajouté avec succès');
          this.cdr.detectChanges();
        },
        error: () => this.toastService.show("Erreur lors de l'upload", 'error'),
      });
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.pendingFile = null;
  }

  openDeleteDocumentModal(documentId: string) {
    this.pendingDeleteDocumentId = documentId;
    this.showDeleteDocumentModal = true;
  }

  closeDeleteDocumentModal(): void {
    this.showDeleteDocumentModal = false;
    this.pendingDeleteDocumentId = null;
  }

  confirmDeleteDocument(): void {
    if (!this.pendingDeleteDocumentId) return;
    this.documentsService.deleteDocument(this.assetId, this.pendingDeleteDocumentId).subscribe({
      next: () => {
        this.documents = this.documents.filter(
          (d: Document) => d.id !== this.pendingDeleteDocumentId,
        );
        this.showDeleteDocumentModal = false;
        this.pendingDeleteDocumentId = null;
        this.toastService.show('Document supprimé');
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur lors de la suppression', 'error'),
    });
  }
}
