import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

// * Component convierte la clase en un componente Angular.
@Component({
    selector: 'app-login',
    // * No necesito módulo
    standalone: true,

    imports: [FormsModule],

    templateUrl: './login.html',

    styleUrl: './login.css',
})
export class Login {
    username = '';

    password = '';
    // * Es una variable reactiva.
    // * Controla si se muestra el error.
    errorMessage = signal(false);

    // * Angular inyecta automáticamente AuthService y Router
    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    login() {
        this.authService.login(this.username, this.password).subscribe({
            // * subscribe espera la respuesta
            // * next se ejecuta si todo salio bien
            next: (response: any) => {
                // * Ocultar error
                this.errorMessage.update((value) => false);
                // * Guardar token
                this.authService.saveToken(response.access_token);

                console.log('LOGIN OK');

                // * Redirigir
                this.router.navigate(['/admin-dashboard']);
            },
            // * error se ejecuta si encuentra algun problema
            error: () => {
                // * Mostrar mensaje
                this.errorMessage.update((value) => true);
                console.log('no');
            },
        });
    }
}
