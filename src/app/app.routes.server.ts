import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    // Esto le dice a Angular: "No intentes pre-renderizar en el build nada que empiece con home-list-price"
    {
        path: 'home-list-price/**',
        renderMode: RenderMode.Server,
    },
    // El resto de las rutas pueden seguir usando el comportamiento por defecto (Prerender)
    {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];
