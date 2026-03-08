import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  LucideIconData,
  X,
  ArrowLeft,
  Laptop,
  Sofa,
  Car,
  WashingMachine,
  Bike,
  Wrench,
  Flower,
  Package,
} from 'lucide-angular';
import { AssetsService } from '../../core/services/assets.service';

type AssetCategory =
  | 'High-tech'
  | 'Meuble'
  | 'Véhicule'
  | 'Électroménager'
  | 'Sport & Loisirs'
  | 'Outil'
  | 'Jardin'
  | 'Autre';
type AssetCondition = 'Neuf' | 'Bon état' | 'Usé';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
})
export class AssetFormComponent implements OnInit {
  // Icons
  readonly x = X;
  readonly arrowLeft = ArrowLeft;

  readonly categoryIcons: Record<string, LucideIconData> = {
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
  isEditMode = false;
  assetId = '';
  isSubmitting = false;
  showDeleteModal = false;

  readonly categories: AssetCategory[] = [
    'High-tech',
    'Meuble',
    'Véhicule',
    'Électroménager',
    'Sport & Loisirs',
    'Outil',
    'Jardin',
    'Autre',
  ];

  readonly conditions: AssetCondition[] = ['Neuf', 'Bon état', 'Usé'];

  readonly categoryLabels: Record<string, string> = {
    'High-tech': 'High-tech',
    Meuble: 'Meuble',
    Véhicule: 'Véhicule',
    Électroménager: 'Électro.',
    'Sport & Loisirs': 'Sport',
    Jardin: 'Jardin',
    Outil: 'Outil',
    Autre: 'Autre',
  };

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private assetsService: AssetsService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      purchase_price_cents: [null, [Validators.required, Validators.min(0)]],
      purchase_date: ['', Validators.required],
      condition: [null],
      warranty_end_date: [null],
      notes: [null],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.assetId = id;
      this.assetsService.getAssetById(id).subscribe((asset) => {
        this.form.patchValue({
          name: asset.name,
          category: asset.category,
          purchase_price_cents: asset.purchase_price_cents / 100,
          purchase_date: asset.purchase_date?.slice(0, 10),
          condition: asset.condition,
          warranty_end_date: asset.warranty_end_date?.slice(0, 10) ?? null,
          notes: asset.notes,
        });
      });
    }
  }

  selectCategory(category: AssetCategory): void {
    this.form.get('category')?.setValue(category);
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const value = this.form.value;
    const payload = {
      ...value,
      purchase_price_cents: Math.round(value.purchase_price_cents * 100),
      purchase_date: new Date(value.purchase_date),
      warranty_end_date: value.warranty_end_date ? new Date(value.warranty_end_date) : undefined,
    };

    if (this.isEditMode) {
      this.assetsService.updateAsset(this.assetId, payload).subscribe(() => {
        void this.router.navigate(['/assets', this.assetId]);
      });
    } else {
      this.assetsService.createAsset(payload).subscribe(() => {
        void this.router.navigate(['/home']);
      });
    }
  }

  deleteAsset(): void {
    if (!this.assetId) return;
    this.assetsService.deleteAsset(this.assetId).subscribe(() => {
      void this.router.navigate(['/home']);
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }
}
