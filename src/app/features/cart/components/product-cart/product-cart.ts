import { Component, signal, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CartRedisService } from '../../../../core/services/cart-redis.service';

@Component({
    selector: 'app-product-cart',
    standalone: true,
    imports: [MatIcon],
    templateUrl: './product-cart.html',
    styleUrl: './product-cart.css',
})
export class ProductCart {
    private cartRedisService = inject(CartRedisService);

    // Usamos un setter en el @Input para capturar la cantidad real cada vez que el padre se actualice
    private _product: any;
    cant = signal(1);

    @Input() set product(val: any) {
        this._product = val;
        if (val) {
            this.cant.set(val.cantidad || val.cantidad || val.cant || 1);
        }
    }

    get product(): any {
        return this._product;
    }

    removeProduct() {
        this.cartRedisService.removeItem(this.product.id);
    }

    increaseCant() {
        const nextQuantity = this.cant() + 1;
        this.cant.set(nextQuantity);
        // Despachamos el cambio al almacén de la app (Redis + LocalStorage)
        this.cartRedisService.updateItemQuantity(this.product.id, nextQuantity);
    }

    decreaseCant() {
        if (this.cant() > 1) {
            const nextQuantity = this.cant() - 1;
            this.cant.set(nextQuantity);
            // Despachamos el cambio al almacén de la app (Redis + LocalStorage)
            this.cartRedisService.updateItemQuantity(
                this.product.id,
                nextQuantity,
            );
        }
    }

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
