import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Pencil, Bell, LogOut, ChevronRight } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  readonly pencil = Pencil;
  readonly bell = Bell;
  readonly logOut = LogOut;
  readonly chevronRight = ChevronRight;

  firstName = '';
  lastName = '';
  email = '';
  initials = '';

  // Update Profile modal
  showEditModal = false;
  editFirstName = '';
  editLastName = '';
  editEmail = '';
  editCurrentPassword = '';
  editNewPassword = '';
  editConfirmPassword = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
      },
    });
  }

  get isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editEmail);
  }
}
