import { Component, inject, Input } from '@angular/core';
import {
    CartItem,
    CartRedisService,
} from '../../../../core/services/cart-redis.service';
import { Product } from '../../../../core/interfaces/product.interface';
import { map } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-admin-product-card',
    imports: [MatIcon],
    templateUrl: './admin-product-card.html',
    styleUrl: './admin-product-card.css',
})
export class AdminProductCard {
    public cartRedisService = inject(CartRedisService);

    @Input() product!: Product;

    toggleCart(event: Event) {
        event.stopPropagation();

        const isProductInCart = this.getCartSnapshot().some(
            (i) => i.productId === String(this.product.id),
        );

        if (isProductInCart) {
            // Si el método en tu servicio se llama removeItem o removeAnonymousCartItem, asegúrate de invocarlo correctamente:
            this.cartRedisService.removeItem(String(this.product.id));
            console.log('Producto removido:', this.product.id);
        } else {
            const item: CartItem = {
                referencia_interna: this.product.referencia_interna,
                productId: String(this.product.id),
                name: this.product.nombre,
                price_dolares: this.product.precio_venta_dolares,
                price_soles: this.product.precio_venta_soles,
                cantidad: 1,
                imageUrl: this.product.imagen_url, // Mapeamos también la URL de la imagen de paso
                marca: {
                    nombre: this.product.marca?.nombre || 'Sin marca',
                },
                categoria: {
                    nombre: this.product.categoria?.nombre || 'Sin categoría',
                },
            };
            this.cartRedisService.addToCart(item);
            console.log('Producto agregado:', item);
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
