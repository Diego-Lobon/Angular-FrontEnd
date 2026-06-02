import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class QuotationService {

    private apiUrl = 'http://192.168.18.36:3000';

    constructor(private http: HttpClient) {}

    generatePdf(products: any[]) {

        return this.http.post(
            `${this.apiUrl}/quotation/pdf`,
            { products },
            {
                responseType: 'blob',
            },
        );
    }

    generatePdfValid(products: any[]) {

        return this.http.post(
            `${this.apiUrl}/quotation/pdf-valid`,
            { products },
            {
                responseType: 'blob',
            },
        );
    }
}