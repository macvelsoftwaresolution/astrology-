import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatrimonyTab } from './matrimony-tab';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MatrimonyTab', () => {
  let component: MatrimonyTab;
  let fixture: ComponentFixture<MatrimonyTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrimonyTab],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrimonyTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
