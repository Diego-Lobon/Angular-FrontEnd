import { Component } from '@angular/core';
import { ProductCart } from './components/product-cart/product-cart';
import { MatIconModule } from '@angular/material/icon';
import { QuotationService } from '../../core/services/quotation.service';

@Component({
    selector: 'app-cart',
    imports: [MatIconModule, ProductCart],
    templateUrl: './cart.html',
    styleUrl: './cart.css',
})
export class Cart {
    // ! PRODUCTOS DE PRUEBA
    products = [
        {
            id: 1,
            name: 'Guantes Industriales',
            marca: 'MSA',
            category: 'Seguridad',
            image: 'https://www.truper.com/media/import/imagenes/LIRE-180P.jpgs',
            cant: 1,
            price: 20,
        },

        {
            id: 2,
            name: 'Casco de Seguridad',
            marca: '3M',
            category: 'Protección',
            image: 'https://www.truper.com/media/import/imagenes/A-31-30.jpg',
            cant: 2,
            price: 220,
        },
    ];

    constructor(private quotationService: QuotationService) {}

    generateQuotation() {
        this.quotationService.generatePdf(this.products).subscribe((blob) => {
            const url = window.URL.createObjectURL(blob);

            window.open(url);
        });
    }
}
