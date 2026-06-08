import { Component, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// En valid-cotizacion.ts cambia las rutas para forzar el aislamiento:
import { PdfValidationService } from './../../core/services/pdf-validation.service';
import { QuotationCreateService } from './../../core/services/quotation-create.service';

@Component({
    selector: 'app-valid-cotizacion',
    standalone: true,
    imports: [MatIconModule, ReactiveFormsModule],
    templateUrl: './valid-cotizacion.html',
    styleUrl: './valid-cotizacion.css',
})
export class ValidCotizacion {
    clientes = [
        'SOUTHERN PERU COPPER CORPORATION, SUCURSAL DEL PERÚ',
        'MINING COMPANY SERVICES S.A.C',
        'SERV.PERUANOS DEL SUR ING.CONTRAT.SRLTDA',
    ];

    listasPrecio = ['SPCC', 'GRUPO', 'AMI SERVICIOS', 'STEELPRO'];

    terminosPago = [
        'Pago inmediato',
        '15 días',
        '21 días',
        '30 días',
        '45 días',
    ];

    selectedFile: File | null = null;

    result = signal<any>(null);
    isLoading = signal(false);
    showQuotationForm = signal(false);

    private fb = inject(FormBuilder);
    private pdfValidationService = inject(PdfValidationService);
    private quotationCreateService = inject(QuotationCreateService);

    quotationForm = this.fb.group({
        cliente: ['', Validators.required],
        listaPrecio: ['', Validators.required],
        terminoPago: ['', Validators.required],
        observacion: [''],
    });


    toggleQuotationForm() {
        this.showQuotationForm.update((value) => !value);
    }

    createQuotation() {
        if (this.quotationForm.invalid) {
            this.quotationForm.markAllAsTouched();
            return;
        }

        const quotationData = {
            cliente: this.quotationForm.value.cliente,
            listaPrecio: this.quotationForm.value.listaPrecio,
            terminoPago: this.quotationForm.value.terminoPago,
            observacion: this.quotationForm.value.observacion,
            products: this.result()?.products ?? [],
        };

        console.log('Enviando cotización');
        console.log(quotationData);

        this.quotationCreateService.createQuotation(quotationData).subscribe({
            next: (response) => {
                console.log(response);
                alert('Cotización creada correctamente');
            },
            error: (error) => {
                console.error(error);
                alert('Error al crear la cotización');
            },
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files?.length) {
            this.selectedFile = input.files[0];
            this.result.set(null);
        }
    }

    uploadPdf() {
        if (!this.selectedFile) {
            return;
        }

        this.result.set(null);
        this.isLoading.set(true);

        this.pdfValidationService.validatePdf(this.selectedFile).subscribe({
            next: (response) => {
                this.result.set(response);
            },
            error: (error) => {
                console.error(error);
            },
            complete: () => {
                this.isLoading.set(false);
            },
        });
    }
}
