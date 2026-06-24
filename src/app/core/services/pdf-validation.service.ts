import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PdfValidationService {
    constructor(private http: HttpClient) {}

    private apiUrl = environment.api_fastapi;

    validatePdf(file: File) {
        const formData = new FormData();

        formData.append('pdf', file);

        return this.http.post(`${this.apiUrl}/validate-pdf`, formData);
    }

}
