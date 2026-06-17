import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListPrice } from './create-list-price';

describe('CreateListPrice', () => {
    let component: CreateListPrice;
    let fixture: ComponentFixture<CreateListPrice>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateListPrice],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateListPrice);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
