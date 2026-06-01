import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, MatIconModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    constructor(public authService: AuthService) {}

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
        this.authService.logout();
    }
}
