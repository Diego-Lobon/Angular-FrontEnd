import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private http = inject(HttpClient);

    private apiUrl = `${environment.api_nest}/categories`;

    getCategories() {
        return this.http.get<any[]>(this.apiUrl);
    }
}
