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

    // 💡 Si tu FastAPI corre en otra URL base, puedes usarla aquí, por ejemplo:
    // private apiFastApi = `${environment.api_fastapi}`;

    getProducts() {
        return this.http.get<any[]>(this.apiUrl);
    }

    updateProduct(
        id: number,
        productData: Partial<Product>,
    ): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}`, productData);
    }

    // ==========================================
    // NUEVO MÉTODO: Sincronización con Odoo
    // ==========================================
    syncPricesToOdoo(products: any[]): Observable<any> {
        // Reducimos el payload para enviar solo lo que FastAPI/Odoo necesitan mapear
        const payload = {
            products: products.map((p) => ({
                // Usamos 'codigo' o 'default_code' según cómo se llame en tu interfaz Product
                codigo: p.referencia_interna,
                costo_soles: p.costo_soles,
                precio_venta_soles: p.precio_venta_soles,
            })),
        };

        // 💡 Ajusta la URL según corresponda:
        // Si la petición va directo a FastAPI, usa su URL base + '/sync-prices'
        const urlSync = `${environment.api_fastapi}/sync-prices`;

        return this.http.post<any>(urlSync, payload);
    }
}
