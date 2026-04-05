import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-navbar-public',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './navbar-public.html',
  styleUrl: './navbar-public.css',
})
export class NavbarPublicComponent {
  readonly arrowLeft = ArrowLeft;
}
