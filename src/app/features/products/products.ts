import {
    Component,
    signal,
    computed,
    inject,
    PLATFORM_ID,
    OnInit,
} from '@angular/core';

import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../core/services/products';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../core/interfaces/product.interface';
import { CategoriesService } from '../../core/services/categories.service';
import { MatIcon } from '@angular/material/icon';
import { Navpage } from '../../shared/components/navpage/navpage';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [ProductCard, MatIcon, Navpage],
    templateUrl: './products.html',
    styleUrl: './products.css',
})
export class Products implements OnInit {
    private categoriesService = inject(CategoriesService);
    private productsService = inject(ProductsService);
    private platformId = inject(PLATFORM_ID);

    readonly categories = signal<any[]>([]);
    readonly categoriesList = computed(() => this.categories());

    selectedCategory1 = signal('');
    selectedCategory2 = signal('');

    products = signal<Product[]>([]);
    search = signal('');
    searchTerm = signal('');

    // --- NUEVOS SIGNALS PARA PAGINACIÓN ---
    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(10); // Cambia este número por cuántos productos quieres por página

    // 1. Mantenemos tu filtro original intacto
    filteredProducts = computed(() => {
        const search = this.normalizeText(this.searchTerm());
        const categoryId = this.selectedCategory1();

        return this.products().filter((product) => {
            const matchesSearch = this.normalizeText(product.nombre).includes(
                search,
            );

            const matchesCategory =
                !categoryId || String(product.categoria.id) === categoryId;

            return matchesSearch && matchesCategory;
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
