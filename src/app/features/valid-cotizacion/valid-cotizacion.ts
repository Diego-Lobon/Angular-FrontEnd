import {
    Component,
    signal,
    inject,
    HostListener,
    OnInit,
    DestroyRef,
    ChangeDetectorRef,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// 💡 IMPORTANTE: Operadores de RxJS restaurados
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// 💡 IMPORTANTE: Servicios e interfaces restaurados
import { PdfValidationService } from './../../core/services/pdf-validation.service';
import { QuotationCreateService } from './../../core/services/quotation-create.service';
import {
    PricelistService,
    PriceListItem,
} from './../../core/services/pricelist.service';
import { AuthClienteService } from '../../core/services/auth-cliente.service';
import { ActivatedRoute } from '@angular/router'; // 1. Importa ActivatedRoute
import { environment } from '../../../environments/environment';
import { QuotationService } from '../../core/services/quotation.service';

@Component({
    selector: 'app-valid-cotizacion',
    standalone: true,
    imports: [MatIconModule, ReactiveFormsModule],
    templateUrl: './valid-cotizacion.html',
    styleUrl: './valid-cotizacion.css',
})
export class ValidCotizacion implements OnInit {
    clientesFiltrados = signal<string[]>([]);
    clientesOdoo = signal<string[]>([]);
    showClientes = signal(false);
    listasPrecio = signal<PriceListItem[]>([]);

    terminosPago = [
        { id: 1, name: 'Pago inmediato' },
        { id: 2, name: '15 días' },
        { id: 3, name: '21 días' },
        { id: 4, name: '30 días' },
        { id: 5, name: '45 días' },
        { id: 6, name: 'Fin del siguiente mes' },
        { id: 7, name: '10 días después del fin del siguiente mes' },
        { id: 8, name: '30% ahora, el resto en 60 días' },
        { id: 9, name: '2/7 neto 30' },
        { id: 10, name: '90 días, en el día 10' },
    ];

    selectedFile: File | null = null;
    result = signal<any>(null);
    isLoading = signal(false);
    showQuotationForm = signal(false);

    isSubmitting = signal(false);
    toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(
        null,
    );

    private authClienteService = inject(AuthClienteService);
    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);
    private pdfValidationService = inject(PdfValidationService);
    private quotationCreateService = inject(QuotationCreateService);
    private pricelistService = inject(PricelistService);
    private quotationAutomatic = inject(QuotationService);

    private route = inject(ActivatedRoute);

    private cdr = inject(ChangeDetectorRef);

    quotationForm = this.fb.group({
        cliente: ['', Validators.required],
        listaPrecio: ['', Validators.required],
        terminoPago: ['', Validators.required],
        observacion: [''],
    });

    pdfUrl: string = '';

    ngOnInit() {
        // Cargar clientes UNA SOLA VEZ
        this.cargarClientesIniciales();

        // Buscar localmente mientras escribe
        this.quotationForm
            .get('cliente')
            ?.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((texto) => {
                const query = texto?.toLowerCase().trim() ?? '';

                const filtrados =
                    query === ''
                        ? this.clientesOdoo().slice(0, 10)
                        : this.clientesOdoo()
                              .filter((cliente) =>
                                  cliente.toLowerCase().includes(query),
                              )
                              .slice(0, 10);

                this.clientesFiltrados.set(filtrados);

                this.showClientes.set(filtrados.length > 0);
            });

        // Cargar listas de precios
        this.pricelistService.obtenerListas().subscribe({
            next: (res: PriceListItem[]) => {
                this.listasPrecio.set(res);
            },

            error: (err) => console.error('Error cargando listas', err),
        });

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.cargarCotizacionPorId(id);
            }
        });
    }

    // Dentro de tu clase ValidCotizacion

    // En valid-cotizacion.ts
    private async cargarCotizacionPorId(id: string) {
        this.isLoading.set(true);
        try {
            const response = await fetch(
                `${environment.api_nest}/quotation/download/${id}`,
            );

            if (!response.ok) throw new Error('No se pudo descargar');

            // 💡 1. Obtenemos el nombre desde nuestro header personalizado
            const fileName =
                response.headers.get('X-File-Name') || `cotizacion_${id}.pdf`;

            const blob = await response.blob();

            // 2. Usamos el nombre real para crear el objeto File
            this.selectedFile = new File([blob], fileName, {
                type: 'application/pdf',
            });

            console.log('Archivo cargado con nombre:', fileName);

            this.showQuotationForm.set(true);
            this.cdr.detectChanges();
        } catch (err: any) {
            console.error('Error al cargar:', err);
        } finally {
            this.isLoading.set(false);
        }
    }
    
    private cargarClientesIniciales() {
        this.quotationCreateService.buscarClientes('').subscribe({
            next: (res: any) => {
                this.clientesOdoo.set(res.clientes);

                // console.log('Clientes cargados:', res.clientes.length);
            },
            error: (err) => console.error('Error cargando clientes', err),
        });
    }

    private seleccionarListaPorDefectoJwt() {
        const idListaJwt = this.authClienteService.getIdPrecioLista();

        if (idListaJwt) {
            // Buscamos en las listas cargadas cuál coincide con el ID del token
            const listaEncontrada = this.listasPrecio().find(
                (lista) => Number(lista.id) === idListaJwt,
            );

            if (listaEncontrada) {
                // Como tu HTML usa el "name" en el select, seteamos ese valor en el formulario
                this.quotationForm.patchValue({
                    listaPrecio: listaEncontrada.name,
                });
                console.log(
                    `Lista de precios '${listaEncontrada.name}' auto-seleccionada desde el JWT.`,
                );
            } else {
                console.warn(
                    `No se encontró una lista de precios con el ID: ${idListaJwt} en las listas disponibles.`,
                );
            }
        }
    }

    onFocusCliente() {
        const valor =
            this.quotationForm.get('cliente')?.value?.toLowerCase().trim() ??
            '';

        const clientes = this.clientesOdoo();

        const filtrados = valor
            ? clientes
                  .filter((c) => c.toLowerCase().includes(valor))
                  .slice(0, 10)
            : clientes.slice(0, 10);

        this.clientesFiltrados.set(filtrados);

        this.showClientes.set(filtrados.length > 0);
    }

    seleccionarCliente(cliente: string) {
        this.quotationForm.patchValue({ cliente }, { emitEvent: false });
        this.showClientes.set(false);
        this.clientesFiltrados.set([]);
    }

    toggleQuotationForm() {
        this.showQuotationForm.update((value: boolean) => !value);
    }

    createQuotation() {
        if (this.quotationForm.invalid || this.isSubmitting()) {
            this.quotationForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        const terminoPagoId = this.quotationForm.value.terminoPago;

        const productosFormateados = (this.result()?.products ?? []).map(
            (p: any) => ({
                codigo: p.codigo,
                nombre: p.nombre,
                cantidad: p.cantidad || 1,
            }),
        );

        const quotationData = {
            cliente: this.quotationForm.value.cliente,
            listaPrecio: this.quotationForm.value.listaPrecio,
            terminoPago: terminoPagoId ? Number(terminoPagoId) : null,
            observacion: this.quotationForm.value.observacion,
            products: productosFormateados,
        };

        this.quotationCreateService.createQuotation(quotationData).subscribe({
            next: (res: any) => {
                // 1. Mostrar mensaje flotante de éxito
                this.showToast(`Cotización creada correctamente`, 'success');

                // 💡 SOLUCIÓN: Llevar el scroll bar al inicio de la página de forma fluida
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth', // Hace que suba con una animación suave
                });

                // 2. Resetear el formulario a sus valores vacíos por defecto
                this.quotationForm.reset({
                    cliente: '',
                    listaPrecio: '',
                    terminoPago: '',
                    observacion: '',
                });

                // 3. Ocultar el formulario desplegable para limpiar la interfaz
                this.showQuotationForm.set(false);

                // Limpiar el estado del validador
                this.result.set(null);
                this.selectedFile = null;

                // Limpiar manualmente el valor del input file en el DOM
                const fileInput = document.querySelector(
                    'input[type="file"]',
                ) as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }

                this.seleccionarListaPorDefectoJwt();
            },
            error: (err: any) => {
                console.error(err);
                this.showToast(
                    'Error al crear la cotización en el servidor',
                    'error',
                );
            },
            complete: () => {
                this.isSubmitting.set(false);
            },
        });
    }

    // 💡 Función auxiliar para mostrar el Toast y ocultarlo automáticamente tras 4 segundos
    private showToast(text: string, type: 'success' | 'error') {
        this.toastMessage.set({ text, type });
        setTimeout(() => {
            this.toastMessage.set(null);
        }, 4000);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.selectedFile = input.files[0];
            this.result.set(null);
        }
    }

    uploadPdf() {
        if (!this.selectedFile) return;
        this.result.set(null);
        this.isLoading.set(true);

        this.pdfValidationService.validatePdf(this.selectedFile).subscribe({
            next: (response: any) => {
                this.result.set(response);
                console.log(response);
                this.seleccionarListaSegunPdf(response.id_precio_lista);
            },
            error: (error: any) => console.error(error),
            complete: () => this.isLoading.set(false),
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.cliente-dropdown')) {
            this.showClientes.set(false);
        }
    }

    private seleccionarListaSegunPdf(idPrecioPdf: number | null) {
        // Validamos que venga un ID real y mayor a 0
        if (idPrecioPdf && idPrecioPdf > 0) {
            const lista = this.listasPrecio().find(
                (l) => Number(l.id) === Number(idPrecioPdf),
            );

            if (lista) {
                this.quotationForm.patchValue({
                    listaPrecio: lista.name,
                });
                return; // Detiene la ejecución aquí si todo fue exitoso
            }
        }

        // 💡 SOLUCIÓN: Si el PDF marca 0, null o la lista no existe en Odoo:
        console.log(
            'El PDF no especificó una tarifa válida (marcó 0 o null). Reseteando campo...',
        );

        this.quotationForm.patchValue({
            listaPrecio: '', // Esto hace que el <select> regrese visualmente a "Seleccione una lista"
        });

        // Opcional: Si aun así quieres intentar aplicar el JWT por defecto en vez de dejarlo vacío,
        // puedes descomentar la línea de abajo:
        // this.seleccionarListaPorDefectoJwt();
    }
}
