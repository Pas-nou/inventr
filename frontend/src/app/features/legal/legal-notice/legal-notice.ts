import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronUp, ArrowLeft } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-legal-notice',
  imports: [RouterLink, LucideAngularModule, FooterComponent],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.css',
})
export class LegalNoticeComponent {
  readonly chevronUp = ChevronUp;
  readonly arrowLeft = ArrowLeft;
  showScrollTop = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 50;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
