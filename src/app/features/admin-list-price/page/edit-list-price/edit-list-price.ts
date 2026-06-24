import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

import { CategoriesService } from '../../../../core/services/categories.service';
import { MarcasService } from '../../../../core/services/marcas.service';
import { ProductsService } from '../../../../core/services/products.service';
import {
    PricelistService,
    Pricelist,
} from '../../../../core/services/pricelist.service';
import { Product } from '../../../../core/interfaces/product.interface';

type ReglaTipo = 'DESCUENTO' | 'PRECIO_FIJO';

// Tipamos las propiedades adicionales que vienen de Odoo de forma segura
type OdooProduct = Product & {
    precio_venta_soles?: number;
    precio_venta_dolares?: number;
    referencia_interna?: string;
};

interface SelectedProductListItem {
    id: number; // Forzado a number estricto para encajar con PricelistProduct
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
    selector: 'app-edit-list-price',
    imports: [FormsModule, MatIconModule, HttpClientModule, RouterLink],
    templateUrl: './edit-list-price.html',
    styleUrl: './edit-list-price.css',
})
export class EditListPrice implements OnInit {
    private categoriesService = inject(CategoriesService);
    private marcasService = inject(MarcasService);
    private productsService = inject(ProductsService);
    private platformId = inject(PLATFORM_ID);
    private pricelistService = inject(PricelistService);
    private route = inject(ActivatedRoute);

    listaId = 0;

    readonly categories = signal<any[]>([]);
    readonly marcas = signal<any[]>([]);
    readonly allProducts = signal<OdooProduct[]>([]); // Usando el tipo extendido seguro

    nombreLista = signal('');
    selectedMarcaId = signal('');
    selectedCategoriaId = signal('');
    selectedMoneda = signal('SOLES');
    descuentoBase = signal(0);
    loadingProducts = signal(true);
    updatingLista = signal(false);
    tipoReglaMaestro = signal<ReglaTipo>('DESCUENTO');

    selectedProductsList = signal<SelectedProductListItem[]>([]);

    // --- NUEVOS SIGNALS AGREGADOS PARA BUSQUEDA INDIVIDUAL (IGUAL QUE EN CREATE) ---
    modoSeleccion = signal<'FILTROS' | 'INDIVIDUAL'>('FILTROS');
    busquedaProducto = signal<string>('');
    sugerenciasProductos = signal<OdooProduct[]>([]);
    productoIndividualSeleccionado = signal<OdooProduct | null>(null);

    ngOnInit() {
        this.listaId = Number(this.route.snapshot.paramMap.get('id'));

        if (isPlatformBrowser(this.platformId)) {
            this.categoriesService
                .getCategories()
                .subscribe((v) => this.categories.set(v));

            this.marcasService.getMarcas().subscribe((v) => this.marcas.set(v));

            this.productsService.getProducts().subscribe((v) => {
                this.allProducts.set(v);
                this.cargarLista();
            });
        }
    }

    cargarLista() {
        this.loadingProducts.set(true);

        this.pricelistService.obtenerListaPorId(this.listaId).subscribe({
            next: (data) => {
                this.nombreLista.set(data.nombre);
                console.log(data);

                if (data.moneda) {
                    this.selectedMoneda.set(
                        ['DOLARES', 'USD'].includes(
                            String(data.moneda).toUpperCase(),
                        )
                            ? 'DOLARES'
                            : 'SOLES',
                    );
                }

                const productosBD = this.allProducts();

                this.selectedProductsList.set(
                    data.productos.map((p: any) => {
                        const productoReal = productosBD.find(
                            (x) =>
                                String(x.referencia_interna).trim() ===
                                    String(p.codigo).trim() ||
                                Number(x.id) === Number(p.id),
                        );

                        return {
                            id: Number(p.id),
                            codigo: p.codigo,
                            nombre:
                                productoReal?.nombre ??
                                p.nombre ??
                                'Producto no encontrado',
                            categoria:
                                productoReal?.categoria?.nombre ??
                                p.categoria ??
                                'Sin Categoría',
                            marca:
                                productoReal?.marca?.nombre ??
                                p.marca ??
                                'Sin Marca',
                            precioEditable: Number(p.precioEditable),
                            descuentoEditable: Number(p.descuentoEditable),
                            precioSolesBD:
                                productoReal?.precio_venta_soles ??
                                Number(p.precioEditable),
                            precioDolaresBD:
                                productoReal?.precio_venta_dolares ??
                                Number(p.precioEditable),
                            tipoRegla:
                                (p.tipoRegla as ReglaTipo) || 'DESCUENTO',
                        };
                    }),
                );

                this.loadingProducts.set(false);
            },
            error: (err: any) => {
                console.error(err);
                this.loadingProducts.set(false);
            },
        });
    }

