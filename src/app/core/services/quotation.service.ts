import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class QuotationService {
    private apiUrl = 'http://192.168.18.38:3000/quotation';

    constructor(private http: HttpClient) {}

    // Visualizar PDF en una pestaña nueva (Ideal para PC y Móvil)
    generatePdf(products: any[]) {
        const body = { products: this.mapProductsToDto(products) };

        return this.http
            .post(`${this.apiUrl}/pdf`, body, { responseType: 'blob' })
            .subscribe({
                next: (blob) => {
                    // Creamos la URL del archivo en la memoria del navegador
                    const url = window.URL.createObjectURL(blob);
                    // Abre el visor de PDFs nativo del navegador (Chrome, Safari, etc.) en otra pestaña
                    window.open(url, '_blank');
                },
                error: (err) =>
                    console.error('Error al visualizar el PDF:', err),
            });
    }

    // 📥 Descargar PDF directamente como archivo
    generatePdfValid(products: any[]) {
        const body = { products: this.mapProductsToDto(products) };

        return this.http
            .post(`${this.apiUrl}/pdf-valid`, body, { responseType: 'blob' })
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cotizacion_validada.pdf';
                    document.body.appendChild(a);
                    a.click();

                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                },
                error: (err) =>
                    console.error('Error al descargar el PDF:', err),
            });
    }

    // Mapeador para cumplir con el DTO de NestJS
    // Mapeador para cumplir con el DTO de NestJS
    private mapProductsToDto(products: any[]): any[] {
        return products.map((p) => ({
            referencia_interna:
                p.referencia_interna || p.codigo || 'REF-GENERICA',
            nombre: p.nombre || p.name,
            precio_venta: Number(p.precio_venta || p.price || 0),

            // 💡 SOLUCON: Extrae 'cantidad' del CartItem y envíalo como 'cantidad' hacia el DTO de NestJS
            cantidad: Number(p.cantidad || p.quantity || p.cant || 1),
        }));
    }
}
