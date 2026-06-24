import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdminClientes } from './create-admin-clientes';

describe('CreateAdminClientes', () => {
    let component: CreateAdminClientes;
    let fixture: ComponentFixture<CreateAdminClientes>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateAdminClientes],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateAdminClientes);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
