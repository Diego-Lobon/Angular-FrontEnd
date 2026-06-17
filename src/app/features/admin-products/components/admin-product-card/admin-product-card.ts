import {
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Product } from '../../../../core/interfaces/product.interface';

@Component({
    selector: 'app-admin-product-card',
    standalone: true,
    imports: [MatIcon, FormsModule, CommonModule, DecimalPipe],
    templateUrl: './admin-product-card.html',
    styleUrl: './admin-product-card.css',
})
export class AdminProductCard implements OnChanges {
    @Input() product!: Product;
    @Input() tipoCambio!: number;
    @Input() categoriesList: any[] = [];
    @Input() marcasList: any[] = [];
    @Output() onSave = new EventEmitter<Product>();

    editMode = false;
    editableProduct!: Product;

    // Variables temporales para los inputs de texto en la edición
    selectedCategoryName = '';
    selectedMarcaName = '';

    // Detecta cuando el padre modifica el producto (por ejemplo, al recalcular el Tipo de Cambio)
    ngOnChanges(changes: SimpleChanges) {
        if (changes['product']) {
            this.editMode = false; // Cancela la edición activa para evitar inconsistencias
            this.resetEditableProduct(); // Recarga los nuevos valores calculados
        }
    }

    private resetEditableProduct() {
        if (this.product) {
            this.editableProduct = {
                ...this.product,
                nombre: this.product.nombre || '',
                costo_dolares: this.product.costo_dolares,
                costo_soles: this.product.costo_soles,
                precio_venta_dolares: this.product.precio_venta_dolares,
                precio_venta_soles: this.product.precio_venta_soles,
            };
            // Cargamos los nombres actuales en los inputs del formulario de edición
            this.selectedCategoryName = this.product.categoria?.nombre || '';
            this.selectedMarcaName = this.product.marca?.nombre || '';
        }
    }

    toggleEdit() {
        if (this.editMode) {
            // Al hacer click en "Actualizar", buscamos los objetos correspondientes en las listas
            const foundCategory = this.categoriesList.find(
                (c) =>
                    c.nombre.toLowerCase() ===
                    this.selectedCategoryName.trim().toLowerCase(),
            );
            const foundMarca = this.marcasList.find(
                (m) =>
                    m.nombre.toLowerCase() ===
                    this.selectedMarcaName.trim().toLowerCase(),
            );

            if (!foundCategory || !foundMarca) {
                alert(
                    'Por favor selecciona una Categoría y Marca válidas de la lista de sugerencias.',
                );
                return;
            }

            // Asignamos las relaciones completas para actualizar la vista local de inmediato
            this.product = {
                ...this.editableProduct,
                categoria: foundCategory,
                marca: foundMarca,
            };

            this.onSave.emit(this.product);
        } else {
            this.resetEditableProduct();
        }
        this.editMode = !this.editMode;
    }

    cancelEdit() {
        this.resetEditableProduct();
        this.editMode = false;
    }

    onImageError(event: Event) {
        const element = event.target as HTMLImageElement;
        element.src = 'assets/products/product-void.jpeg';
    }
}
