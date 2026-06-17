import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

import { ClientesService, Cliente } from '../../core/services/clientes.service';
import {
    PricelistService,
    PriceListItem,
} from '../../core/services/pricelist.service';

@Component({
    selector: 'app-admin-clientes',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatAutocompleteModule,
        MatInputModule,
    ],
    templateUrl: './admin-clientes.html',
    styleUrl: './admin-clientes.css',
})
export class AdminCustomers implements OnInit {
    private clientesService = inject(ClientesService);
    private pricelistService = inject(PricelistService);

    clientes = signal<Cliente[]>([]);
    listasPrecios = signal<PriceListItem[]>([]);
    listasFiltradas = signal<PriceListItem[]>([]);

    // Guardan el texto de búsqueda y el objeto seleccionado por ID de cliente
    busquedas: { [key: number]: string } = {};
    listasSeleccionadasTemporal: { [key: number]: PriceListItem | null } = {};

    ngOnInit() {
        // 1. Cargar las listas primero para poder cruzar los IDs con los nombres
        this.pricelistService.obtenerListas().subscribe({
            next: (res) => {
                this.listasPrecios.set(res);
                this.listasFiltradas.set(res);

                // 2. Cargar clientes inmediatamente después
                this.cargarClientes();
            },
            error: (err) => console.error(err),
        });
    }

    cargarClientes() {
        this.clientesService.obtenerClientes().subscribe({
            next: (res) => {
                this.clientes.set(res);

                // Inicializar los valores de cada fila según lo guardado en base de datos
                res.forEach((cliente) => {
                    const listaAsignada = this.listasPrecios().find(
                        (l) => l.id === cliente.id_precio_lista,
                    );
                    this.busquedas[cliente.id] = listaAsignada
                        ? listaAsignada.name
                        : '';
                    this.listasSeleccionadasTemporal[cliente.id] =
                        listaAsignada || null;
                });
            },
            error: (err) => console.error(err),
        });
    }

    mostrarNombreLista(lista: PriceListItem | null): string {
        return lista ? lista.name : '';
    }

    // Se ejecuta cada vez que el usuario escribe en un buscador específico
    onEscribiendo(clienteId: number, event: Event) {
        const texto = (event.target as HTMLInputElement).value;
        this.busquedas[clienteId] = texto;

        const filterValue = texto.toLowerCase();
        const filtradas = this.listasPrecios().filter((lista) =>
            lista.name.toLowerCase().includes(filterValue),
        );
        this.listasFiltradas.set(filtradas);
    }

    onListaSeleccionada(clienteId: number, lista: PriceListItem) {
        this.busquedas[clienteId] = lista.name;
        this.listasSeleccionadasTemporal[clienteId] = lista;
    }

    guardarListaCliente(clienteId: number) {
        const lista = this.listasSeleccionadasTemporal[clienteId];
        const idListaToSend = lista ? lista.id : null;

        this.clientesService
            .actualizarListaPrecio(clienteId, idListaToSend)
            .subscribe({
                next: (clienteActualizado) => {
                    console.log('Guardado en DB:', clienteActualizado);
                    alert('Lista de precios guardada correctamente.');

                    this.clientes.update((actuales) =>
                        actuales.map((c) =>
                            c.id === clienteId
                                ? { ...c, id_precio_lista: idListaToSend }
                                : c,
                        ),
                    );
                },
                error: (err) => {
                    console.error(err);
                    alert('Error al intentar guardar la lista de precios.');
                },
            });
    }
}
