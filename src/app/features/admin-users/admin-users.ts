import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    avatar: string;
}
@Component({
    selector: 'app-admin-users',
    imports: [MatIconModule, CommonModule],
    templateUrl: './admin-users.html',
    styleUrl: './admin-users.css',
})
export class AdminUsers {
    // Dos datos de ejemplo tal como solicitaste
    usuariosPrueba: Usuario[] = [
        {
            id: 1,
            nombre: 'Carlos Mendoza',
            email: '',
            rol: 'Administrador',
            avatar: 'CM',
        },
        {
            id: 2,
            nombre: 'Ana Luisa Gomez',
            email: 'ana.gomez@email.com',
            rol: 'Editor',
            avatar: 'AG',
        },
    ];
}
