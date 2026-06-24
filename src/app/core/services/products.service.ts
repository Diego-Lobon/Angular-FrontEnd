import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../interfaces/product.interface';

@Injectable({
    providedIn: 'root',
})
export class ProductsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.api_nest}/products`;

    // =========================================================
    // NUEVO MÉTODO: Guarda el valor del dólar en la tabla tipo_de_cambio
    // =========================================================
    saveTipoCambioHistorico(valorDolar: number): Observable<any> {
        return this.http.post<any>(`${environment.api_nest}/tipo-cambio`, {
            dolar: valorDolar,
        });
    }

    getTipoCambioSunat(): Observable<{ venta: number }> {
        return this.http.get<{ venta: number }>(
            `${environment.api_nest}/tipo-cambio/sunat`,
        );
    }

    getProducts() {
        return this.http.get<any[]>(this.apiUrl);
    }

    updateProduct(
        id: number,
        productData: Partial<Product>,
    ): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}`, productData);
    }

    syncPricesToOdoo(products: any[]): Observable<any> {
        const payload = {
            products: products.map((p) => ({
                codigo: p.referencia_interna,
                costo_soles: p.costo_soles,
                precio_venta_soles: p.precio_venta_soles,
            })),
        };
        const urlSync = `${environment.api_fastapi}/sync-prices`;
        return this.http.post<any>(urlSync, payload);
    }

    getTipoCambioBD(): Observable<any> {
        return this.http.get<any>(`${environment.api_nest}/tipo-cambio/1`);
    }
}
