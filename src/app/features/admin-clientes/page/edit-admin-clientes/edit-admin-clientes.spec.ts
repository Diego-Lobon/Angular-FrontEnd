import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdminClientes } from './edit-admin-clientes';

describe('EditAdminClientes', () => {
    let component: EditAdminClientes;
    let fixture: ComponentFixture<EditAdminClientes>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditAdminClientes],
        }).compileComponents();

        fixture = TestBed.createComponent(EditAdminClientes);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
