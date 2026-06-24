import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthClienteService } from '../../core/services/auth-cliente.service';
import { CartRedisService } from '../../core/services/cart-redis.service';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-login-cliente',
    standalone: true,
    imports: [FormsModule, MatIcon],
    templateUrl: './login-cliente.html',
    styleUrl: './login-cliente.css',
})
export class LoginCliente {
    username = '';
    password = '';
    errorMessage = signal(false);

    private cartService = inject(CartRedisService);
    private authClienteService = inject(AuthClienteService);
    private router = inject(Router);

    login() {
        this.authClienteService.login(this.username, this.password).subscribe({
            next: (response: any) => {
                this.errorMessage.set(false);

                // 💡 Solo guardamos el access_token.
                // El id_precio_lista ya debe venir incrustado DENTRO de ese token desde NestJS.
                this.authClienteService.saveSession(response.access_token);

                console.log('CLIENTE LOGIN OK - Token almacenado con éxito.');

                this.cartService.switchCartContext();

                this.router.navigate(['/']);
            },
            error: (err) => {
                this.errorMessage.set(true);
                console.error('Error en login de cliente:', err);
            },
        });
    }
}
