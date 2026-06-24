
import { Routes } from '@angular/router';

import { HomeClientes } from './page/home-admin-clientes/home-clientes';
import { CreateAdminClientes } from './page/create-admin-clientes/create-admin-clientes';
import { EditAdminClientes } from './page/edit-admin-clientes/edit-admin-clientes';

export const ADMIN_CLIENTES_ROUTES: Routes = [
    {
        path: '',
        component: HomeClientes,
    },
    {
        path: 'create',
        component: CreateAdminClientes,
    },
    {
        path: 'edit/:id',
        component: EditAdminClientes,
    },
];