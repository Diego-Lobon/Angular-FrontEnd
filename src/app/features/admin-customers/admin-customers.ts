import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    avatar: string;
}
@Component({
    selector: 'app-admin-customers',
    imports: [MatIconModule, CommonModule],
    templateUrl: './admin-customers.html',
    styleUrl: './admin-customers.css',
})
export class AdminCustomers {
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
