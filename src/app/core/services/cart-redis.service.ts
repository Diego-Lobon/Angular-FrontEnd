import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CartItem {
    referencia_interna: string;
    productId: string;
    name: string;
    price_dolares: number;
    price_soles: number;
    moneda: 'USD' | 'PEN';
    cantidad: number;
    imageUrl?: string;
    marca?: {
        nombre: string;
    };
    categoria?: {
        nombre: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class CartRedisService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.api_nest}/cart`;

    private CART_STORAGE_KEY = 'anonymous_cart';
    private CART_ID_KEY = 'anonymous_cart_id';

    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor() {
        if (typeof window !== 'undefined') {
            queueMicrotask(() => {
                this.syncWithRedisOnLoad();
            });
        }
    }

    // 💡 NUEVO: Fuerza el cambio de contexto y recarga los datos correctos de Redis
    public switchCartContext(): void {
        console.log('[CartRedisService] Cambiando contexto de carrito...');
        this.syncWithRedisOnLoad();
    }

    private isLogged(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        return !!localStorage.getItem('token_cliente');
    }

    // 💡 MODIFICADO: Retorna un ID dinámico dependiendo de si el usuario está logueado o no
    private getOrCreateCartId(): string {
        if (typeof window === 'undefined') {
            return '';
        }

        const token = localStorage.getItem('token_cliente');

        if (token) {
            const idCliente = this.obtenerIdClienteDesdeJwt(token);

            if (idCliente) {
                this.CART_STORAGE_KEY = `client_cart_storage_${idCliente}`;

                return `client_cart_${idCliente}`;
            }
        }

        this.CART_STORAGE_KEY = 'anonymous_cart';

        let id = localStorage.getItem(this.CART_ID_KEY);

        if (!id) {
            if (
                typeof crypto !== 'undefined' &&
                typeof crypto.randomUUID === 'function'
            ) {
                id = crypto.randomUUID();
            } else {
                id = this.generateFallbackUUID();
            }

            localStorage.setItem(this.CART_ID_KEY, id);
        }

        return id;
    }

    // 💡 NUEVO: Extrae de forma segura el identificador único del JWT (sub o id)
    private obtenerIdClienteDesdeJwt(token: string): string | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.sub || payload.id || null;
        } catch (e) {
            return null;
        }
    }

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

    private saveAndSyncCart(cart: CartItem[]): void {
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));

        this.cartItemsSubject.next(cart);

        const cartId = this.getOrCreateCartId();

        const endpoint = this.isLogged()
            ? `${this.API_URL}/user/${cartId.replace('client_cart_', '')}`
            : `${this.API_URL}/anonymous/${cartId}`;

        this.http.post(endpoint, cart).subscribe();
    }

    private syncWithRedisOnLoad(): void {
        const cartId = this.getOrCreateCartId();

        const endpoint = this.isLogged()
            ? `${this.API_URL}/user/${cartId.replace('client_cart_', '')}`
            : `${this.API_URL}/anonymous/${cartId}`;

        this.http.get<CartItem[]>(endpoint).subscribe({
            next: (cart) => {
                localStorage.setItem(
                    this.CART_STORAGE_KEY,
                    JSON.stringify(cart),
                );

                this.cartItemsSubject.next(cart);
            },

            error: () => {
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
            existingItem.moneda = item.moneda;
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
                items.reduce((acc, item) => {
                    const precio =
                        item.moneda === 'USD'
                            ? item.price_dolares
                            : item.price_soles;
                    return acc + precio * item.cantidad;
                }, 0),
            ),
        );
    }

    getCartCount(): Observable<number> {
        return this.cartItems$.pipe(
            map((items) => items.reduce((acc, item) => acc + item.cantidad, 0)),
        );
    }
}
