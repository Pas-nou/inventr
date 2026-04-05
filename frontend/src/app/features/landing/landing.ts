import { Component, HostListener, OnInit } from '@angular/core';
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
import { Meta, Title } from '@angular/platform-browser';
import { FooterComponent } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, LucideAngularModule, FooterComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent implements OnInit {
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

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Inventr - Gérez votre patrimoine personnel');
    this.meta.addTags([
      { name: 'description', content: 'Inventr centralise tous vos biens, documents et garanties en un seul endroit. Gratuit, sans carte bancaire.' },
      { name: 'keywords', content: 'inventaire patrimoine, gestion biens, garanties, documents, maintenance' },
      { property: 'og:title', content: 'Inventr — Gérez votre patrimoine personnel' },
      { property: 'og:description', content: 'Inventr centralise tous vos biens, documents et garanties en un seul endroit.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://inventr.fr' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Inventr — Gérez votre patrimoine personnel' },
      { name: 'twitter:description', content: 'Inventr centralise tous vos biens, documents et garanties en un seul endroit.' },
    ])
  }

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
