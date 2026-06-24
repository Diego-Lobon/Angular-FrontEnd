import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PricelistService } from '../../core/services/pricelist.service';
import { AuthClienteService } from '../../core/services/auth-cliente.service'; // 💡 Asegurar la importación
import { CartItem } from './cart-redis.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuotationService {
    private http = inject(HttpClient);
    private pricelistService = inject(PricelistService);
    private authClienteService = inject(AuthClienteService); // 💡 Inyectado globalmente
    private apiUrl = `${environment.api_nest}/quotation`;

    generatePdf(
        products: CartItem[],
        username: string | null,
        idPrecioLista: number | null,
        invoiceData?: any,
    ) {
        const monedaActual = products[0]?.moneda || 'PEN';
        // 💡 Saber si el usuario inició sesión evaluando si existe un Token o un ID válido
        const isLoggedIn = !!this.authClienteService.getNombre();

        const body = {
            moneda: monedaActual,
            username: invoiceData?.razonSocial || username,
            id_precio_lista: idPrecioLista,
            products: this.mapProductsToDto(products, monedaActual),
            tipo_documento: invoiceData?.tipoDocumento || 'RUC',
            numero_documento: invoiceData?.numeroDocumento || '',
            direccion: invoiceData?.direccion || '',
            email: invoiceData?.email || 'ventas@isur.com',
            solicitante: invoiceData?.solicitante || '',
            isLoggedIn: isLoggedIn, // 💡 Enviamos la bandera calculada
        };

        return this.http
            .post(`${this.apiUrl}/pdf`, body, { responseType: 'blob' })
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
        invoiceData?: any,
        quotationId?: number | string, // 👈 1. Añadimos el ID real opcional que viene de NestJS
    ) {
        const monedaActual = products[0]?.moneda || 'PEN';
        const isLoggedIn = !!this.authClienteService.getNombre();

        const body = {
            moneda: monedaActual,
            username: invoiceData?.razonSocial || username,
            id_precio_lista: idPrecioLista,
            products: this.mapProductsToDto(products, monedaActual),
            tipo_documento: invoiceData?.tipoDocumento || 'RUC',
            numero_documento: invoiceData?.numeroDocumento || '',
            direccion: invoiceData?.direccion || '',
            email: invoiceData?.email || 'ventas@isur.com',
            solicitante: invoiceData?.solicitante || '',
            isLoggedIn: isLoggedIn,
            quotationId: quotationId || null, // 👈 2. Se lo enviamos al Backend en el body
        };

        return this.http
            .post(`${this.apiUrl}/pdf-valid`, body, { responseType: 'blob' })
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;

                    // 💡 Renombrado dinámico según si es el oficial o no
                    const nameTag = quotationId
                        ? `Oficial_${quotationId}`
                        : isLoggedIn
                          ? 'Cliente'
                          : 'Anonimo';
                    a.download = `Cotizacion_${nameTag}.pdf`;

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                },
                error: (err) => console.error('Error al descargar PDF:', err),
            });
    }

    private mapProductsToDto(products: CartItem[], moneda: string): any[] {
        const esDolar = moneda === 'USD' || moneda.includes('USD');
        return products.map((p: any) => {
            const precioCorrecto = esDolar
                ? p.price_dolares || p.precio_dolar || p.price || 0
                : p.price_soles || p.precio_soles || p.price || 0;

            return {
                referencia_interna:
                    p.referencia_interna || p.codigo || 'REF-GENERICA',
                nombre: p.name || p.nombre,
                precio_venta: Number(precioCorrecto),
                cantidad: Number(p.cantidad || p.quantity || 1),
            };
        });
    }

    // En tu frontend: src/app/core/services/quotation.service.ts
    sendQuotation(payload: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/save`, payload);
    }

    // En tu QuotationService
    getAllCotizaciones(): Observable<any> {
        // 👈 Cambiamos a ${this.apiUrl}/list
        return this.http.get<any>(`${this.apiUrl}/list`);
    }

    updateEstado(id: number, estado: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado });
        // Nota: Si tu backend usa POST en lugar de PATCH, cámbialo a this.http.post(...)
    }

    // En tu QuotationService
    getCotizacionById(id: string): Observable<any> {
        // Quitamos { responseType: 'blob' } para permitir que el error JSON llegue
        return this.http.get(`${this.apiUrl}/download/${id}`);
    }

    deleteCotizacion(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
