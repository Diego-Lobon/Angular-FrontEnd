import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// ======================================
// MODELOS
// ======================================

export interface PricelistProduct {
    id: number;
    codigo: string;
    nombre: string;
    precioEditable: number;
    descuentoEditable: number;
    tipoRegla: 'DESCUENTO' | 'PRECIO_FIJO';
}

export interface Pricelist {
    id?: number; // Opcional porque al crear no viene el ID
    nombre: string;
    moneda: 'PEN' | 'USD'; // Sincronizado con el estándar limpio de FastAPI
    productos: PricelistProduct[];
}

// Para listar en tablas
export interface PriceListItem {
    id: number;
    name: string;
}

// ======================================
// SERVICE
// ======================================

@Injectable({
    providedIn: 'root',
})
export class PricelistService {
    private http = inject(HttpClient);
    // Asegúrate de usar la propiedad correcta de tu environment (ej: api_fastapi o apiUrl_fast)
    private apiUrl = `${environment.api_fastapi}/api/v1/pricelists`;
    // 💡 NUEVO: Signal global para que cualquier componente sepa qué moneda rige el sistema
    public monedaActiva = signal<string>('PEN');

    // ============================
    // CREAR
    // ============================
    crearListaPrecios(
        payload: Omit<Pricelist, 'id'>,
    ): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.apiUrl, payload);
    }

    // ============================
    // LISTAR TODAS
    // ============================
    obtenerListas(): Observable<PriceListItem[]> {
        return this.http.get<PriceListItem[]>(this.apiUrl);
    }

    // ============================
    // OBTENER UNA POR ID (Unificado y Tipado)
    // ============================
    obtenerListaPorId(id: number): Observable<Pricelist> {
        return this.http.get<Pricelist>(`${this.apiUrl}/${id}`).pipe(
            // 💡 Cada vez que se consulte con éxito una lista, actualizamos el estado global de forma automática
            tap((res) => {
                this.monedaActiva.set(res.moneda || 'PEN');
            }),
        );
    }

    // ============================
    // ACTUALIZAR
    // ============================
    actualizarLista(
        id: number,
        payload: Omit<Pricelist, 'id'>,
    ): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(
            `${this.apiUrl}/${id}`,
            payload,
        );
    }

    // ============================
    // ELIMINAR
    // ============================
    eliminarLista(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(
            `${`${this.apiUrl}/${id}`}`,
        );
    }
}
