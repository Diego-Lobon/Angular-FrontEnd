import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PricelistService } from '../../core/services/pricelist.service';
import { CartItem } from './cart-redis.service'; // 💡 Importa tu interfaz para mantener el tipado

@Injectable({
    providedIn: 'root',
})
export class QuotationService {
    private http = inject(HttpClient);
    private pricelistService = inject(PricelistService);
    private apiUrl = `${environment.api_nest}/quotation`;

    // 💡 Cambiamos 'any[]' por 'CartItem[]' para asegurar consistencia
    generatePdf(
        products: CartItem[],
        username: string | null,
        idPrecioLista: number | null,
    ) {
        const monedaActual = products[0]?.moneda || 'PEN';

        const body = {
            moneda: monedaActual,

            username, // ← usar el parámetro recibido

            id_precio_lista: idPrecioLista,

            products: this.mapProductsToDto(products, monedaActual),
        };

        return this.http
            .post(`${this.apiUrl}/pdf`, body, {
                responseType: 'blob',
            })
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                },
                error: (err) => console.error('Error al visualizar PDF:', err),
            });
    }

    generatePdfValid(
        products: CartItem[],
        username: string | null,
        idPrecioLista: number | null,
    ) {
        const monedaActual = products[0]?.moneda || 'PEN';

        const body = {
            moneda: monedaActual,

            username,

            id_precio_lista: idPrecioLista,

            products: this.mapProductsToDto(products, monedaActual),
        };

        return this.http
            .post(`${this.apiUrl}/pdf-valid`, body, {
                responseType: 'blob',
            })
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement('a');

                    a.href = url;

                    a.download = 'cotizacion_validada.pdf';

                    document.body.appendChild(a);

                    a.click();

                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);
                },
            });
    }

    // 💡 Mapeador optimizado usando las propiedades reales de tu CartItem
    // quotation.service.ts (Angular)
    private mapProductsToDto(products: CartItem[], moneda: string): any[] {
        const esDolar = moneda === 'USD' || moneda.includes('USD');

        return products.map((p: any) => {
            // 💡 Buscamos todas las variantes posibles en las que Redis o el tipado guarde el precio
            const precioCorrecto = esDolar
                ? p.price_dolares || p.precio_dolar || p.price || 0
                : p.price_soles || p.precio_soles || p.price || 0;

            return {
                referencia_interna:
                    p.referencia_interna || p.codigo || 'REF-GENERICA',
                nombre: p.name || p.nombre,
                precio_venta: Number(precioCorrecto), // Enviará el valor numérico exacto
                cantidad: Number(p.cantidad || p.quantity || 1),
            };
        });
    }
}
