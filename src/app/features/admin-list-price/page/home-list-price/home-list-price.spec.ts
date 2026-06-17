import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeListPrice } from './home-list-price';

describe('HomeListPrice', () => {
    let component: HomeListPrice;
    let fixture: ComponentFixture<HomeListPrice>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeListPrice],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeListPrice);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
