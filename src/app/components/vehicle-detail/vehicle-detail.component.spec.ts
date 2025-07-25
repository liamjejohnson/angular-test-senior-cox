import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { VehicleDetailComponent } from './vehicle-detail.component';
import { VehicleService } from '../../services/vehicle';
import { FinanceCalculatorService } from '../../services/finance-calculator';
import { Vehicle, FinanceQuote } from '../../models';
import { FinanceTerms } from '../finance-calculator/finance-calculator.component';

describe('VehicleDetailComponent', () => {
  let component: VehicleDetailComponent;
  let fixture: ComponentFixture<VehicleDetailComponent>;
  let mockVehicleService: jasmine.SpyObj<VehicleService>;
  let mockFinanceService: jasmine.SpyObj<FinanceCalculatorService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockVehicle: Vehicle = {
    id: 'veh001',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    price: 25000,
    mileage: 15000,
    colour: 'White'
  };

  const mockFinanceQuote: FinanceQuote = {
    onTheRoadPrice: 25000,
    totalDeposit: 2500,
    totalAmountOfCredit: 22500,
    numberOfMonthlyPayments: 60,
    monthlyPayment: 425.32
  };

  beforeEach(async () => {
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', ['getVehicleById']);
    const financeServiceSpy = jasmine.createSpyObj('FinanceCalculatorService', ['calculateFinance']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ id: 'veh001' })
    };

    await TestBed.configureTestingModule({
      imports: [VehicleDetailComponent],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: FinanceCalculatorService, useValue: financeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDetailComponent);
    component = fixture.componentInstance;
    mockVehicleService = TestBed.inject(VehicleService) as jasmine.SpyObj<VehicleService>;
    mockFinanceService = TestBed.inject(FinanceCalculatorService) as jasmine.SpyObj<FinanceCalculatorService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Given VehicleDetailComponent is initialized', () => {
    describe('When vehicle loads successfully', () => {
      beforeEach(() => {
        mockVehicleService.getVehicleById.and.returnValue(of(mockVehicle));
        mockFinanceService.calculateFinance.and.returnValue(of(mockFinanceQuote));
      });

      it('Then should create component', () => {
        expect(component).toBeTruthy();
      });

      it('Then should load vehicle successfully', () => {
        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(mockVehicleService.getVehicleById).toHaveBeenCalledWith('veh001');
        expect(component['vehicle']()).toEqual(mockVehicle);
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBeNull();
      });
    });

    describe('When vehicle is not found', () => {
      it('Then should show error message', () => {
        // Arrange
        mockVehicleService.getVehicleById.and.returnValue(of(undefined));

        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(component['error']()).toBe('Vehicle not found');
        expect(component['loading']()).toBeFalse();
      });
    });

    describe('When service call fails', () => {
      it('Then should handle error gracefully', () => {
        // Arrange
        mockVehicleService.getVehicleById.and.returnValue(throwError(() => new Error('API Error')));

        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBe('Failed to load vehicle details. Please try again.');
      });
    });

    describe('When user interactions occur', () => {
      beforeEach(() => {
        mockVehicleService.getVehicleById.and.returnValue(of(mockVehicle));
        mockFinanceService.calculateFinance.and.returnValue(of(mockFinanceQuote));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('Then should navigate back when goBack is called', () => {
        // Act
        component['goBack']();

        // Assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vehicles']);
      });

      it('Then should handle finance terms changes', () => {
        // Arrange
        const mockTerms: FinanceTerms = {
          deposit: 5000,
          termInMonths: 48
        };
        mockFinanceService.calculateFinance.calls.reset();
        // Use a delayed observable to test the loading state
        mockFinanceService.calculateFinance.and.returnValue(
          timer(100).pipe(map(() => mockFinanceQuote))
        );

        // Act
        component['onFinanceTermsChanged'](mockTerms);

        // Assert
        expect(mockFinanceService.calculateFinance).toHaveBeenCalledWith(mockVehicle, 48, 5000);
        expect(component['calculatingFinance']()).toBeTrue();
      });

      it('Then should update finance quote when calculation completes', () => {
        // Arrange
        const mockTerms: FinanceTerms = {
          deposit: 5000,
          termInMonths: 48
        };

        // Act
        component['onFinanceTermsChanged'](mockTerms);

        // Assert
        expect(component['financeQuote']()).toEqual(mockFinanceQuote);
        expect(component['calculatingFinance']()).toBeFalse();
      });
    });
  });
}); 