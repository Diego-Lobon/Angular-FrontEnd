// * Injectable: permite que Angular use esta clase como servicio.
// * inject(): permite obtener dependencias sin usar constructor.
// * PLATFORM_ID: indica dónde se está ejecutando Angular.
import { Injectable, inject, PLATFORM_ID } from '@angular/core';

// * Permite realizar peticiones HTTP
import { HttpClient } from '@angular/common/http';

// * Verifica si estamos en un navegador
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';

// * Crea una única instancia de AuthService para toda la aplicación
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    // * Obtiene información del entorno actual
    private platformId = inject(PLATFORM_ID);
    // * URL del backend
    private apiUrl = environment.api_nest;
    private readonly TOKEN_KEY = 'admin_token';

    // * Angular inyecta automáticamente HttpClient
    constructor(private http: HttpClient) {}

    login(username: string, password: string) {
        // * <{ acces... }> La respuesta tendrá una propiedad access_token de tipo string
        // * { username, ... } Eniva los datos al backend
        return this.http.post<{ access_token: string }>(
            `${this.apiUrl}/auth/login`,
            {
                username,
                password,
            },
        );
    }

    // * Este método guarda el token
    saveToken(token: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    // * Obtiene el token guardado
    getToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        return localStorage.getItem(this.TOKEN_KEY);
    }

    // * Verifica si el token existe
    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    // * Cerrar sesion y elimina el token
    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }
}
