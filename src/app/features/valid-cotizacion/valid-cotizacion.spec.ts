import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidCotizacion } from './valid-cotizacion';

describe('ValidCotizacion', () => {
    let component: ValidCotizacion;
    let fixture: ComponentFixture<ValidCotizacion>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ValidCotizacion],
        }).compileComponents();

        fixture = TestBed.createComponent(ValidCotizacion);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
