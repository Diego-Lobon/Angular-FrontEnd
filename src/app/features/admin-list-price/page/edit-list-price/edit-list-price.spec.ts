import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditListPrice } from './edit-list-price';

describe('EditListPrice', () => {
    let component: EditListPrice;
    let fixture: ComponentFixture<EditListPrice>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditListPrice],
        }).compileComponents();

        fixture = TestBed.createComponent(EditListPrice);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
