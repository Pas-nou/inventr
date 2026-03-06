import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';
@Component({
  selector: 'app-assets',
  imports: [CurrencyPipe, LucideAngularModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent {
  triangleAlert = TriangleAlert;
  // Provisional data
  firstName = 'John';
  assetsCount = 24;
  totalValue = 12450;
  warrantyAlerts = ['MacBook Pro', 'iPhone 15 Pro'];
}
