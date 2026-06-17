import { Component, signal, Input, inject, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CartRedisService } from '../../../../core/services/cart-redis.service';
import { CommonModule } from '@angular/common'; // Importante para el pipe de números nativo
import { AuthClienteService } from '../../../../core/services/auth-cliente.service';

@Component({
    selector: 'app-product-cart',
    standalone: true,
    imports: [MatIcon, CommonModule],
    templateUrl: './product-cart.html',
    styleUrl: './product-cart.css',
})
export class ProductCart {
    public authClienteService = inject(AuthClienteService);
    private cartRedisService = inject(CartRedisService);

    // 💡 Ya no dependemos de un @Input() externo para la moneda global
    private _product: any;
    cant = signal(1);

    @Input() set product(val: any) {
        this._product = val;
        if (val) {
            this.cant.set(val.cantidad || val.cant || 1);
        }
    }

    get product(): any {
        return this._product;
    }

    // --- COMPUTED: EVALÚA QUÉ PRECIO MOSTRAR SEGÚN LA MONEDA DEL PROPIO PRODUCTO EN REDIS ---
    displayPrice = computed(() => {
        if (!this.product) return 0;

        // 💡 Buscamos la propiedad 'moneda' que inyectamos directamente desde el objeto de Redis
        const currentCurrency = String(this.product.moneda || 'PEN')
            .toUpperCase()
            .trim();

        if (currentCurrency === 'USD' || currentCurrency.includes('USD')) {
            return Number(
                this.product.precio_dolar || this.product.price_dolares || 0,
            );
        }

        return Number(
            this.product.precio_soles || this.product.price_soles || 0,
        );
    });

    // --- COMPUTED: DEFINE EL SÍMBOLO MONETARIO BASADO EN LA MONEDA DEL ITEM ---
    displaySymbol = computed(() => {
        if (!this.product) return 'S/.';

        const currentCurrency = String(this.product.moneda || 'PEN')
            .toUpperCase()
            .trim();
        return currentCurrency === 'USD' || currentCurrency.includes('USD')
            ? '$'
            : 'S/.';
    });

    removeProduct() {
        this.cartRedisService.removeItem(this.product.productId);
    }

    increaseCant() {
        const nextQuantity = this.cant() + 1;

        this.cant.set(nextQuantity);

        this.product.cantidad = nextQuantity;

        this.cartRedisService.updateItemQuantity(
            this.product.productId,
            nextQuantity,
        );
    }

    decreaseCant() {
        if (this.cant() <= 1) return;

        const nextQuantity = this.cant() - 1;

        this.cant.set(nextQuantity);

        this.product.cantidad = nextQuantity;

        this.cartRedisService.updateItemQuantity(
            this.product.productId,
            nextQuantity,
        );
    }

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
