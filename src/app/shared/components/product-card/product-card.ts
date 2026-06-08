import { Component, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
// 💡 IMPORTANTE: Asegúrate de importar AsyncPipe además de CommonModule
import { CommonModule, AsyncPipe } from '@angular/common';
import {
    CartRedisService,
    CartItem,
} from '../../../core/services/cart-redis.service';
import { Product } from '../../../core/interfaces/product.interface';
import { map } from 'rxjs';

@Component({
    selector: 'app-product-card',
    standalone: true,
    // 💡 AGREGAMOS AsyncPipe AQUÍ
    imports: [CommonModule, AsyncPipe, MatIcon],
    templateUrl: './product-card.html',
    styleUrl: './product-card.css',
})
export class ProductCard {
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
                price: this.product.precio_venta,
                cantidad: 1,
                imageUrl: this.product.imagen_url, // Mapeamos también la URL de la imagen de paso
                marca: this.product.marca,
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
