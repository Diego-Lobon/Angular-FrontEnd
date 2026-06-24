import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthClienteService } from '../../../core/services/auth-cliente.service';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.css',
})
export class Footer {
    public authClienteService = inject(AuthClienteService);
    private router = inject(Router);

    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    logout() {
        this.authClienteService.logout();
        this.router.navigate(['/']);
    }
}
