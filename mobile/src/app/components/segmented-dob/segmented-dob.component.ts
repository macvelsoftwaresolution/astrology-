import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-segmented-dob',
  template: `
    <div class="dob-segmented-container">
      <div class="dob-segments-group">
        <input #dayInput
               type="tel"
               maxlength="2"
               placeholder="DD"
               [(ngModel)]="dobDay"
               (input)="onDayInput($event, monthInput)"
               class="dob-seg-input seg-day">
        <span class="dob-sep">/</span>
        <input #monthInput
               type="tel"
               maxlength="2"
               placeholder="MM"
               [(ngModel)]="dobMonth"
               (input)="onMonthInput($event, yearInput)"
               (keydown)="onMonthKeydown($event, dayInput)"
               class="dob-seg-input seg-month">
        <span class="dob-sep">/</span>
        <input #yearInput
               type="tel"
               maxlength="4"
               placeholder="YYYY"
               [(ngModel)]="dobYear"
               (input)="onYearInput($event)"
               (keydown)="onYearKeydown($event, monthInput)"
               class="dob-seg-input seg-year">
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SegmentedDobComponent implements OnInit, OnChanges {
  @Input() value: string = ''; // YYYY-MM-DD
  @Output() valueChange = new EventEmitter<string>();

  dobDay: string = '';
  dobMonth: string = '';
  dobYear: string = '';

  ngOnInit() {
    this.parseValue();
  }

  ngOnChanges() {
    this.parseValue();
  }

  parseValue() {
    if (this.value && this.value.length === 10) {
      const parts = this.value.split('-');
      if (parts.length === 3) {
        this.dobYear = parts[0];
        this.dobMonth = parts[1];
        this.dobDay = parts[2];
      }
    } else {
      this.dobDay = '';
      this.dobMonth = '';
      this.dobYear = '';
    }
  }

  emitValue() {
    if (this.dobDay && this.dobMonth && this.dobYear && this.dobYear.length === 4) {
      const formatted = `${this.dobYear}-${this.dobMonth.padStart(2, '0')}-${this.dobDay.padStart(2, '0')}`;
      this.valueChange.emit(formatted);
    } else {
      this.valueChange.emit('');
    }
  }

  onDayInput(event: any, nextInput: HTMLInputElement) {
    let val = event.target.value.replace(/\D/g, '');
    this.dobDay = val;
    event.target.value = val;
    this.emitValue();
    if (val.length === 2) {
      nextInput.focus();
    }
  }

  onMonthInput(event: any, nextInput: HTMLInputElement) {
    let val = event.target.value.replace(/\D/g, '');
    this.dobMonth = val;
    event.target.value = val;
    this.emitValue();
    if (val.length === 2) {
      nextInput.focus();
    }
  }

  onMonthKeydown(event: KeyboardEvent, prevInput: HTMLInputElement) {
    if (event.key === 'Backspace' && !this.dobMonth) {
      prevInput.focus();
    }
  }

  onYearInput(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    this.dobYear = val;
    event.target.value = val;
    this.emitValue();
  }

  onYearKeydown(event: KeyboardEvent, prevInput: HTMLInputElement) {
    if (event.key === 'Backspace' && !this.dobYear) {
      prevInput.focus();
    }
  }
}
