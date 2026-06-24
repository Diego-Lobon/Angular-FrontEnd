import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../../core/services/categories.service';
import { MarcasService } from '../../../../core/services/marcas.service';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../core/interfaces/product.interface';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
    PricelistService,
    Pricelist,
} from '../../../../core/services/pricelist.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators'; // <-- Importamos finalize para asegurar el apagado del loading

type ReglaTipo = 'DESCUENTO' | 'PRECIO_FIJO';

// Extendemos la interfaz de Producto para no usar 'as any'
type OdooProduct = Product & {
    precio_venta_soles?: number;
    precio_venta_dolares?: number;
    referencia_interna?: string;
};

interface SelectedProductListItem {
    id: number; // Forzamos a que sea estrictamente number para coincidir con PricelistProduct
    codigo: string;
    nombre: string;
    categoria: string;
    marca: string;
    precioEditable: number;
    descuentoEditable: number;
    precioSolesBD: number;
    precioDolaresBD: number;
    tipoRegla: ReglaTipo;
}

@Component({
    selector: 'app-create-list-price',
    imports: [FormsModule, MatIconModule, HttpClientModule, RouterLink],
    templateUrl: './create-list-price.html',
    styleUrl: './create-list-price.css',
})
export class CreateListPrice {
    private categoriesService = inject(CategoriesService);
    private marcasService = inject(MarcasService);
    private productsService = inject(ProductsService);
    private platformId = inject(PLATFORM_ID);
    private pricelistService = inject(PricelistService);

    readonly categories = signal<any[]>([]);
    readonly marcas = signal<any[]>([]);
    readonly allProducts = signal<OdooProduct[]>([]); // Usamos el tipo extendido seguro

    nombreLista = signal<string>('');
    selectedMarcaId = signal<string>('');
    selectedCategoriaId = signal<string>('');
    selectedMoneda = signal<string>('SOLES');
    descuentoBase = signal<number>(0);
    tipoReglaMaestro = signal<ReglaTipo>('DESCUENTO');

    isSubmitting = signal<boolean>(false);

    selectedProductsList = signal<SelectedProductListItem[]>([]);

