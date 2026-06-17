import { Component, inject } from '@angular/core'; // 💡 Cambiamos por inject
import { RouterLink, Router } from '@angular/router'; // 💡 Simplificamos imports
import { MatIconModule } from '@angular/material/icon';
import { AuthClienteService } from '../../../core/services/auth-cliente.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, MatIconModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    // 💡 Inyección moderna por propiedades (Evita el error NG0203 y errores de Scope de JS)
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

        // 💡 Ahora 'this.router' está perfectamente definido y disponible en cualquier contexto
        this.router.navigate(['/']);
    }
}
