import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service'; // Asegura la ruta correcta de tu servicio

@Component({
    selector: 'app-admin-users',
    imports: [MatIconModule, CommonModule],
    templateUrl: './admin-users.html',
    styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
    private authService = inject(AuthService);

    // Cambiamos el array estático por un Signal
    readonly usuarios = signal<any[]>([]);
    readonly loading = signal<boolean>(true);

    ngOnInit() {
        this.cargarUsuarios();
    }

    cargarUsuarios() {
        this.loading.set(true);
        this.authService.getUsuarios().subscribe({
            next: (data) => {
                this.usuarios.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error al cargar usuarios:', err);
                this.loading.set(false);
            },
        });
    }
}
