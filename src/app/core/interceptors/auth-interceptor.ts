// * Importamos el tipo HttpInterceptorFn.
// * Un interceptor permite interceptar (capturar)
// * todas las peticiones HTTP antes de que salgan
// * hacia el servidor.
import { HttpInterceptorFn } from '@angular/common/http';

// * Creamos el interceptor.
// * Angular ejecutará este código automáticamente
// * cada vez que hagamos una peticion post, get ...
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // * Obtener token
    const token = localStorage.getItem('token');

    if (token) {
        // * req es una petición HTTP.
        // * Las peticiones son inmutables (no pueden modificarse directamente).
        // * Por eso usamos clone() para crear una copia modificada.
        req = req.clone({
            // * Agregamos un header HTTP
            setHeaders: {
                // * Header estándar para JWT.
                // * Authorization:
                // * Bearer eyJhbG...
                Authorization: `Bearer ${token}`,
            },
        });
    }
    // * Envía la petición al siguiente paso.
    // * Si agregamos el token, la petición sale con el token.
    // * Si no hay token, sale normalemente
    return next(req);
};
