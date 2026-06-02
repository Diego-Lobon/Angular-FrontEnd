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
    // * PRODUCTOS DE PRUEBA
    products = [
        {
            id: 1,
            ref: '50003067',
            name: 'Guantes Industriales',
            marca: 'MSA',
            category: 'Seguridad',
            image: 'https://www.truper.com/media/import/imagenes/LIRE-180P.jpgs',
            cant: 1,
            price: 20,
        },

        {
            id: 2,
            ref: '50004897',
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

    generateQuotationValid() {
        this.quotationService
            .generatePdfValid(this.products)
            .subscribe((blob) => {
                // Vista previa
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            });
    }

    downloadQuotation() {
        this.quotationService
            .generatePdfValid(this.products)
            .subscribe((blob) => {
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');

                link.href = url;
                link.download = 'cotizacion.pdf';

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
            });
    }
}
