import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { QuotationService } from '../../core/services/quotation.service'; // 👈 Asegura tu ruta real
import { environment } from '../../../environments/environment';

export type EstadoCotizacion = 'PROCESO' | 'ACEPTADO' | 'RECHAZADO';

export interface CotizacionCliente {
    id: number;
    numero_cotizacion: string; // Mantiene el nro para compatibilidad
    nro_cotizacion_oficial: string; // Nuevo
    tipo_documento: string; // Nuevo
    numero_documento: string; // Nuevo
    razon_social: string; // Nuevo
    nombre_cliente: string;
    fecha_creacion: Date; // Cambiado de fechaEnvio a fecha_creacion
    estado: EstadoCotizacion;
    pdf_url: string;
}

@Component({
    selector: 'app-admin-admin-cotizaciones',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
    templateUrl: './admin-cotizaciones.html',
    styleUrl: './admin-cotizaciones.css',
})
export class AdminCotizaciones implements OnInit {
    private quotationService = inject(QuotationService); // 👈 Inyectamos tu servicio

    readonly cotizaciones = signal<CotizacionCliente[]>([]);
    readonly filtroBusqueda = signal<string>('');
    readonly filtroEstado = signal<string>('TODOS');

    private apiUrl = `${environment.api_nest}`;

    readonly cotizacionesFiltradas = computed(() => {
        const busqueda = this.filtroBusqueda().toLowerCase().trim();
        const estado = this.filtroEstado();

        return this.cotizaciones().filter((c) => {
            // Usamos ?. para evitar errores si la propiedad es undefined/null
            // y || '' para convertirlo a string vacío si no existe.
            const numCot = (c.numero_cotizacion || '').toLowerCase();
            const nomCliente = (c.nombre_cliente || '').toLowerCase();
            const id = String(c.id || '');

            const cumpleBusqueda =
                numCot.includes(busqueda) ||
                nomCliente.includes(busqueda) ||
                id.includes(busqueda);

            const cumpleEstado = estado === 'TODOS' || c.estado === estado;
            return cumpleBusqueda && cumpleEstado;
        });
    });

    ngOnInit() {
        this.cargarCotizaciones();
    }

    verPdf(url: string) {
        url = `${this.apiUrl}${url}`;
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('No hay un archivo PDF asociado.');
        }
    }

    async descargarPdf(pdfUrl: string, nombreArchivo: string) {
        if (!pdfUrl) return;

        // Aseguramos la URL completa
        const url = `${this.apiUrl}${pdfUrl}`;

        try {
            // 1. Descargamos el archivo como un BLOB (Binary Large Object)
            const response = await fetch(url);

            if (!response.ok) throw new Error('No se pudo obtener el archivo');

            const blob = await response.blob();

            // 2. Creamos una URL temporal para el objeto blob
            const urlBlob = window.URL.createObjectURL(blob);

            // 3. Creamos el link temporal y forzamos el click
            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = `Cotizacion_${nombreArchivo}.pdf`;

            document.body.appendChild(link);
            link.click();

            // 4. Limpiamos
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al descargar:', error);
            alert(
                'No se pudo descargar el archivo. Verifica la conexión o permisos.',
            );
        }
    }

    // En tu clase AdminCotizaciones
    eliminarCotizacion(id: number) {
        if (
            confirm(
                '¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.',
            )
        ) {
            this.quotationService.deleteCotizacion(id).subscribe({
                next: () => {
                    // Filtramos la cotización eliminada de la señal actual
                    this.cotizaciones.update((lista) =>
                        lista.filter((c) => c.id !== id),
                    );
                    console.log(`Cotización #${id} eliminada correctamente.`);
                },
                error: (err) => {
                    console.error('Error al eliminar:', err);
                    alert(
                        'No se pudo eliminar la cotización, intenta de nuevo.',
                    );
                },
            });
        }
    }

    // 💡 Carga los datos reales del Backend NestJS
    // En admin-cotizaciones.ts (Angular)
    cargarCotizaciones() {
        this.quotationService.getAllCotizaciones().subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    const datosMapeados: CotizacionCliente[] = res.data.map(
                        (item: any) => ({
                            id: item.id,
                            numero_cotizacion: item.numero_cotizacion, // Asignación directa
                            nro_cotizacion_oficial: item.nro_cotizacion_oficial,
                            tipo_documento: item.tipo_documento,
                            numero_documento: item.numero_documento,
                            razon_social: item.razon_social,
                            nombre_cliente:
                                item.cliente?.nombre || 'Sin nombre',
                            fecha_creacion: new Date(item.fecha_creacion),
                            estado: item.estado,
                            pdf_url: item.pdf_url,
                        }),
                    );
                    this.cotizaciones.set(datosMapeados);
                }
            },
            error: (err) => console.error('Error al cargar:', err),
        });
    }

    // 💡 Cambia el estado en la interfaz reactiva (Signal) e impacta la base de datos
    cambiarEstado(id: number, nuevoEstado: EstadoCotizacion) {
        // 1. Optimistic update (Cambio rápido en el frontend para mantener la fluidez)
        const listaPrevia = this.cotizaciones();
        this.cotizaciones.update((lista) =>
            lista.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)),
        );

        // 2. Persistencia en la base de datos
        this.quotationService.updateEstado(id, nuevoEstado).subscribe({
            next: (res) => {
                console.log(
                    `Cotización #${id} actualizada con éxito en la Base de Datos.`,
                );
            },
            error: (err) => {
                console.error(
                    'Error al actualizar el estado en el servidor:',
                    err,
                );
                // Si falla el servidor, revertimos el cambio en el Signal para no mentirle al usuario
                this.cotizaciones.set(listaPrevia);
            },
        });
    }
}
