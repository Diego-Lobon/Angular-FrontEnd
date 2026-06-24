import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { AdminNavbar } from './shared/components/admin-navbar/admin-navbar';

import { AuthService } from './core/services/auth.service';
import { AuthClienteService } from './core/services/auth-cliente.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Navbar, Footer, AdminNavbar],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    router = inject(Router);

    authService = inject(AuthService);
    authClienteService = inject(AuthClienteService);

    private adminRoutes = [
        '/admin-dashboard',
        '/admin-users',
        '/home-clientes',
        '/admin-products',
        '/admin-cotizaciones',
        '/home-list-price',
        '/valid-cotizacion',
    ];

    isAdminLoginPage(): boolean {
        return this.router.url === '/login-admin';
    }

    isAdminRoute(): boolean {
        return this.adminRoutes.some((route) =>
            this.router.url.startsWith(route),
        );
    }

    showAdminNavbar(): boolean {
        return this.isAdminRoute() && this.authService.isLoggedIn();
    }

    showClientNavbar(): boolean {
        return !this.isAdminRoute() && !this.isAdminLoginPage();
    }

    showFooter(): boolean {
        return !this.isAdminRoute() && !this.isAdminLoginPage();
    }
}
