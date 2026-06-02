import { inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const platformId = inject(PLATFORM_ID);

    const router = inject(Router);

    // * SI NO ES NAVEGADOR

    if (!isPlatformBrowser(platformId)) {
        return false;
    }

    // * Obtener token
    const token = localStorage.getItem('token');

    // * Verifica la existencia del token
    if (token) {
        return true;
    }

    // * Si no existe el token, nos llevara al login
    router.navigate(['/login']);

    return false;
};
