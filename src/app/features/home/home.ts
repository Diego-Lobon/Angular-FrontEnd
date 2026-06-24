import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Carousel } from '../../shared/components/carousel/carousel';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../core/services/products.service'; // Ajusta la ruta real de tu servicio
import { map } from 'rxjs';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [Carousel, ProductCard, RouterModule, MatIconModule],
    templateUrl: './home.html',
    styleUrls: ['./home.css'],
})
export class Home {
    // 1. Inyectamos de forma moderna el servicio de productos
    private productsService = inject(ProductsService);

    /**
     * 2. Convertimos el Observable directamente en una Signal usando 'toSignal'.
     * Usamos el operador 'map' para inyectar las propiedades dinámicas de Odoo (símbolo y precio)
     * que tu 'ProductCard' necesita de manera obligatoria para renderizar y operar en el carrito.
     */
    destacados = toSignal(
        this.productsService.getProducts().pipe(
            map((products) =>
                products.map((p) => ({
                    ...p,
                    // Si tu API no define estos campos por defecto, los inicializamos para evitar errores en la Card
                    custom_symbol: p.custom_symbol ?? 'S/.',
                    custom_price:
                        p.custom_price ?? Number(p.precio_venta_soles ?? 0),
                })),
            ),
            // Opcional: Si quieres mostrar solo los primeros 6 u 8 productos en la vitrina del Home
            map((products) => products.slice(0, 6)),
        ),
        { initialValue: [] }, // Valor inicial seguro mientras la petición HTTP viaja al backend/FastAPI
    );
}
