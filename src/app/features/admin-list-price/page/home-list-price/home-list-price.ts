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

    // NUEVO
    loading = signal(false);

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

    eliminar(id: number) {
        if (!confirm('¿Eliminar lista?')) {
            return;
        }

        this.loading.set(true);

        this.pricelistService.eliminarLista(id).subscribe({
            next: () => {
                this.cargar();
            },

            error: (err) => {
                console.log(err);
                this.loading.set(false);
            },
        });
    }
}
