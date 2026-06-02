import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Cart } from './features/cart/cart';
import { Login } from './features/login/login';
import { authGuard } from './core/guards/auth-guard';
import { Products } from './features/products/products';
import { ValidCotizacion } from './features/valid-cotizacion/valid-cotizacion';
//import { CartComponent } from './features/cart/cart';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },

    {
        path: 'productos',
        component: Products,
    },

    {
        path: 'cotizar',
        component: Cart,
    },

    {
        path: 'login',
        component: Login,
    },

    {
        path: 'valid-cotizacion',
        component: ValidCotizacion,
    },

    {
        path: 'cart',
        component: Cart,
        canActivate: [authGuard],
    },
];
