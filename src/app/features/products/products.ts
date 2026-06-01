import { Component } from '@angular/core';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
    selector: 'app-products',
    imports: [ProductCard],
    templateUrl: './products.html',
    styleUrl: './products.css',
})
export class Products {
    products = [
        {
            id: 1,
            name: 'Guantes Industriales',
            marca: 'MSA',
            category: 'Seguridad',
            image: 'https://www.truper.com/media/import/imagenes/LIRE-180P.jpgs',
            cant: 1,
            price: 20,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde eveniet distinctio illum saepe explicabo eos!.',
        },

        {
            id: 2,
            name: 'Casco de Seguridad',
            marca: '3M',
            category: 'Protección',
            image: 'https://www.truper.com/media/import/imagenes/A-31-30.jpg',
            cant: 2,
            price: 220,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde eveniet distinctio illum saepe explicabo eos!.',
        },

        {
            id: 3,
            name: 'Casco de Seguridad',
            marca: '3M',
            category: 'Protección',
            image: 'https://www.truper.com/media/import/imagenes/A-31-30.jpg',
            cant: 2,
            price: 220,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde eveniet distinctio illum saepe explicabo eos!.',
        },
    ];
}
