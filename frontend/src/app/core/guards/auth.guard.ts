import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService, 
        private router: Router
    ) {}

    // * Modification temporaire le temps du développement !
    // canActivate(): boolean {
    //     if (this.authService.isAuthenticated()) {
    //         return true;
    //     } 
    //         void this.router.navigate(['/login']);
    //         return false;
    //     }
    canActivate(): boolean {
        return true;
    }
    }
