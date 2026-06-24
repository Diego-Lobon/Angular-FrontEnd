import {
    Component,
    signal,
    inject,
    PLATFORM_ID,
    computed,
    OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../core/interfaces/product.interface';
import { CategoriesService } from '../../core/services/categories.service';
import { MarcasService } from '../../core/services/marcas.service';
import { ProductsService } from '../../core/services/products.service';
import { AdminProductCard } from './components/admin-product-card/admin-product-card';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, MatIconModule, AdminProductCard],
    templateUrl: './admin-products.html',
    styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit {
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

    // * --- SIGNALS PARA PAGINACIÓN ---
    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(10);

    // Valor fallback por si la base de datos tarda en responder
    readonly tipoCambio = signal<number>(3.75);

    loadingSunat = signal<boolean>(false);

    // =========================================================
    // NUEVO MÉTODO: Carga inicial del tipo de cambio desde la BD
    // =========================================================
    cargarTipoCambioDesdeBD() {
        this.productsService.getTipoCambioBD().subscribe({
            next: (res) => {
                if (res && res.dolar) {
                    this.tipoCambio.set(Number(res.dolar));
                    console.log(
                        'Tipo de cambio recuperado con éxito desde la BD:',
                        res.dolar,
                    );
                }
            },
            error: (err) => {
                console.error(
                    'No se pudo obtener el Tipo de Cambio persistido de la BD:',
                    err,
                );
            },
        });
    }

    consultarSunat() {
        this.loadingSunat.set(true);
        this.productsService.getTipoCambioSunat().subscribe({
            next: (res) => {
                if (res && res.venta > 0) {
                    this.tipoCambio.set(res.venta);
                    console.log(
                        'Tipo de cambio actualizado con éxito desde SUNAT:',
                        res.venta,
                    );
                }
                this.loadingSunat.set(false);
            },
            error: (err) => {
                console.error(
                    'Error al extraer TC de la SUNAT a través de NestJS:',
                    err,
                );
                alert(
                    'No se pudo extraer el tipo de cambio automáticamente. Inténtalo de nuevo.',
                );
                this.loadingSunat.set(false);
            },
        });
    }

    // Filtro original
    filteredProducts = computed(() => {
        const search = this.normalizeText(this.searchTerm());
        const categoryId = this.selectedCategory();
        const marcaId = this.selectedMarca();

        return this.products().filter((product) => {
            const matchesSearch = this.normalizeText(product.nombre).includes(
                search,
            );

            const matchesCategory =
                !categoryId || String(product.categoria?.id) === categoryId;

            const matchesMarca =
                !marcaId || String(product.marca?.id) === marcaId;

            return matchesSearch && matchesCategory && matchesMarca;
        });
    });

    // Corta los productos filtrados según la página actual
    paginatedProducts = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();
        return this.filteredProducts().slice(startIndex, endIndex);
    });

    // Calcula dinámicamente el número total de páginas
    totalPages = computed(() => {
        return Math.ceil(this.filteredProducts().length / this.itemsPerPage());
    });

    // Crea una lista de números [1, 2, 3...] para renderizar los botones
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
            this.cargarTipoCambioDesdeBD();

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

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);

            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    updateTipoCambio(value: string) {
        const num = parseFloat(value);

        if (isNaN(num) || num <= 0) {
            alert('Por favor, ingresa un tipo de cambio válido y mayor a 0.');
            return;
        }

        this.productsService.saveTipoCambioHistorico(num).subscribe({
            next: (savedLog) => {
                console.log(
                    '¡Tipo de cambio actualizado/respaldado en la BD con ID:',
                    savedLog.id, // Mostrará 1
                    'y Valor:',
                    savedLog.dolar, // Mostrará el nuevo tipo de cambio (ej. 3.386)
                );
            },
            error: (err) => {
                console.error(
                    'No se pudo guardar el histórico del TC en la BD:',
                    err,
                );
            },
        });

        this.tipoCambio.set(num);
        console.log('Nuevo tipo de cambio aplicado globalmente:', num);

        const uploadObservables = this.products()
            .map((product) => {
                let hasChanges = false;

                const precioVentaDolares = product.precio_venta_dolares
                    ? Number(product.precio_venta_dolares)
                    : 0;

                let nuevoPrecioVentaSoles = product.precio_venta_soles
                    ? Number(product.precio_venta_soles)
                    : 0;

                if (precioVentaDolares > 0) {
                    nuevoPrecioVentaSoles =
                        Math.round(precioVentaDolares * num * 100) / 100;
                    hasChanges = true;
                }

                if (!hasChanges) return null;

                // ❌ Se eliminaron 'costo_dolares' y 'costo_soles' de este objeto
                const payload = {
                    nombre: product.nombre,
                    precio_venta_dolares: precioVentaDolares,
                    precio_venta_soles: nuevoPrecioVentaSoles,
                    categoriaId: product.categoria?.id
                        ? Number(product.categoria.id)
                        : null,
                    marcaId: product.marca?.id
                        ? Number(product.marca.id)
                        : null,
                };

                return {
                    id: product.id,
                    observable: this.productsService.updateProduct(
                        product.id,
                        payload,
                    ),
                };
            })
            .filter((item) => item !== null);

        if (uploadObservables.length === 0) {
            console.log(
                'No se encontraron productos aptos para recalcular con el Tipo de Cambio.',
            );
            return;
        }

        let completados = 0;
        uploadObservables.forEach((item) => {
            if (item) {
                item.observable.subscribe({
                    next: (responseFromDB) => {
                        completados++;

                        this.products.update((list) =>
                            list.map((p) =>
                                p.id === item.id
                                    ? { ...p, ...responseFromDB }
                                    : p,
                            ),
                        );

                        if (completados === uploadObservables.length) {
                            alert(
                                '¡Todos los productos actualizados y Tipo de Cambio registrado en BD!',
                            );
                        }
                    },
                    error: (err) => {
                        console.error(
                            `Error al actualizar el producto ID ${item.id}:`,
                            err,
                        );
                    },
                });
            }
        });
    }

    saveProductChanges(updatedProduct: Product) {
        console.log('Enviando cambios al Backend de NestJS:', updatedProduct);

        // ❌ Se eliminaron 'costo_dolares' y 'costo_soles' de este objeto también
        const payload = {
            nombre: updatedProduct.nombre,
            precio_venta_dolares: Number(updatedProduct.precio_venta_dolares),
            precio_venta_soles: Number(updatedProduct.precio_venta_soles),
            categoriaId: updatedProduct.categoria?.id
                ? Number(updatedProduct.categoria.id)
                : null,
            marcaId: updatedProduct.marca?.id
                ? Number(updatedProduct.marca.id)
                : null,
        };

        this.productsService
            .updateProduct(updatedProduct.id, payload)
            .subscribe({
                next: (responseFromDB) => {
                    console.log(
                        '¡Producto guardado exitosamente en DB!',
                        responseFromDB,
                    );

                    this.products.update((list) =>
                        list.map((p) =>
                            p.id === updatedProduct.id
                                ? { ...p, ...responseFromDB }
                                : p,
                        ),
                    );
                },
                error: (err) => {
                    console.error(
                        'Error al intentar guardar el producto en la base de datos:',
                        err,
                    );
                    alert('No se pudieron guardar los cambios en el servidor.');
                },
            });
    }

    syncFilteredPricesToOdoo() {
        const filteredlist = this.filteredProducts();

        if (filteredlist.length === 0) {
            alert('No hay productos en la lista actual para sincronizar.');
            return;
        }

        const confirmar = confirm(
            `¿Estás seguro de que deseas actualizar los costos y precios de los ${filteredlist.length} productos filtrados directamente en Odoo?`,
        );

        if (!confirmar) return;

        console.log(
            'Sincronizando productos filtrados con Odoo...',
            filteredlist,
        );

        this.productsService.syncPricesToOdoo(filteredlist).subscribe({
            next: (res) => {
                console.log('Respuesta de Odoo:', res);
                alert(`¡Sincronización Completada!\n${res.message}`);
            },
            error: (err) => {
                console.error('Error al sincronizar con Odoo:', err);
                alert(
                    'Hubo un error al intentar actualizar los precios en Odoo.',
                );
            },
        });
    }
}
