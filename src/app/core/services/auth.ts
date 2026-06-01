import { Injectable, inject, PLATFORM_ID } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private platformId = inject(PLATFORM_ID);

    private apiUrl = 'http://192.168.18.36:3000';

    constructor(private http: HttpClient) {}

    login(username: string, password: string) {
        return this.http.post<{ access_token: string }>(
            `${this.apiUrl}/auth/login`,
            {
                username,
                password,
            },
        );
    }

    saveToken(token: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
        }
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }

        return null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
        }
    }
}
