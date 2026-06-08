import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navpage } from './navpage';

describe('Navpage', () => {
    let component: Navpage;
    let fixture: ComponentFixture<Navpage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Navpage],
        }).compileComponents();

        fixture = TestBed.createComponent(Navpage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
