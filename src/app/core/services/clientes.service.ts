import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Cliente {
    id: number;

    nombre: string;

    username: string;

    password: string;

    correo: string;

    celular: number;

    id_precio_lista: number | null;
}

@Injectable({
    providedIn: 'root',
})
export class ClientesService {
    private http = inject(HttpClient);

    private api = `${environment.api_nest}/clientes`;

    obtenerClientes(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.api);
    }

    actualizarListaPrecio(
        clienteId: number,
        idPrecioLista: number | null,
    ): Observable<Cliente> {
        return this.http.patch<Cliente>(
            `${this.api}/${clienteId}/lista-precios`,
            {
                id_precio_lista: idPrecioLista,
            },
        );
    }

    actualizarCliente(
        id: number,
        cliente: Partial<Cliente>,
    ): Observable<Cliente> {
        return this.http.patch<Cliente>(`${this.api}/${id}`, cliente);
    }

    obtenerClientePorId(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.api}/${id}`);
    }
}
