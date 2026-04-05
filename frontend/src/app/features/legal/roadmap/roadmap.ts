import { Component, HostListener } from '@angular/core';
import { LucideAngularModule, ArrowLeft, ChevronUp } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-roadmap',
  imports: [LucideAngularModule, RouterLink, FooterComponent, SidebarComponent],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css',
})
export class RoadmapComponent {
  readonly arrowLeft = ArrowLeft;
  readonly chevronUp = ChevronUp;
  showScrollTop = false;

  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
