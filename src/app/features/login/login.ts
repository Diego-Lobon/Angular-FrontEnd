import { Component, signal  } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';

@Component({
    selector: 'app-login',

    standalone: true,

    imports: [FormsModule],

    templateUrl: './login.html',

    styleUrl: './login.css',
})
export class Login {
    username = '';

    password = '';

    errorMessage = signal(false);

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    login() {

        this.authService.login(this.username, this.password).subscribe({
            next: (response: any) => {
                this.errorMessage.update((value) => false) 
                this.authService.saveToken(response.access_token);

                console.log('LOGIN OK');

                // REDIRECCIONAR

                this.router.navigate(['/']);
            },

            error: () => {
                this.errorMessage.update((value) => true) 
                console.log("no")
            },
        });
    }
}
