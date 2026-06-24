import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-navpage',
    standalone: true,
    imports: [RouterModule, MatIconModule], // 💡 Ya no necesitas CommonModule si usas @if
    templateUrl: './navpage.html',
    styleUrl: './navpage.css',
})
export class Navpage {
    private router = inject(Router);

    // 💡 Creamos un método limpio y seguro que no romperá el SSR
    isInCotizar(): boolean {
        return this.router?.url ? this.router.url.includes('/cotizar') : false;
    }
}
