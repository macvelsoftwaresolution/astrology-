import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JathagamWritingPage } from './jathagam-writing.page';

describe('JathagamWritingPage', () => {
  let component: JathagamWritingPage;
  let fixture: ComponentFixture<JathagamWritingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JathagamWritingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
