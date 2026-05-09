import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  Search,
  X,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { AssetsService, Asset } from '../../core/services/assets.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AlertsStateService } from '../../core/services/alerts-state.service';
import { Subscription, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OnboardingService } from '../../core/services/onboarding.service';

const WARRANTY_ALERT_DAYS = 30;

@Component({
  selector: 'app-assets',
  imports: [CurrencyPipe, LucideAngularModule, RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent implements OnInit, OnDestroy {
  // Icons
  readonly triangleAlert = TriangleAlert;
  readonly chevronDown = ChevronDown;
  readonly chevronUp = ChevronUp;
  readonly package = Package;
  readonly plus = Plus;
  readonly searchIcon = Search;
  readonly xIcon = X;
  readonly arrowUpDown = ArrowUpDown;
  readonly arrowUp = ArrowUp;
  readonly arrowDown = ArrowDown;

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
  searchControl = new FormControl('');
  showPwaInstallModal = false;

  onboardingSteps: ReturnType<OnboardingService['getSteps']> = null;
  onboardingCompleted = false;
  onboardingDismissed = false;

  private searchSubscription?: Subscription;
  private routerSubscription?: Subscription;

  sortBy = 'created_at';
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  isSortDropdownOpen = false;

  readonly sortOptions = [
    { label: "Date d'ajout", value: 'created_at' },
    { label: 'Nom', value: 'name' },
    { label: 'Prix', value: 'price' },
    { label: "Date d'achat", value: 'purchase_date' },
    { label: 'Garantie', value: 'warranty_end_date' },
  ];

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

  readonly pwaOs: 'ios' | 'android' | 'desktop' = (() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  })();

  completePwaInstall(): void {
    this.showPwaInstallModal = false;
    this.completeOnboardingStep('app_installed');
  }

  constructor(
    private authService: AuthService,
    private assetsService: AssetsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alertsStateService: AlertsStateService,
    private onboardingService: OnboardingService,
  ) {}

  ngOnInit(): void {
    this.onboardingSteps = this.onboardingService.getSteps();
    this.onboardingCompleted = this.onboardingService.isCompleted();
    this.loadStats();
    this.initSearch();

    // Reload data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event) => (event as NavigationEnd).url === '/app'),
      )
      .subscribe(() => {
        this.loadStats();
        this.searchControl.setValue('', { emitEvent: true });
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  private initSearch(): void {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.isLoading = true;
          this.cdr.detectChanges();
          return this.assetsService.getAssets(1, 100, term ?? '', this.sortBy, this.sortOrder);
        }),
      )
      .subscribe({
        next: (response) => {
          this.assets = [...response.data];
          this.assetsCount = response.meta.total;
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

    // Triggers the first request
    this.searchControl.setValue('');
  }

  private loadStats(): void {
    const user = this.authService.getUser();
    if (user) this.firstName = user.first_name;

    this.assetsService.getStats().subscribe({
      next: (stats) => {
        this.documentsCount = stats.documentsCount;
        this.cdr.detectChanges();
      },
      error: () => {
        this.documentsCount = 0;
        this.cdr.detectChanges();
      },
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

  get onboardingProgress(): number {
    if (!this.onboardingSteps) return 0;
    return [
      this.onboardingSteps.first_asset,
      this.onboardingSteps.first_document,
      this.onboardingSteps.app_installed,
    ].filter(Boolean).length;
  }

  completeOnboardingStep(step: 'first_asset' | 'first_document' | 'app_installed'): void {
    this.onboardingService.completeStep(step);
    this.onboardingSteps = this.onboardingService.getSteps();
    this.onboardingCompleted = this.onboardingService.isCompleted();
    this.cdr.detectChanges();
  }

  setSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      if (this.sortOrder === 'DESC') {
        this.sortOrder = 'ASC';
      } else {
        // Reset to default
        this.sortBy = 'created_at';
        this.sortOrder = 'DESC';
      }
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'DESC';
    }
    this.searchControl.setValue(this.searchControl.value, { emitEvent: true });
  }

  get activeSortLabel(): string {
    return this.sortOptions.find(o => o.value === this.sortBy)?.label || 'Trier';
  }
}
