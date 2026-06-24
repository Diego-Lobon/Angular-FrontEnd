import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
    ClientesService,
    Cliente,
} from '../../../../core/services/clientes.service';

@Component({
    selector: 'app-home-clientes',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterLink],
    templateUrl: './home-clientes.html',
    styleUrl: './home-clientes.css',
})
export class HomeClientes implements OnInit {
    private clientesService = inject(ClientesService);

    clientes = signal<Cliente[]>([]);
    readonly loading = signal<boolean>(true);

    ngOnInit() {
        this.cargarClientes();
    }

    cargarClientes() {
        this.clientesService.obtenerClientes().subscribe({
            next: (res) => {
                this.clientes.set(res);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
            },
        });
    }
}
