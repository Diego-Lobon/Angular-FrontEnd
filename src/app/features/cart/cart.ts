import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ProductCart } from './components/product-cart/product-cart';
import { MatIconModule } from '@angular/material/icon';
import { QuotationService } from '../../core/services/quotation.service';
import { PricelistService } from '../../core/services/pricelist.service';
import {
    CartRedisService,
    CartItem,
} from '../../core/services/cart-redis.service';
import { IdentidadService } from '../../core/services/identidad.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Navpage } from '../../shared/components/navpage/navpage';
import { AuthClienteService } from '../../core/services/auth-cliente.service';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [
        MatIconModule,
        ProductCart,
        CommonModule,
        Navpage,
        ReactiveFormsModule,
    ],
    templateUrl: './cart.html',
    styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
    private authClienteService = inject(AuthClienteService);
    public cartRedisService = inject(CartRedisService);
    private quotationService = inject(QuotationService);
    private pricelistService = inject(PricelistService);
    private identidadService = inject(IdentidadService);
    private fb = inject(FormBuilder);
    private apiUrl = `${environment.api_nest}`;

    currentProducts: CartItem[] = [];
    private cartSub!: Subscription;

    monedaLista = this.pricelistService.monedaActiva;
    isCurrencyLoaded = signal<boolean>(true);

    isLoadingApi = signal<boolean>(false);
    apiErrorMessage = signal<string | null>(null);
    formSubmitted = signal<boolean>(false);
    quotationProcessedData = signal<any | null>(null);

    private backupDireccion = '';
    private backupEmail = '';

    public quotationForm!: FormGroup;

    ngOnInit() {
        this.initForm();
        this.cartSub = this.cartRedisService.cartItems$.subscribe((items) => {
            this.currentProducts = items;
        });
    }

    get totalSoles(): number {
        return this.currentProducts.reduce((acc, item) => {
            return acc + (item.price_soles || 0) * (item.cantidad || 0);
        }, 0);
    }

    private initForm() {
        const form = this.fb.group({
            tipoDocumento: ['RUC', [Validators.required]],
            numeroDocumento: [
                '',
                [Validators.required, Validators.pattern('^[0-9]{11}$')],
            ],
            razonSocial: ['', [Validators.required, Validators.minLength(3)]],
            direccion: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            solicitante: ['', [Validators.required]],
        });

        this.quotationForm = form;

        form.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
            const numControl = form.get('numeroDocumento');
            const solicitanteControl = form.get('solicitante');

            this.apiErrorMessage.set(null);
            this.formSubmitted.set(false);

            form.patchValue(
                {
                    numeroDocumento: '',
                    razonSocial: '',
                    direccion: '',
                    email: '',
                    solicitante: '',
                },
                { emitEvent: false },
            );

            if (tipo === 'RUC') {
                numControl?.setValidators([
                    Validators.required,
                    Validators.pattern('^[0-9]{11}$'),
                ]);
                solicitanteControl?.setValidators([
                    Validators.required,
                    Validators.minLength(3),
                ]);
            } else {
                numControl?.setValidators([
                    Validators.required,
                    Validators.pattern('^[0-9]{8}$'),
                ]);
                solicitanteControl?.clearValidators();
            }

            numControl?.markAsUntouched();
            form.get('razonSocial')?.markAsUntouched();
            form.get('direccion')?.markAsUntouched();
            solicitanteControl?.markAsUntouched();

            numControl?.updateValueAndValidity();
            solicitanteControl?.updateValueAndValidity();
        });
    }

    onBuscarDocumento() {
        const tipo = this.quotationForm.get('tipoDocumento')?.value;
        const numero = this.quotationForm.get('numeroDocumento')?.value;
        const numControl = this.quotationForm.get('numeroDocumento');

        if (!numControl || numControl.invalid || !numero) return;

        this.isLoadingApi.set(true);
        this.apiErrorMessage.set(null);

        if (tipo === 'RUC') {
            this.identidadService.consultarRuc(numero).subscribe({
                next: (res) => {
                    this.isLoadingApi.set(false);
                    if (res && res.razonSocial) {
                        this.quotationForm.patchValue({
                            razonSocial: res.razonSocial,
                            direccion:
                                res.direccion ||
                                'Dirección no especificada por SUNAT',
                        });
                    } else {
                        this.apiErrorMessage.set(
                            'No se encontró información para el RUC ingresado.',
                        );
                    }
                },
                error: () => {
                    this.isLoadingApi.set(false);
                    this.apiErrorMessage.set(
                        'Error al conectar con el padrón de SUNAT.',
                    );
                },
            });
        } else if (tipo === 'DNI') {
            this.identidadService.consultarDni(numero).subscribe({
                next: (res) => {
                    this.isLoadingApi.set(false);
                    if (res && res.success !== false && res.nombres) {
                        const nombreCompleto = `${res.nombres} ${res.apellidoPaterno} ${res.apellidoMaterno}`;
                        this.quotationForm.patchValue({
                            razonSocial: nombreCompleto,
                        });
                    } else {
                        this.apiErrorMessage.set(
                            'El número de DNI no existe o es inválido.',
                        );
                    }
                },
                error: () => {
                    this.isLoadingApi.set(false);
                    this.apiErrorMessage.set(
                        'Error al conectar con el servicio de RENIEC.',
                    );
                },
            });
        }
    }

    generateQuotation() {
        this.formSubmitted.set(true);
        if (this.currentProducts.length === 0 || this.quotationForm.invalid) {
            this.quotationForm.markAllAsTouched();
            return;
        }
        const formData = this.quotationForm.value;
        this.quotationService.generatePdf(
            this.currentProducts,
            formData.razonSocial,
            null,
            formData,
        );
    }

    downloadQuotation() {
        const dataResponse = this.quotationProcessedData();
        console.log(dataResponse);
        if (!dataResponse) return;

        const cotizacionGuardada = dataResponse.data;
        const idRealBd = cotizacionGuardada?.id;
        console.log(cotizacionGuardada);
        const mockFormData = {
            tipoDocumento: cotizacionGuardada?.tipo_documento,
            numeroDocumento: cotizacionGuardada?.numero_documento,
            razonSocial: cotizacionGuardada?.razon_social,
            direccion: this.backupDireccion,
            email: this.backupEmail,
            solicitante: cotizacionGuardada?.solicitante,
        };

        this.quotationService.generatePdfValid(
            this.currentProducts,
            mockFormData.razonSocial,
            this.authClienteService.getIdPrecioLista() ?? null,
            mockFormData,
            idRealBd,
        );

        this.quotationProcessedData.set(null);
        this.formSubmitted.set(false);
    }

    sendQuotation() {
        this.formSubmitted.set(true);
        if (this.currentProducts.length === 0 || this.quotationForm.invalid) {
            this.quotationForm.markAllAsTouched();
            return;
        }

        const formData = this.quotationForm.value;
        this.isLoadingApi.set(true);
        this.apiErrorMessage.set(null);

        this.backupDireccion = formData.direccion;
        this.backupEmail = formData.email;

        const payload = {
            id_cliente: this.authClienteService.isLoggedIn()
                ? this.authClienteService.getClienteId()
                : undefined,
            id_precio_lista:
                this.authClienteService.getIdPrecioLista() ?? undefined,
            tipo_documento: formData.tipoDocumento,
            numero_documento: formData.numeroDocumento,
            razon_social: formData.razonSocial,
            direccion: formData.direccion,
            email: formData.email,
            solicitante:
                formData.tipoDocumento === 'RUC'
                    ? formData.solicitante
                    : undefined,
            products: this.currentProducts.map((item: any) => ({
                nombre: item.name || item.nombre,
                referencia_interna:
                    item.reference || item.referencia_interna || '',
                precio_venta: Number(
                    item.price_soles || item.precio_venta || 0,
                ),
                cantidad: Number(item.cantidad || 0),
            })),
        };

        this.quotationService.sendQuotation(payload).subscribe({
            next: (res: any) => {
                this.isLoadingApi.set(false);

                if (res && res.pdf_url) {
                    this.quotationProcessedData.set({ data: res });
                    const fullUrl = `${this.apiUrl}${res.pdf_url}`;
                    window.open(fullUrl, '_blank');

                    // --- AGREGA ESTO AQUÍ ---
                    // 1. Limpiamos el formulario (restaura valores iniciales)
                    this.quotationForm.reset({
                        tipoDocumento: 'RUC', // Opcional: aseguras el valor por defecto
                    });

                    // 2. Quitamos marcas de error/toque
                    this.quotationForm.markAsPristine();
                    this.quotationForm.markAsUntouched();
                    this.formSubmitted.set(false);
                    // ------------------------
                } else {
                    this.apiErrorMessage.set(
                        'La cotización se guardó pero no se generó el PDF.',
                    );
                }
            },
            error: (err) => {
                this.isLoadingApi.set(false);
                this.apiErrorMessage.set(
                    'Error: ' +
                        (err.error?.message || 'Fallo en la generación'),
                );
            },
        });
    }

    ngOnDestroy() {
        if (this.cartSub) this.cartSub.unsubscribe();
    }
}
