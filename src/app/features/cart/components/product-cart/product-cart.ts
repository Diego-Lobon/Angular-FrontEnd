import { Component, signal, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-product-cart',
    imports: [MatIcon],
    templateUrl: './product-cart.html',
    styleUrl: './product-cart.css',
})
export class ProductCart {
    @Input() product: any;

    cant = signal(0);

    ngOnInit() {
        this.cant.set(this.product.cant);
    }

    increaseCant() {
        this.cant.update((value) => value + 1);
        this.product.cant = this.cant();
        console.log(this.cant());
    }

    decreaseCant() {
        if (this.cant() > 1) {
            this.cant.update((value) => value - 1);
            // ACTUALIZAR PRODUCTO
            this.product.cant = this.cant();
        }
    }

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
