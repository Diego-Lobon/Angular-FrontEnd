import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authAdminGuard: CanActivateFn = () => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);

    // 1. Si no es el navegador (es decir, es el Servidor/SSR), permitimos el paso temporal.
    // Esto evita que el servidor rompa la petición y tire el "Cannot GET".
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    // 2. Ya en el navegador, hacemos la validación real con el localStorage
    const adminToken = localStorage.getItem('admin_token');

    // Solo administrador
    if (adminToken) {
        return true;
    }

    // Bloquear cliente e invitados si no hay token
    router.navigate(['/']);
    return false;
};
