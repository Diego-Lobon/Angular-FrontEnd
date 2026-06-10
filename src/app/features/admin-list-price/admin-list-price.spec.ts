import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListPrice } from './admin-list-price';

describe('AdminListPrice', () => {
    let component: AdminListPrice;
    let fixture: ComponentFixture<AdminListPrice>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminListPrice],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminListPrice);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
