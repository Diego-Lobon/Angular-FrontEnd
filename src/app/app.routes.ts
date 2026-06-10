import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Cart } from './features/cart/cart';
import { Login } from './features/login/login';
import { authGuard } from './core/guards/auth-guard';
import { Products } from './features/products/products';
import { ValidCotizacion } from './features/valid-cotizacion/valid-cotizacion';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { AdminListPrice } from './features/admin-list-price/admin-list-price';
import { AdminUsers } from './features/admin-users/admin-users';
import { AdminCustomers } from './features/admin-customers/admin-customers';
import { AdminProducts } from './features/admin-products/admin-products';

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
        canActivate: [authGuard],
    },

    {
        path: 'admin-dashboard',
        component: AdminDashboard,
        /*canActivate: [authGuard],*/
    },

    {
        path: 'admin-list-price',
        component: AdminListPrice,
        /*canActivate: [authGuard],*/
    },

    {
        path: 'admin-users',
        component: AdminUsers,
        /*canActivate: [authGuard],*/
    },

    {
        path: 'admin-customers',
        component: AdminCustomers,
        /*canActivate: [authGuard],*/
    },

    {
        path: 'admin-products',
        component: AdminProducts,
        /*canActivate: [authGuard],*/
    },
];
