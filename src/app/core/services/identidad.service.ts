import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class IdentidadService {
    private http = inject(HttpClient);
    // 💡 Tu token proporcionado
    private token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRpZWdvbGltYTQ4OEBnbWFpbC5jb20ifQ.Fd6MC3bpsia2uXBwGhGvkLxoD-duo1ihcN16Y_gdSx4';
    private baseUrl = 'https://dniruc.apisperu.com/api/v1';

    consultarRuc(ruc: string): Observable<any> {
        return this.http.get<any>(
            `${this.baseUrl}/ruc/${ruc}?token=${this.token}`,
        );
    }

    consultarDni(dni: string): Observable<any> {
        return this.http.get<any>(
            `${this.baseUrl}/dni/${dni}?token=${this.token}`,
        );
    }
}
