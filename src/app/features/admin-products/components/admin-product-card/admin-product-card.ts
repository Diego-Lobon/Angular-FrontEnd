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

    selectedCategoryName = '';
    selectedMarcaName = '';

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product']) {
            this.editMode = false;
            this.resetEditableProduct();
        }
    }

    private resetEditableProduct() {
        if (this.product) {
            this.editableProduct = {
                ...this.product,
                nombre: this.product.nombre || '',
                precio_venta_dolares: this.product.precio_venta_dolares,
                precio_venta_soles: this.product.precio_venta_soles,
            };
            this.selectedCategoryName = this.product.categoria?.nombre || '';
            this.selectedMarcaName = this.product.marca?.nombre || '';
        }
    }

    toggleEdit() {
        if (this.editMode) {
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