    // --- NUEVOS MÉTODOS DE CONTROL PARA LA BÚSQUEDA Y MODO ---
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

        this.sugerenciasProductos.set(filtrados.slice(0, 8));
    }

    seleccionarSugerencia(producto: OdooProduct) {
        this.busquedaProducto.set(producto.nombre);
        this.productoIndividualSeleccionado.set(producto);
        this.sugerenciasProductos.set([]);
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

    // --- MÉTODO ACTUALIZADO ADAPTANDO AMBOS MODOS DE AGREGACIÓN ---
    agregarProductosFiltrados() {
        const reglaGlobal = this.tipoReglaMaestro();
        const descuentoGlobal = Number(this.descuentoBase()) || 0;
        const moneda = this.selectedMoneda();

        let filtrados: OdooProduct[] = [];

        // CASO 1: MODO FILTROS POR MARCA/CATEGORIA
        if (this.modoSeleccion() === 'FILTROS') {
            filtrados = this.allProducts().filter((p) => {
                const coincideMarca =
                    !this.selectedMarcaId() ||
                    String(p.marca?.id) === this.selectedMarcaId();

                const coincideCategoria =
                    !this.selectedCategoriaId() ||
                    String(p.categoria?.id) === this.selectedCategoriaId();

                return coincideMarca && coincideCategoria;
            });

            if (filtrados.length === 0) {
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
            filtrados = [prod];
        }

        // Mergeamos con la lógica de actualización/inserción
        this.selectedProductsList.update((actuales) => {
            const copia = [...actuales];

            filtrados.forEach((producto) => {
                const precioBase =
                    moneda === 'SOLES'
                        ? producto.precio_venta_soles || 0
                        : producto.precio_venta_dolares || 0;

                // Buscar si ya existe por ID
                const existente = copia.find(
                    (x) => Number(x.id) === Number(producto.id),
                );

                if (existente) {
                    existente.precioSolesBD = producto.precio_venta_soles || 0;
                    existente.precioDolaresBD =
                        producto.precio_venta_dolares || 0;
                    existente.tipoRegla = reglaGlobal;

                    if (reglaGlobal === 'DESCUENTO') {
                        existente.descuentoEditable = descuentoGlobal;
                    }

                    if (reglaGlobal === 'PRECIO_FIJO') {
                        existente.descuentoEditable = 0;
                        if (
                            existente.precioEditable === 0 ||
                            existente.precioEditable === null
                        ) {
                            existente.precioEditable = precioBase;
                        }
                    }
                } else {
                    // Insertar nuevo registro mapeando correctamente marca y categoría de la BD
                    copia.push({
                        id: Number(producto.id),
                        codigo: producto.referencia_interna || 'SIN-CODIGO',
                        nombre: producto.nombre,
                        categoria:
                            producto.categoria?.nombre || 'Sin Categoría',
                        marca: producto.marca?.nombre || 'Sin Marca',
                        precioEditable: precioBase,
                        descuentoEditable:
                            reglaGlobal === 'DESCUENTO' ? descuentoGlobal : 0,
                        precioSolesBD: producto.precio_venta_soles || 0,
                        precioDolaresBD: producto.precio_venta_dolares || 0,
                        tipoRegla: reglaGlobal,
                    });
                }
            });

            return copia;
        });

        // Limpieza de campos si se usó el modo individual
        if (this.modoSeleccion() === 'INDIVIDUAL') {
            this.busquedaProducto.set('');
            this.productoIndividualSeleccionado.set(null);
        }
    }

    eliminarProductoDeLista(id: number) {
        this.selectedProductsList.update((v) => v.filter((x) => x.id !== id));
    }

    aplicarConfiguracion() {
        if (this.updatingLista()) return;

        // Activar el estado de carga
        this.updatingLista.set(true);
        const payload: Pricelist = {
            nombre: this.nombreLista(),
            moneda: this.selectedMoneda() === 'SOLES' ? 'PEN' : 'USD',
            productos: this.selectedProductsList().map((p) => ({
                id: Number(p.id),
                codigo: p.codigo,
                nombre: p.nombre,
                marca: p.marca,
                categoria: p.categoria,
                precioEditable: p.precioEditable,
                descuentoEditable: p.descuentoEditable,
                tipoRegla: p.tipoRegla,
            })),
        };

        this.pricelistService.actualizarLista(this.listaId, payload).subscribe({
            next: () => {
                this.updatingLista.set(false);
                alert('Lista actualizada correctamente');
            },
            error: (err: any) => {
                console.error(err);
                this.updatingLista.set(false);
                alert('Ocurrió un error al actualizar la lista de precios.');
            },
        });
    }
}
