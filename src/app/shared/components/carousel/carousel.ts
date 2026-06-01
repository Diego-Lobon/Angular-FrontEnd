import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css',
})
export class Carousel implements OnInit, OnDestroy {
    // Inyectamos el detector de cambios de Angular
    private cdr = inject(ChangeDetectorRef);

    images: string[] = [
        'assets/logos/banner-1.jpg',
        'assets/logos/banner-2.jpg',
        'assets/logos/banner-3.jpg',
    ];

    currentIndex: number = 0;
    private intervalId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        this.startAutoPlay();
    }

    ngOnDestroy(): void {
        this.stopAutoPlay();
    }

    startAutoPlay(): void {
        this.stopAutoPlay();

        this.intervalId = setInterval(() => {
            this.nextSlide();
            // Forzamos a Angular a renderizar el nuevo currentIndex
            this.cdr.detectChanges();
        }, 4000);
    }

    stopAutoPlay(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    prevSlide(): void {
        this.currentIndex =
            this.currentIndex === 0
                ? this.images.length - 1
                : this.currentIndex - 1;

        this.cdr.detectChanges(); // Forzar actualización visual
        this.resetAutoPlay(); // Reiniciar el contador de 4 segundos
    }

    nextSlide(): void {
        this.currentIndex =
            this.currentIndex === this.images.length - 1
                ? 0
                : this.currentIndex + 1;

        this.cdr.detectChanges(); // Forzar actualización visual
        this.resetAutoPlay(); // Reiniciar el contador de 4 segundos
    }

    goToSlide(index: number): void {
        this.currentIndex = index;

        this.cdr.detectChanges(); // Forzar actualización visual
        this.resetAutoPlay(); // Reiniciar el contador de 4 segundos
    }

    // Nueva función auxiliar para reiniciar el tiempo limpiamente
    private resetAutoPlay(): void {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}
