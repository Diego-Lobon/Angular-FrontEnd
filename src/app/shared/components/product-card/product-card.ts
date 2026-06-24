import { Component, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
    CartRedisService,
    CartItem,
} from '../../../core/services/cart-redis.service';
import { Product } from '../../../core/interfaces/product.interface';
import { map } from 'rxjs';
import { AuthClienteService } from '../../../core/services/auth-cliente.service';

type OdooProduct = Product & {
    custom_price?: number;
    custom_symbol?: string;
};

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, AsyncPipe, MatIcon],
    templateUrl: './product-card.html',
    styleUrl: './product-card.css',
})
export class ProductCard {
    public authClienteService = inject(AuthClienteService);
    public cartRedisService = inject(CartRedisService);

    @Input() product!: OdooProduct;

    // 💡 NUEVO INPUT: Permite controlar dinámicamente si este componente renderiza el precio
    @Input() showPrice: boolean = true;

    toggleCart(event: Event) {
        event.stopPropagation();

        const isProductInCart = this.getCartSnapshot().some(
            (i) => i.productId === String(this.product.id),
        );

        if (isProductInCart) {
            this.cartRedisService.removeItem(String(this.product.id));
        } else {
            const currentSymbol = this.product.custom_symbol;
            const monedaSeleccionada: 'USD' | 'PEN' =
                currentSymbol === '$' ? 'USD' : 'PEN';

            const finalPriceSoles =
                currentSymbol === 'S/.'
                    ? (this.product.custom_price ??
                      Number(this.product.precio_venta_soles))
                    : Number(this.product.precio_venta_soles);

            const finalPriceDolares =
                currentSymbol === '$'
                    ? (this.product.custom_price ??
                      Number(this.product.precio_venta_dolares))
                    : Number(this.product.precio_venta_dolares);

            const item: CartItem = {
                referencia_interna: this.product.referencia_interna,
                productId: String(this.product.id),
                name: this.product.nombre,
                price_dolares: finalPriceDolares,
                price_soles: finalPriceSoles,
                moneda: monedaSeleccionada,
                cantidad: 1,
                imageUrl: this.product.imagen_url,
                marca: { nombre: this.product.marca?.nombre || 'Sin marca' },
                categoria: {
                    nombre: this.product.categoria?.nombre || 'Sin categoría',
                },
            };

            this.cartRedisService.addToCart(item);
        }
    }

    private getCartSnapshot(): CartItem[] {
        let items: CartItem[] = [];
        this.cartRedisService.cartItems$
            .subscribe((i) => (items = i))
            .unsubscribe();
        return items;
    }

    isInCart() {
        return this.cartRedisService.cartItems$.pipe(
            map((items) =>
                items.some(
                    (item) => item.productId === String(this.product.id),
                ),
            ),
        );
    }

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
