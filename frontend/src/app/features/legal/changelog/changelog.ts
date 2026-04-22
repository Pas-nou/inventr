import { Component, HostListener } from '@angular/core';
import { LucideAngularModule, ArrowLeft, ChevronUp } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-changelog',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './changelog.html',
  styleUrl: './changelog.css',
})
export class ChangelogComponent {
  readonly arrowLeft = ArrowLeft;
  readonly chevronUp = ChevronUp;
  showScrollTop = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
