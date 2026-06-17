import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ProductCart } from './components/product-cart/product-cart';
import { MatIconModule } from '@angular/material/icon';
import { QuotationService } from '../../core/services/quotation.service';
import { PricelistService } from '../../core/services/pricelist.service';
import {
    CartRedisService,
    CartItem,
} from '../../core/services/cart-redis.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Navpage } from '../../shared/components/navpage/navpage';
import { AuthClienteService } from '../../core/services/auth-cliente.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [MatIconModule, ProductCart, CommonModule, Navpage],
    templateUrl: './cart.html',
    styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
    private authClienteService = inject(AuthClienteService);
    public cartRedisService = inject(CartRedisService);
    private quotationService = inject(QuotationService);
    private pricelistService = inject(PricelistService);

    currentProducts: CartItem[] = [];
    private cartSub!: Subscription;

    // 💡 LEEMOS DIRECTAMENTE EL SIGNAL GLOBAL: Cero peticiones HTTP redundantes aquí
    monedaLista = this.pricelistService.monedaActiva;
    isCurrencyLoaded = signal<boolean>(true); // Seteado directamente en true

    ngOnInit() {
        this.cartSub = this.cartRedisService.cartItems$.subscribe((items) => {
            this.currentProducts = items;
        });
    }

    ngOnDestroy() {
        if (this.cartSub) this.cartSub.unsubscribe();
    }

    generateQuotation() {
        if (this.currentProducts.length === 0) return;

        this.quotationService.generatePdf(
            this.currentProducts,
            this.authClienteService.getNombre(),
            this.authClienteService.getIdPrecioLista(),
        );
    }

    downloadQuotation() {
        if (this.currentProducts.length === 0) return;

        this.quotationService.generatePdfValid(
            this.currentProducts,
            this.authClienteService.getNombre(),
            this.authClienteService.getIdPrecioLista(),
        );
    }
}
