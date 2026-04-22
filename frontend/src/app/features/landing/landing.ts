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
      desc: 'Centralisez tous vos biens en un seul endroit. High-tech, mobilier, véhicules, électroménager. Tout est organisé et accessible en un clic.',
    },
    {
      icon: Shield,
      title: 'Suivi des garanties',
      desc: "Ne laissez plus expirer une garantie sans le savoir. Inventr vous alerte avant l'échéance pour que vous puissiez agir à temps.",
    },
    {
      icon: FileText,
      title: 'Documents sécurisés',
      desc: "Factures, manuels, certificats. Tous vos documents sont stockés et accessibles depuis n'importe quel appareil, à tout moment.",
    },
    {
      icon: Wrench,
      title: 'Historique maintenance',
      desc: 'Gardez une trace de chaque réparation, entretien et inspection. Un historique complet pour chaque bien de votre patrimoine.',
    },
  ];

  readonly steps = [
    {
      num: '1',
      title: 'Ajoutez un bien en 30 secondes',
      desc: "Nom, catégorie, prix, date d'achat. Rien de compliqué. On garde l'essentiel.",
    },
    {
      num: '2',
      title: 'Stockez les documents qui vont avec',
      desc: "Factures, manuels, certificats. Accessibles partout, tout le temps, sur n'importe quel appareil.",
    },
    {
      num: '3',
      title: "Les alertes s'occupent du reste",
      desc: "Garantie qui expire bientôt ? Inventr prévient avant qu'il soit trop tard.",
    },
  ];

  readonly maintenanceShowcasePoints = [
    "Type d'événement (entretien, réparation, inspection...)",
    "Coût et date de l'intervention",
    'Rappel automatique pour le prochain entretien',
  ];

  readonly showcasePoints = [
    "Prix et date d'achat",
    'Garantie avec alerte avant expiration',
    'Documents attachés (factures, manuels...)',
    'Historique de maintenance',
  ];

  readonly screensPointsMobile = [
    "Vue tableau avec toutes les informations d'un coup",
    'Filtres par catégorie et recherche instantanée',
    'Export en JSON, CSV ou Excel depuis le profil',
  ];

  readonly screensPointsDesktop = [
    "Installable sur écran d'accueil iOS et Android",
    'Interface adaptée au tactile',
    'Alertes garanties directement sur le téléphone',
  ];

  readonly faqs = [
    {
      q: 'Les données sont en sécurité ?',
      a: 'Oui. Les données sont chiffrées et stockées de façon sécurisée. Export ou suppression possible à tout moment depuis le profil.',
    },
    {
      q: 'Ça fonctionne sur iPhone et Android ?',
      a: "Oui, Inventr s'installe sur iOS et Android comme une app native, pas besoin de passer par l'App Store.",
    },
    {
      q: 'Combien de biens peut-on ajouter ?',
      a: 'Autant que nécessaire. Pas de limite sur les biens, les documents ou les événements de maintenance.',
    },
    {
      q: 'Est-ce que les données peuvent être exportées ?',
      a: 'Oui, depuis le profil en JSON, CSV ou Excel. Les données restent les vôtres.',
    },
  ];

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Inventr - Gérez votre patrimoine personnel');
    this.meta.addTags([
      {
        name: 'description',
        content:
          'Inventr centralise tous vos biens, documents et garanties en un seul endroit. Gratuit, sans carte bancaire.',
      },
      {
        name: 'keywords',
        content: 'inventaire patrimoine, gestion biens, garanties, documents, maintenance',
      },
      { property: 'og:title', content: 'Inventr - Gérez votre patrimoine personnel' },
      {
        property: 'og:description',
        content: 'Inventr centralise tous vos biens, documents et garanties en un seul endroit.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://inventr.fr' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Inventr - Gérez votre patrimoine personnel' },
      {
        name: 'twitter:description',
        content: 'Inventr centralise tous vos biens, documents et garanties en un seul endroit.',
      },
    ]);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToScreenshot(): void {
    const id = window.innerWidth >= 1024 ? 'screenshot-desktop' : 'screenshot-mobile';
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
