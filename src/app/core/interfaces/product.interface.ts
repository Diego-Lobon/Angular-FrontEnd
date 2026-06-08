export interface Product {
    id: number;
    id_migracion: string;
    referencia_interna: string;
    nombre: string;
    costo: number;
    marca: string;
    precio_venta: number;
    unidad_medida: string;
    imagen_url: string;

    categoria: {
        id: number;
        nombre: string;
    };
}
