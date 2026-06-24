import { Component, inject, OnInit, signal } from '@angular/core';
import {
    PricelistService,
    PriceListItem,
} from '../../../../core/services/pricelist.service';
import { MatIcon } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home-list-price',
    standalone: true,
    imports: [MatIcon, RouterLink],
    templateUrl: './home-list-price.html',
})
export class HomeListPrice implements OnInit {
    private pricelistService = inject(PricelistService);

    listas = signal<PriceListItem[]>([]);
    loading = signal(false);

    // 💡 Signal para controlar el estado del Modal de confirmación
    listaPorEliminar = signal<PriceListItem | null>(null);

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.loading.set(true);
        this.pricelistService.obtenerListas().subscribe({
            next: (data: PriceListItem[]) => {
                this.listas.set(data);
            },
            error: (err: HttpErrorResponse) => {
                console.error(err);
            },
            complete: () => {
                this.loading.set(false);
            },
        });
    }

    // 💡 Abre el modal guardando la referencia del ítem seleccionado
    abrirModalConfirmacion(item: PriceListItem): void {
        this.listaPorEliminar.set(item);
    }

    // 💡 Resetea el estado para cerrar el modal de inmediato
    cerrarModal(): void {
        this.listaPorEliminar.set(null);
    }

    // 💡 Ejecuta la llamada al servicio solo si fue verificado en el modal
    confirmarEliminar(): void {
        const item = this.listaPorEliminar();
        if (!item) return;

        this.cerrarModal(); // Cerramos el modal visual inmediatamente
        this.loading.set(true);

        this.pricelistService.eliminarLista(item.id).subscribe({
            next: () => {
                this.cargar();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
            },
        });
    }
}
