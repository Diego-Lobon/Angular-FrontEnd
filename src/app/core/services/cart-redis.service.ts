import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
    referencia_interna: string;
    productId: string;
    name: string;
    price: number;
    cantidad: number;
    imageUrl?: string;
    marca?: string;
    categoria?: {
        nombre: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class CartRedisService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://192.168.18.38:3000/cart'; // Cambia al puerto de tu NestJS

    private CART_STORAGE_KEY = 'anonymous_cart';
    private CART_ID_KEY = 'anonymous_cart_id';

    private cartItemsSubject = new BehaviorSubject<CartItem[]>(
        this.getCartFromLocalStorage(),
    );
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor() {
        this.syncWithRedisOnLoad();
    }

    // Obtiene o genera un ID único para la máquina del usuario anónimo
    private getOrCreateCartId(): string {
        // 1. Validamos que estemos del lado del cliente (navegador) para no romper el SSR
        if (typeof window === 'undefined') {
            return '';
        }

        let id = localStorage.getItem(this.CART_ID_KEY);

        if (!id) {
            // 2. Intentamos usar el método nativo si está disponible
            if (
                typeof crypto !== 'undefined' &&
                typeof crypto.randomUUID === 'function'
            ) {
                id = crypto.randomUUID();
            } else {
                // 3. Solución alternativa (Fallback) si el navegador bloquea la API por HTTP
                id = this.generateFallbackUUID();
            }
            localStorage.setItem(this.CART_ID_KEY, id);
        }
        return id;
    }

    // Método auxiliar matemático para construir un UUID v4 estándar
    private generateFallbackUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private getCartFromLocalStorage(): CartItem[] {
        if (typeof window !== 'undefined') {
            const cart = localStorage.getItem(this.CART_STORAGE_KEY);
            return cart ? JSON.parse(cart) : [];
        }
        return [];
    }

    // Guarda localmente y dispara la sincronización hacia NestJS + Redis
    private saveAndSyncCart(cart: CartItem[]): void {
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
        this.cartItemsSubject.next(cart);

        // Envía el carrito a NestJS para guardarlo en Redis
        const cartId = this.getOrCreateCartId();
        this.http.post(`${this.API_URL}/${cartId}`, cart).subscribe({
            error: (err) =>
                console.error('Error sincronizando con Redis:', err),
        });
    }

    // Al cargar la app, intenta recuperar el carrito que estaba en Redis
    // Al cargar la app, intenta recuperar el carrito que estaba en Redis
    private syncWithRedisOnLoad(): void {
        const cartId = this.getOrCreateCartId();

        if (!cartId) {
            // Fallback inmediato si no hay entorno de navegador listo
            this.cartItemsSubject.next(this.getCartFromLocalStorage());
            return;
        }

        this.http.get<CartItem[]>(`${this.API_URL}/${cartId}`).subscribe({
            next: (redisCart) => {
                // Si Redis tiene productos guardados de una sesión previa, los usamos
                if (redisCart && redisCart.length > 0) {
                    localStorage.setItem(
                        this.CART_STORAGE_KEY,
                        JSON.stringify(redisCart),
                    );
                    this.cartItemsSubject.next(redisCart);
                } else {
                    // 💡 SOLUCIÓN: Si Redis regresó vacío pero el usuario SÍ tenía productos agregados
                    // localmente en esta sesión actual, forzamos la emisión de los datos locales.
                    const localCart = this.getCartFromLocalStorage();
                    this.cartItemsSubject.next(localCart);

                    // Opcional: Si el local tiene cosas, lo subimos a Redis de una vez para sincronizar
                    if (localCart.length > 0) {
                        this.http
                            .post(`${this.API_URL}/${cartId}`, localCart)
                            .subscribe();
                    }
                }
            },
            error: (err) => {
                console.warn(
                    'No se pudo conectar a Redis, usando LocalStorage local.',
                    err,
                );
                // Si el backend da error (ej. NestJS apagado), mantenemos vivos los datos de LocalStorage
                this.cartItemsSubject.next(this.getCartFromLocalStorage());
            },
        });
    }

    addToCart(item: CartItem): void {
        const currentCart = [...this.cartItemsSubject.getValue()];
        const existingItem = currentCart.find(
            (i) => i.productId === item.productId,
        );

        if (existingItem) {
            existingItem.cantidad += item.cantidad;
        } else {
            currentCart.push(item);
        }
        this.saveAndSyncCart(currentCart);
    }

    updateItemQuantity(productId: string, quantity: number): void {
        let currentCart = [...this.cartItemsSubject.getValue()];
        if (quantity <= 0) {
            currentCart = currentCart.filter((i) => i.productId !== productId);
        } else {
            const item = currentCart.find((i) => i.productId === productId);
            if (item) item.cantidad = quantity;
        }
        this.saveAndSyncCart(currentCart);
    }

    removeItem(productId: string): void {
        const updatedCart = this.cartItemsSubject
            .getValue()
            .filter((i) => i.productId !== productId);
        this.saveAndSyncCart(updatedCart);
    }

    clearCart(): void {
        this.saveAndSyncCart([]);
    }

    getCartTotal(): Observable<number> {
        return this.cartItems$.pipe(
            map((items) =>
                items.reduce(
                    (acc, item) => acc + item.price * item.cantidad,
                    0,
                ),
            ),
        );
    }
}
