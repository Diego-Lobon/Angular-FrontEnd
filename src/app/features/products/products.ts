import {
    Component,
    signal,
    computed,
    inject,
    PLATFORM_ID,
    OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { MarcasService } from '../../core/services/marcas.service';
import { PricelistService } from '../../core/services/pricelist.service';
import { AuthClienteService } from '../../core/services/auth-cliente.service';
import { MatIcon } from '@angular/material/icon';
import { Navpage } from '../../shared/components/navpage/navpage';
import { Product } from '../../core/interfaces/product.interface';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [ProductCard, MatIcon, Navpage],
    templateUrl: './products.html',
    styleUrl: './products.css',
})
export class Products implements OnInit {
    private categoriesService = inject(CategoriesService);
    private marcasService = inject(MarcasService);
    private productsService = inject(ProductsService);
    private pricelistService = inject(PricelistService);
    private authClienteService = inject(AuthClienteService);
    private platformId = inject(PLATFORM_ID);

    readonly categories = signal<any[]>([]);
    selectedCategory = signal('');
    readonly marcas = signal<any[]>([]);
    selectedMarca = signal('');

    products = signal<Product[]>([]);
    searchTerm = signal('');

    // --- SIGNALS DE LA LISTA DE PRECIOS ODOO ---
    isLoading = signal<boolean>(true);
    monedaLista = this.pricelistService.monedaActiva; // Guardará 'PEN', 'USD' o el string que retorne Odoo
    reglasLista = signal<any[]>([]); // Guardará el array de productos de la lista

    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(10);

    // =========================================================================
    // COMPUTED CORREGIDO: PROCESADOR DINÁMICO DE PRECIOS POR CÓDIGO DE PRODUCTO
    // =========================================================================
    productsWithCalculatedPrices = computed(() => {
        const listaOriginal = this.products();
        const reglas = this.reglasLista();
        const moneda = this.monedaLista();

        // 💡 El método getIdPrecioLista() ahora decodifica automáticamente el Token
        const idLista = this.authClienteService.getIdPrecioLista();
        const tieneLista = idLista !== null;

        return listaOriginal.map((product) => {
            let signoMoneda = 'S/.';
            let precioBase = Number(product.precio_venta_soles || 0);

            if (tieneLista) {
                if (moneda.includes('USD') || moneda === 'USD') {
                    signoMoneda = '$';
                    precioBase = Number(product.precio_venta_dolares || 0);
                } else {
                    signoMoneda = 'S/.';
                    precioBase = Number(product.precio_venta_soles || 0);
                }
            }

            let precioFinal = precioBase;

            const reglaAsignada = reglas.find(
                (r) =>
                    r.codigo &&
                    product.referencia_interna &&
                    String(r.codigo).trim() ===
                        String(product.referencia_interna).trim(),
            );

            if (reglaAsignada) {
                if (reglaAsignada.tipoRegla === 'PRECIO_FIJO') {
                    precioFinal = Number(reglaAsignada.precioEditable || 0);
                } else if (reglaAsignada.tipoRegla === 'DESCUENTO') {
                    const descuento = Number(
                        reglaAsignada.descuentoEditable || 0,
                    );
                    precioFinal = precioBase - precioBase * (descuento / 100);
                }
            }

            return {
                ...product,
                custom_price: precioFinal,
                custom_symbol: signoMoneda,
            };
        });
    });

    // Modificamos el filtro original para que use el nuevo computed dinámico
    filteredProducts = computed(() => {
        const search = this.normalizeText(this.searchTerm());
        const categoryId = this.selectedCategory();
        const marcaId = this.selectedMarca();

        return this.productsWithCalculatedPrices().filter((product) => {
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

    paginatedProducts = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();
        return this.filteredProducts().slice(startIndex, endIndex);
    });

    totalPages = computed(() =>
        Math.ceil(this.filteredProducts().length / this.itemsPerPage()),
    );

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
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.isLoading.set(true);

            // 1. Cargar catálogo base de la base de datos central
            this.productsService.getProducts().subscribe({
                next: (products) => {
                    this.products.set(products);

                    // 💡 CAMBIO AQUÍ: Ahora lee directamente de la sesión decodificada del JWT
                    const idListaCliente =
                        this.authClienteService.getIdPrecioLista();

                    if (idListaCliente) {
                        // Consultamos la lista de precios específica a NestJS/FastAPI
                        this.pricelistService
                            .obtenerListaPorId(idListaCliente)
                            .subscribe({
                                next: (res) => {
                                    this.reglasLista.set(res.productos || []);
                                    this.isLoading.set(false);
                                },
                                error: (err) => {
                                    console.error(
                                        'Error al mapear la lista de precios:',
                                        err,
                                    );
                                    this.reglasLista.set([]);
                                    this.isLoading.set(false);
                                },
                            });
                    } else {
                        // Si el token no tiene asignada lista, o no está logueado, forzar Soles por defecto
                        this.monedaLista.set('PEN');
                        this.reglasLista.set([]);
                        this.isLoading.set(false);
                    }
                },
                error: (err) => {
                    console.error('Error cargando catálogo base:', err);
                    this.isLoading.set(false);
                },
            });

            // Cargas complementarias de los filtros
            this.categoriesService
                .getCategories()
                .subscribe((c) => this.categories.set(c));
            this.marcasService.getMarcas().subscribe((m) => this.marcas.set(m));
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }
}
