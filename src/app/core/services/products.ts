import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ProductsService {

    private http = inject(HttpClient);

    private apiUrl =
        'http://192.168.18.38:3000/products';

    getProducts() {
        return this.http.get<any[]>(
            this.apiUrl
        );
    }
}