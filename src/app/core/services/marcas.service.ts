import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class MarcasService {
    private http = inject(HttpClient);

    private apiUrl = 'http://192.168.18.38:3000/marcas';

    getMarcas() {
        return this.http.get<any[]>(this.apiUrl);
    }
}
