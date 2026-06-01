import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [MatIcon],
    templateUrl: './product-card.html',
    styleUrl: './product-card.css',
})
export class ProductCard {
    @Input() product: any;

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
