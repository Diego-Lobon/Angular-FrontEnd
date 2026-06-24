import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientesService } from '../../../../core/services/clientes.service';
import {
    PricelistService,
    PriceListItem,
} from '../../../../core/services/pricelist.service';

@Component({
    selector: 'app-edit-admin-clientes',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
    templateUrl: './edit-admin-clientes.html',
})
export class EditAdminClientes implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private clientesService = inject(ClientesService);
    private pricelistService = inject(PricelistService);

    editForm!: FormGroup;
    clienteId!: number;
    listasPrecios = signal<PriceListItem[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
        this.initForm();
        this.cargarDatos();
    }

    initForm() {
        this.editForm = this.fb.group({
            nombre: ['', [Validators.required]],
            correo: ['', [Validators.email]],
            celular: [''],
            username: ['', [Validators.required]],
            id_precio_lista: [null],
            password: [''], // Campo de contraseña opcional para la edición
        });
    }

    cargarDatos() {
        this.pricelistService.obtenerListas().subscribe((listas) => {
            this.listasPrecios.set(listas);

            this.clientesService
                .obtenerClientePorId(this.clienteId)
                .subscribe((cliente) => {
                    if (cliente) {
                        // EXTRACCIÓN SEGURA: Sacamos el password del objeto antes de pasarlo al formulario
                        const { password, ...datosSinPassword } = cliente;
                        this.editForm.patchValue(datosSinPassword);
                    }
                    this.loading.set(false);
                });
        });
    }

    onSubmit() {
        if (this.editForm.valid) {
            this.loading.set(true);

            const datosActualizados = { ...this.editForm.value };

            // Limpiar el objeto antes de enviar
            if (
                !datosActualizados.password ||
                datosActualizados.password.trim() === ''
            ) {
                delete datosActualizados.password;
            }

            // SOLO ENVIAMOS LOS DATOS. No vuelvas a hacer un get aquí.
            this.clientesService
                .actualizarCliente(this.clienteId, datosActualizados)
                .subscribe({
                    next: (response) => {
                        alert('Cliente actualizado con éxito');
                        this.router.navigate(['/home-clientes']);
                    },
                    error: (error) => {
                        console.error('Error al actualizar:', error);
                        alert('Hubo un error al intentar guardar los cambios.');
                        this.loading.set(false); // Re-habilitar si hay error
                    },
                });
        }
    }
}
