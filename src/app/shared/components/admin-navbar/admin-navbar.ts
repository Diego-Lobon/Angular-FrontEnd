import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin-navbar',
    imports: [MatIconModule, RouterModule],
    templateUrl: './admin-navbar.html',
    styleUrl: './admin-navbar.css',
})
export class AdminNavbar {
    constructor(
        public authService: AuthService,
        private router: Router,
    ) {}
    isMenuOpen = false;

    get usuarioLogueado() {
        return this.authService.getUserData();
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenu() {
        this.isMenuOpen = false;
    }

    logout() {
        try {
            // 1. Forzamos el cierre del menú de inmediato
            this.closeMenu();

            // 2. Ejecutamos la lógica de cerrar sesión
            this.authService.logout();

            // 3. Redirigimos usando una ruta absoluta
            this.router.navigate(['/']);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
}
