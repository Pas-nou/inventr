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
  Pencil,
  Eye,
  Download,
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
  readonly pencil = Pencil;
  readonly eye = Eye;
  readonly download = Download;

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

  // Modal delete document
  showDeleteDocumentModal = false;
  pendingDeleteDocumentId: string | null = null;

  // Modal upload document
  showUploadModal = false;
  pendingFile: File | null = null;
  uploadName = '';
  uploadType = '';

  readonly documentTypes = ['Facture', 'Garantie', 'Manuel', 'Certificat', 'Photo', 'Autre'];

  // Modal edit document
  showEditDocumentModal = false;
  pendingEditDocumentId: string | null = null;
  editDocumentName = '';
  editDocumentType = '';

  // Event modal
  showAddEventModal = false;
  eventName = '';
  eventType = '';
  eventDate = '';
  eventCost = 0;
  eventNotes = '';
  eventNextDueDate = '';

  readonly eventTypes = [
    'Réparation',
    'Entretien',
    'Inspection',
    'Nettoyage',
    'Amélioration',
    'Autre',
  ];

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

  openAddEventModal(): void {
    this.showAddEventModal = true;
    this.eventName = '';
    this.eventType = '';
    this.eventDate = new Date().toISOString().slice(0, 10);
    this.eventCost = 0;
    this.eventNotes = '';
    this.eventNextDueDate = '';
  }

  closeAddEventModal(): void {
    this.showAddEventModal = false;
  }

  confirmAddEvent(): void {
    if (!this.eventName || !this.eventDate) return;
    const payload = {
      name: this.eventName,
      type: this.eventType || undefined,
      date: this.eventDate,
      cost_cents: Math.round(this.eventCost * 100),
      notes: this.eventNotes || undefined,
      next_due_date: this.eventNextDueDate || undefined,
    };
    this.maintenanceEventsService.createMaintenanceEvent(this.assetId, payload).subscribe({
      next: (event) => {
        this.maintenanceEvents = [...this.maintenanceEvents, event];
        this.showAddEventModal = false;
        this.toastService.show('Événement ajouté avec succès');
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show("Erreur lors de l'ajout", 'error'),
    });
  }

  openEditDocumentModal(doc: Document): void {
    this.pendingEditDocumentId = doc.id;
    this.editDocumentName = doc.name;
    this.editDocumentType = doc.type ?? '';
    this.showEditDocumentModal = true;
  }

  closeEditDocumentModal(): void {
    this.showEditDocumentModal = false;
    this.pendingEditDocumentId = null;
  }

  confirmEditDocument(): void {
    if (!this.pendingEditDocumentId || !this.editDocumentName) return;
    this.documentsService
      .updateDocument(this.assetId, this.pendingEditDocumentId, {
        name: this.editDocumentName,
        type: this.editDocumentType || undefined,
      })
      .subscribe({
        next: (updateDoc) => {
          this.documents = this.documents.map((d) => (d.id === updateDoc.id ? updateDoc : d));
          this.showEditDocumentModal = false;
          this.pendingEditDocumentId = null;
          this.toastService.show('Document mis à jour');
          this.cdr.detectChanges();
        },
        error: () => this.toastService.show('Erreur lors de la mise à jour', 'error'),
      });
  }

  openDocument(documentId: string, download = false): void {
    this.documentsService.getSignedUrl(this.assetId, documentId).subscribe({
      next: ({ url }) => {
        const a = document.createElement('a');
        a.href = url;
        if (download) a.download = '';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      },
      error: () => this.toastService.show("Erreur lors de l'ouverture du document", 'error'),
    });
  }
}
