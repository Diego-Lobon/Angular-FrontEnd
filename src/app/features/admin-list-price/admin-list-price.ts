import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-list-price',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './admin-list-price.html',
    styleUrl: './admin-list-price.css',
})
export class AdminListPrice {
    // Variable que controla qué sección de cliente se muestra ('tipo' o 'especifico')
    tipoSeleccion: string = '';

    aplicarConfiguracion() {
        // Aquí procesas los datos capturados
        console.log('Selección actual:', this.tipoSeleccion);
        alert('Configuración aplicada con éxito');
    }
}
