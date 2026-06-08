import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class QuotationCreateService {
    private apiUrl = 'http://192.168.18.38:8000';

    constructor(private http: HttpClient) {}

    createQuotation(data: any) {
        return this.http.post(
            `${this.apiUrl}/create-quotation`,
            data
        );
    }
}