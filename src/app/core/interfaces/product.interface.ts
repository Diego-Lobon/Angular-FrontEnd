export interface Product {
    id: number;
    id_migracion: string;
    referencia_interna: string;
    nombre: string;
    costo: number;
    precio_venta_dolares: number;
    precio_venta_soles: number;
    unidad_medida: string;
    imagen_url: string;
    categoria: {
        id: number;
        nombre: string;
    };
    marca: {
        id: number;
        nombre: string;
    };
}
