import { inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const platformId = inject(PLATFORM_ID);

    const router = inject(Router);

    // SI NO ES NAVEGADOR

    if (!isPlatformBrowser(platformId)) {
        return false;
    }

    // TOKEN

    const token = localStorage.getItem('token');

    if (token) {
        return true;
    }

    router.navigate(['/login']);

    return false;
};