    modoSeleccion = signal<'FILTROS' | 'INDIVIDUAL'>('FILTROS');
    busquedaProducto = signal<string>('');
    sugerenciasProductos = signal<OdooProduct[]>([]);
    productoIndividualSeleccionado = signal<OdooProduct | null>(null);

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.categoriesService
                .getCategories()
                .subscribe((cats) => this.categories.set(cats));
            this.marcasService
                .getMarcas()
                .subscribe((mrcs) => this.marcas.set(mrcs));
            this.productsService
                .getProducts()
                .subscribe((prods) => this.allProducts.set(prods));
        }
    }

    cambiarModoSeleccion(nuevoModo: 'FILTROS' | 'INDIVIDUAL') {
        this.modoSeleccion.set(nuevoModo);
        this.busquedaProducto.set('');
        this.sugerenciasProductos.set([]);
        this.productoIndividualSeleccionado.set(null);
    }

    buscarProductosPredictivo(termino: string) {
        this.busquedaProducto.set(termino);

        if (!termino.trim()) {
            this.sugerenciasProductos.set([]);
            this.productoIndividualSeleccionado.set(null);
            return;
        }

        const cleanTerm = termino.toLowerCase().trim();
        const filtrados = this.allProducts().filter(
            (p) =>
                p.nombre.toLowerCase().includes(cleanTerm) ||
                (p.referencia_interna &&
                    p.referencia_interna.toLowerCase().includes(cleanTerm)),
        );

        this.sugerenciasProductos.set(filtrados.slice(0, 8)); // Limitamos a un máximo de 8 sugerencias en el dropdown
    }

    // Al hacer clic sobre un elemento del desplegable
    seleccionarSugerencia(producto: OdooProduct) {
        this.busquedaProducto.set(producto.nombre);
        this.productoIndividualSeleccionado.set(producto);
        this.sugerenciasProductos.set([]); // Escondemos el dropdown
    }

    cambiarMonedaGlobal(nuevaMoneda: string) {
        this.selectedMoneda.set(nuevaMoneda);

        this.selectedProductsList.update((productos) =>
            productos.map((prod) => {
                const precioBase =
                    nuevaMoneda === 'SOLES'
                        ? prod.precioSolesBD
                        : prod.precioDolaresBD;
                return {
                    ...prod,
                    precioEditable: precioBase,
                };
            }),
        );
    }

    cambiarReglaFila(item: SelectedProductListItem, nuevaRegla: ReglaTipo) {
        this.selectedProductsList.update((actuales) =>
            actuales.map((p) => {
                if (p.id === item.id) {
                    const precioBase =
                        this.selectedMoneda() === 'SOLES'
                            ? p.precioSolesBD
                            : p.precioDolaresBD;
                    return {
                        ...p,
                        tipoRegla: nuevaRegla,
                        descuentoEditable:
                            nuevaRegla === 'PRECIO_FIJO'
                                ? 0
                                : this.descuentoBase(),
                        precioEditable: precioBase,
                    };
                }
                return p;
            }),
        );
    }

    agregarProductosFiltrados() {
        const moneda = this.selectedMoneda() || 'SOLES';
        const reglaOriginal = this.tipoReglaMaestro();
        const descuento =
            reglaOriginal === 'PRECIO_FIJO' ? 0 : this.descuentoBase();

        let productosAAgregar: OdooProduct[] = [];

        // CASO 1: MODO FILTROS POR MARCA/CATEGORIA
        if (this.modoSeleccion() === 'FILTROS') {
            const marcaId = this.selectedMarcaId();
            const categoriaId = this.selectedCategoriaId();

            productosAAgregar = this.allProducts().filter((product) => {
                const matchesCategory =
                    !categoriaId ||
                    String(product.categoria?.id) === categoriaId;
                const matchesMarca =
                    !marcaId || String(product.marca?.id) === marcaId;
                return matchesCategory && matchesMarca;
            });

            if (productosAAgregar.length === 0) {
                alert(
                    'No se encontraron productos que coincidan con la marca y categoría seleccionadas.',
                );
                return;
            }
        }
        // CASO 2: MODO PRODUCTO INDIVIDUAL ESPECÍFICO
        else {
            const prod = this.productoIndividualSeleccionado();
            if (!prod) {
                alert(
                    'Por favor, busque y seleccione un producto válido de la lista de sugerencias antes de añadir.',
                );
                return;
            }
            productosAAgregar = [prod];
        }

        // Mapeamos al formato requerido por la tabla dinámica
        const nuevosItems: SelectedProductListItem[] = productosAAgregar.map(
            (product) => {
                const precioSoles = product.precio_venta_soles || 0;
                const precioDolares = product.precio_venta_dolares || 0;
                const precioInicial =
                    moneda === 'SOLES' ? precioSoles : precioDolares;

                return {
                    id: Number(product.id),
                    codigo: product.referencia_interna || 'SIN-CODIGO',
                    nombre: product.nombre,
                    categoria: product.categoria.nombre,
                    marca: product.marca.nombre,
                    precioEditable: precioInicial,
                    descuentoEditable: descuento,
                    precioSolesBD: precioSoles,
                    precioDolaresBD: precioDolares,
                    tipoRegla: reglaOriginal,
                };
            },
        );

        // Mergeamos con lo que ya está en la tabla (sin duplicar)
        this.selectedProductsList.update((actuales) => {
            const mapaNuevos = new Map(
                nuevosItems.map((item) => [item.id, item]),
            );

            const actualizados = actuales.map((itemActual) => {
                if (mapaNuevos.has(itemActual.id)) {
                    const itemActualizado = mapaNuevos.get(itemActual.id)!;
                    mapaNuevos.delete(itemActual.id);
                    return itemActualizado;
                }
                return itemActual;
            });

            const puramenteNuevos = Array.from(mapaNuevos.values());
            return [...actualizados, ...puramenteNuevos];
        });

        // Si fue una adición exitosa individual, limpiamos el campo de texto para que busque el siguiente
        if (this.modoSeleccion() === 'INDIVIDUAL') {
            this.busquedaProducto.set('');
            this.productoIndividualSeleccionado.set(null);
        }
    }

    eliminarProductoDeLista(id: number) {
        // Tipado estricto a number
        this.selectedProductsList.update((actuales) =>
            actuales.filter((item) => item.id !== id),
        );
    }

    aplicarConfiguracion() {
        const nombre = this.nombreLista();
        const productos = this.selectedProductsList();

        if (!nombre.trim()) {
            alert('Por favor, asigne un nombre a la lista de precios.');
            return;
        }
        if (productos.length === 0) {
            alert('La tabla no contiene productos para registrar.');
            return;
        }

        // Activamos el estado de carga
        this.isSubmitting.set(true);

        const payload: Pricelist = {
            nombre: nombre,
            moneda: this.selectedMoneda() === 'SOLES' ? 'PEN' : 'USD',
            productos: productos.map((p) => ({
                id: p.id,
                codigo: p.codigo,
                nombre: p.nombre,
                marca: p.marca,
                categoria: p.nombre,
                precioEditable: p.precioEditable,
                descuentoEditable: p.descuentoEditable,
                tipoRegla: p.tipoRegla,
            })),
        };

        this.pricelistService
            .crearListaPrecios(payload)
            .pipe(
                // El operador finalize ejecuta este bloque siempre, sea éxito o error
                finalize(() => this.isSubmitting.set(false)),
            )
            .subscribe({
                next: (response) => {
                    console.log('Respuesta de FastAPI:', response);
                    alert(
                        `¡Éxito! Lista creada en Odoo con ID: ${response.id}`,
                    );
                    this.nombreLista.set('');
                    this.selectedProductsList.set([]);
                },
                error: (err: any) => {
                    console.error('Error al comunicarse con FastAPI:', err);
                    let mensajeError =
                        'No se pudo conectar con el servidor FastAPI.';

                    if (err.error && err.error.detail) {
                        mensajeError =
                            typeof err.error.detail === 'object'
                                ? JSON.stringify(err.error.detail, null, 2)
                                : err.error.detail;
                    } else if (err.message) {
                        mensajeError = err.message;
                    }
                    alert(`Error de Validación en Backend:\n${mensajeError}`);
                },
            });
    }
}
