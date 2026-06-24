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

    getUsuarios() {
        return this.http.get<any[]>(`${this.apiUrl}/auth/users`);
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

    getUserData(): { username: string; tipo_usuario: string; correo?: string } | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            // El JWT tiene 3 partes separadas por puntos: Header.Payload.Signature
            const payloadBase64 = token.split('.')[1];
            // Decodificamos el string Base64 a texto y lo convertimos a un objeto JS
            const decodedJson = atob(payloadBase64);
            return JSON.parse(decodedJson);
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    }
}
