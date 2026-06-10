import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { AuthService } from './core/services/auth';
import { AdminNavbar } from './shared/components/admin-navbar/admin-navbar';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Navbar, Footer, AdminNavbar],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    constructor(public authService: AuthService) {}
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }
}
