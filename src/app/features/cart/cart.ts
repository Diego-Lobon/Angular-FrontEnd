import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ProductCart } from './components/product-cart/product-cart';
import { MatIconModule } from '@angular/material/icon';
import { QuotationService } from '../../core/services/quotation.service';
import {
    CartRedisService,
    CartItem,
} from '../../core/services/cart-redis.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Navpage } from '../../shared/components/navpage/navpage';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [MatIconModule, ProductCart, CommonModule, Navpage],
    templateUrl: './cart.html',
    styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
    public cartRedisService = inject(CartRedisService);
    private quotationService = inject(QuotationService);

    currentProducts: CartItem[] = [];
    private cartSub!: Subscription;

    ngOnInit() {
        this.cartSub = this.cartRedisService.cartItems$.subscribe((items) => {
            this.currentProducts = items;
        });
    }

    ngOnDestroy() {
        if (this.cartSub) this.cartSub.unsubscribe();
    }

    // 💡 Ejecuta generatePdf el cual abrirá la pestaña para visualizar
    generateQuotation() {
        if (this.currentProducts.length === 0) return;
        this.quotationService.generatePdf(this.currentProducts);
    }

    // 💡 Ejecuta generatePdfValid el cual forzará la descarga del archivo
    downloadQuotation() {
        if (this.currentProducts.length === 0) return;
        this.quotationService.generatePdfValid(this.currentProducts);
    }
}
