import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    cartProducts = signal<any[]>([]);

    addProduct(product: any) {
        const exists = this.cartProducts().find((p) => p.id === product.id);

        if (exists) {
            exists.cant += 1;

            this.cartProducts.set([...this.cartProducts()]);

            return;
        }

        this.cartProducts.update((products) => [
            ...products,
            {
                ...product,
                cant: 1,
            },
        ]);
    }

    removeProduct(id: number) {
        this.cartProducts.update((products) =>
            products.filter((product) => product.id !== id),
        );
    }

    toggleProduct(product: any) {
        const exists = this.cartProducts().some((p) => p.id === product.id);

        if (exists) {
            this.removeProduct(product.id);
        } else {
            this.addProduct(product);
        }
    }

    isInCart(id: number): boolean {
        return this.cartProducts().some((p) => p.id === id);
    }
}
