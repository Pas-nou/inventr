import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Package,
  Shield,
  FileText,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-angular';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  readonly chevronDown = ChevronDown;
  readonly chevronUp = ChevronUp;
  showScrollTop = false;

  readonly features = [
    {
      icon: Package,
      title: 'Inventaire complet',
      desc: 'Centralisez tous vos biens en un seul endroit. High-tech, mobilier, véhicules, électroménager — tout est organisé et accessible en un clic.',
    },
    {
      icon: Shield,
      title: 'Suivi des garanties',
      desc: "Ne laissez plus expirer une garantie sans le savoir. Inventr vous alerte avant l'échéance pour que vous puissiez agir à temps.",
    },
    {
      icon: FileText,
      title: 'Documents sécurisés',
      desc: "Factures, manuels, certificats — tous vos documents sont stockés et accessibles depuis n'importe quel appareil, à tout moment.",
    },
    {
      icon: Wrench,
      title: 'Historique maintenance',
      desc: 'Gardez une trace de chaque réparation, entretien et inspection. Un historique complet pour chaque bien de votre patrimoine.',
    },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
