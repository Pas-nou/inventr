import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (!environment.production) {
  const script = document.createElement('script');
  script.src = '//cdn.jsdelivr.net/npm/eruda';
  script.onload = () => (window as any).eruda.init();
  document.head.appendChild(script);
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
