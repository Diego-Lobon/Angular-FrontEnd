import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router'; // 💡 Cambiamos RouterLink por RouterModule
import { MatIconModule } from '@angular/material/icon';
import { AuthClienteService } from '../../../core/services/auth-cliente.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterModule, MatIconModule], // 💡 Al importar RouterModule, habilitas routerLink, routerLinkActive y routerLinkActiveOptions automáticamente
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    public authClienteService = inject(AuthClienteService);
    private router = inject(Router);

    isMenuOpen = false;

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenu() {
        this.isMenuOpen = false;
    }

    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    logout() {
        this.authClienteService.logout();
        this.router.navigate(['/']);
    }
}
