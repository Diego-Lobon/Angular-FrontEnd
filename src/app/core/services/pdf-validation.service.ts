import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class PdfValidationService {
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://192.168.18.38:8000';

    validatePdf(file: File) {
        const formData = new FormData();

        formData.append('pdf', file);

        return this.http.post(
            `${this.apiUrl}/validate-pdf`,
            formData
        );
    }
}