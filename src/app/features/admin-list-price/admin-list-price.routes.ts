// features/admin-products/admin-products.routes.ts

import { Routes } from '@angular/router';

import { HomeListPrice } from './page/home-list-price/home-list-price';
import { CreateListPrice } from './page/create-list-price/create-list-price';
import { EditListPrice } from './page/edit-list-price/edit-list-price';

export const ADMIN_PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        component: HomeListPrice,
    },
    {
        path: 'create',
        component: CreateListPrice,
    },
    {
        path: 'edit/:id',
        component: EditListPrice,
    },
];
