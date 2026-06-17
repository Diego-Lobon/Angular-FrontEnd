import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuotationCreateService {
    private apiUrl = environment.api_fastapi;

    constructor(private http: HttpClient) {}

    createQuotation(data: any) {
        return this.http.post(`${this.apiUrl}/create-quotation`, data);
    }

    buscarClientes(search: string) {
        return this.http.get(`${this.apiUrl}/clientes`, {
            params: {
                search,
            },
        });
    }
}
