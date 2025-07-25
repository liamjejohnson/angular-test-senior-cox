import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService } from '../../services/vehicle';
import { Vehicle } from '../../models';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let mockVehicleService: jasmine.SpyObj<VehicleService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockVehicles: Vehicle[] = [
    {
      id: 'veh001',
      make: 'Toyota',
      model: 'Camry',
      year: 2021,
      price: 25000,
      mileage: 15000,
      colour: 'White'
    },
    {
      id: 'veh002',
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      price: 20000,
      mileage: 22000,
      colour: 'Blue'
    }
  ];

  beforeEach(async () => {
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', ['getVehicles']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [VehicleListComponent, NoopAnimationsModule],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    mockVehicleService = TestBed.inject(VehicleService) as jasmine.SpyObj<VehicleService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Given VehicleListComponent is initialized', () => {
    describe('When component loads successfully', () => {
      beforeEach(() => {
        mockVehicleService.getVehicles.and.returnValue(of(mockVehicles));
      });

      it('Then should create component', () => {
        expect(component).toBeTruthy();
      });

      it('Then should load vehicles on init', () => {
        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(mockVehicleService.getVehicles).toHaveBeenCalled();
        expect(component['vehicles']()).toEqual(mockVehicles);
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBeNull();
      });

      it('Then should filter vehicles based on search term', () => {
        // Arrange
        component.ngOnInit();
        fixture.detectChanges();

        // Act
        component['searchTerm'].set('Toyota');

        // Assert
        const filtered = component['filteredVehicles']();
        expect(filtered.length).toBe(1);
        expect(filtered[0].make).toBe('Toyota');
      });
    });

    describe('When service call fails', () => {
      it('Then should handle error gracefully', () => {
        // Arrange
        mockVehicleService.getVehicles.and.returnValue(throwError(() => new Error('API Error')));

        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBe('Failed to load vehicles. Please try again.');
      });
    });

    describe('When user interactions occur', () => {
      beforeEach(() => {
        mockVehicleService.getVehicles.and.returnValue(of(mockVehicles));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('Then should navigate to vehicle details when requested', () => {
        // Act
        component['viewVehicleDetails']('veh001');

        // Assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vehicle', 'veh001']);
      });

      it('Then should update sort field and direction', () => {
        // Act
        component['onSortChange']('price');

        // Assert
        expect(component['sortField']()).toBe('price');
        expect(component['sortDirection']()).toBe('asc');

        // Act again to toggle direction
        component['onSortChange']('price');

        // Assert
        expect(component['sortDirection']()).toBe('desc');
      });
    });
  });
}); 