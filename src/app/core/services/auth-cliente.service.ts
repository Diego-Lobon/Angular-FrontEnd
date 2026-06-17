import { Injectable, inject, PLATFORM_ID } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { isPlatformBrowser } from '@angular/common';

import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';

import { CartRedisService } from './cart-redis.service';

import { PricelistService } from './pricelist.service';

@Injectable({
    providedIn: 'root',
})
export class AuthClienteService {
    private platformId = inject(PLATFORM_ID);

    private http = inject(HttpClient);

    private cartService = inject(CartRedisService);

    private pricelistService = inject(PricelistService);

    private apiUrl = environment.api_nest;

    login(username: string, password: string) {
        return this.http.post<{
            access_token: string;
        }>(
            `${this.apiUrl}/authclientes/login`,

            {
                username,
                password,
            },
        );
    }

    saveSession(token: string): void {
        localStorage.setItem('token_cliente', token);

        const payload = jwtDecode<any>(token);

        const moneda = payload?.moneda?.toUpperCase() === 'USD' ? 'USD' : 'PEN';

        this.pricelistService.monedaActiva.set(moneda);

        this.cartService.switchCartContext();
    }

    getToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        return localStorage.getItem('token_cliente');
    }

    getIdPrecioLista(): number | null {
        const token = this.getToken();

        if (!token) {
            return null;
        }

        try {
            const payload = jwtDecode<any>(token);

            return payload?.id_precio_lista
                ? Number(payload.id_precio_lista)
                : null;
        } catch {
            return null;
        }
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    logout(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        localStorage.removeItem('token_cliente');

        // Solo restaurar si realmente ya no hay cliente
        if (!this.getToken()) {
            this.pricelistService.monedaActiva.set('PEN');

            this.cartService.switchCartContext();
        }
    }

    getNombre(): string | null {
        const token = this.getToken();

        if (!token) {
            return null;
        }

        try {
            const payload = jwtDecode<any>(token);
            console.log(payload)
            return payload.username || null;
        } catch {
            return null;
        }
    }
}
