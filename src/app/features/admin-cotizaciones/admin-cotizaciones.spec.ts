import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCotizaciones } from './admin-cotizaciones';

describe('AdminCotizaciones', () => {
    let component: AdminCotizaciones;
    let fixture: ComponentFixture<AdminCotizaciones>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminCotizaciones],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminCotizaciones);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
