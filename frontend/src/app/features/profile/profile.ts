import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  Pencil,
  Bell,
  LogOut,
  ChevronRight,
  Download,
  Trash2,
} from 'lucide-angular';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AssetsService } from '../../core/services/assets.service';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule, FormsModule, UpperCasePipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  readonly pencil = Pencil;
  readonly bell = Bell;
  readonly logOut = LogOut;
  readonly chevronRight = ChevronRight;
  readonly download = Download;
  readonly trash = Trash2;
  readonly version = environment.version;

  firstName = '';
  lastName = '';
  email = '';
  initials = '';
  assetsCount = 0;
  documentsCount = 0;
  memberSince = '';

  // Update Profile modal
  showEditModal = false;
  editFirstName = '';
  editLastName = '';
  editEmail = '';
  editCurrentPassword = '';
  editNewPassword = '';
  editConfirmPassword = '';
  isSubmitting = false;

  // Delete Profile modal
  showDeleteModal = false;
  deletePassword = '';
  isDeleting = false;
  isExporting = false;

  constructor(
    private authService: AuthService,
    private assetsService: AssetsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assetsService.getStats().subscribe((stats) => {
      this.assetsCount = stats.assetsCount;
      this.documentsCount = stats.documentsCount;
      this.cdr.detectChanges();
    });

    const user = this.authService.getUser();
    if (user) {
      this.firstName = user.first_name;
      this.lastName = user.last_name;
      this.email = user.email;
      this.initials = user.first_name[0].toUpperCase();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  openEditModal(): void {
    this.editFirstName = this.firstName;
    this.editLastName = this.lastName;
    this.editEmail = this.email;
    this.editCurrentPassword = '';
    this.editNewPassword = '';
    this.editConfirmPassword = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  confirmEditProfile(): void {
    if (!this.editFirstName || !this.editLastName || !this.editEmail) return;

    if (this.editNewPassword && this.editNewPassword !== this.editConfirmPassword) {
      this.toastService.show('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    this.isSubmitting = true;
    const payload: {
      first_name?: string;
      last_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    } = {
      first_name: this.editFirstName,
      last_name: this.editLastName,
      email: this.editEmail,
    };
    if (this.editNewPassword) {
      payload.current_password = this.editCurrentPassword;
      payload.new_password = this.editNewPassword;
    }

    this.authService.updateProfile(payload).subscribe({
      next: (user) => {
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.email = user.email;
        this.initials = user.first_name[0].toUpperCase();
        this.isSubmitting = false;
        this.showEditModal = false;
        this.toastService.show('Profil mis à jour');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('Erreur lors de la mise à jour', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  get isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editEmail);
  }

  exportData(): void {
    this.isExporting = true;
    this.authService.exportData().subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventr-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: () => {
        this.toastService.show("Erreur lors de l'export", 'error');
        this.isExporting = false;
      },
    });
  }

  openDeleteModal(): void {
    this.deletePassword = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDeleteAccount(): void {
    if (!this.deletePassword) return;
    this.isDeleting = true;
    this.authService.deleteAccount(this.deletePassword).subscribe({
      next: () => {
        this.authService.logout();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDeleting = false;
        this.toastService.show('Mot de passe incorrect', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
