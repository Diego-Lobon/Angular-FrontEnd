import {
    Component,
    signal,
    inject,
    PLATFORM_ID,
    computed,
    Signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../core/interfaces/product.interface';
import { CategoriesService } from '../../core/services/categories.service';
import { MarcasService } from '../../core/services/marcas.service';
import { ProductsService } from '../../core/services/products';
import { AdminProductCard } from './components/admin-product-card/admin-product-card';

@Component({
    selector: 'app-admin-products',
    imports: [CommonModule, MatIconModule, AdminProductCard],
    templateUrl: './admin-products.html',
    styleUrl: './admin-products.css',
})
export class AdminProducts {
    private categoriesService = inject(CategoriesService);
    private marcasService = inject(MarcasService);
    private productsService = inject(ProductsService);
    private platformId = inject(PLATFORM_ID);

    // * SOLO PARA CATEGORIAS
    readonly categories = signal<any[]>([]);
    readonly categoriesList = computed(() => this.categories());
    selectedCategory = signal('');

    // * SOLO PARA MARCAS
    readonly marcas = signal<any[]>([]);
    readonly marcasList = computed(() => this.marcas());
    selectedMarca = signal('');

    products = signal<Product[]>([]);
    search = signal('');
    searchTerm = signal('');

    // * --- NUEVOS SIGNALS PARA PAGINACIÓN ---
    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(10); // Cambia este número por cuántos productos quieres por página

    // 1. Mantenemos tu filtro original intacto
    filteredProducts = computed(() => {
        const search = this.normalizeText(this.searchTerm());
        const categoryId = this.selectedCategory();
        const marcaId = this.selectedMarca();

        return this.products().filter((product) => {
            const matchesSearch = this.normalizeText(product.nombre).includes(
                search,
            );

            const matchesCategory =
                !categoryId || String(product.categoria.id) === categoryId;

            const matchesMarca =
                !marcaId || String(product.marca.id) === marcaId;

            return matchesSearch && matchesCategory && matchesMarca;
        });
    });

    // 2. NUEVO: Corta los productos filtrados según la página actual
    paginatedProducts = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();
        return this.filteredProducts().slice(startIndex, endIndex);
    });

    // 3. NUEVO: Calcula dinámicamente el número total de páginas
    totalPages = computed(() => {
        return Math.ceil(this.filteredProducts().length / this.itemsPerPage());
    });

    // 4. NUEVO: Crea una lista de números [1, 2, 3...] para renderizar los botones
    pageNumbers = computed(() => {
        const pages = [];
        for (let i = 1; i <= this.totalPages(); i++) {
            pages.push(i);
        }
        return pages;
    });

    normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // elimina tildes
            .replace(/[^a-z0-9]/g, ''); // elimina símbolos, espacios, guiones, etc.
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.productsService.getProducts().subscribe((products) => {
                this.products.set(products);
            });

            this.categoriesService.getCategories().subscribe((categories) => {
                console.log(categories);
                this.categories.set(categories);
            });

            this.marcasService.getMarcas().subscribe((marcas) => {
                console.log(marcas);
                this.marcas.set(marcas);
            });
        }
    }

    onSearch(event: Event) {
        const input = event.target as HTMLInputElement;
        this.search.set(input.value);
    }

    // --- NUEVO MÉTODO PARA CAMBIAR DE PÁGINA ---
    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);

            // Hace un scroll suave hacia arriba de la pantalla al cambiar de sección
            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }
}
