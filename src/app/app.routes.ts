import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Cart } from './features/cart/cart';
import { Login } from './features/login/login';
import { LoginCliente } from './features/login-cliente/login-cliente';
import { authAdminGuard } from './core/guards/auth-guard';
import { Products } from './features/products/products';
import { ValidCotizacion } from './features/valid-cotizacion/valid-cotizacion';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { AdminUsers } from './features/admin-users/admin-users';
import { AdminCustomers } from './features/admin-clientes/admin-clientes';
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
        path: 'login-admin',
        component: Login,
    },

    {
        path: 'login',
        component: LoginCliente,
    },

    {
        path: 'valid-cotizacion',
        component: ValidCotizacion,
        canActivate: [authAdminGuard],
    },

    {
        path: 'admin-dashboard',
        component: AdminDashboard,
        canActivate: [authAdminGuard],
    },

    {
        path: 'home-list-price',
        loadChildren: () =>
            import('./features/admin-list-price/admin-list-price.routes').then(
                (m) => m.ADMIN_PRODUCTS_ROUTES,
            ),
        canActivate: [authAdminGuard],
    },

    {
        path: 'admin-users',
        component: AdminUsers,
        canActivate: [authAdminGuard],
    },

    {
        path: 'admin-customers',
        component: AdminCustomers,
        canActivate: [authAdminGuard],
    },

    {
        path: 'admin-products',
        component: AdminProducts,
        canActivate: [authAdminGuard],
    },
];
