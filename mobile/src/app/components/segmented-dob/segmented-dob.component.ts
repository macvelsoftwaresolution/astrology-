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
    } else if (!this.value) {
      this.dobDay = '';
      this.dobMonth = '';
      this.dobYear = '';
    }
  }

  isValidCalendarDate(y: number, m: number, d: number): boolean {
    if (y < 1900 || y > new Date().getFullYear()) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === (m - 1) && date.getDate() === d;
  }

  emitValue() {
    const y = parseInt(this.dobYear, 10);
    const m = parseInt(this.dobMonth, 10);
    const d = parseInt(this.dobDay, 10);

    if (this.dobYear && this.dobYear.length === 4 && this.dobMonth && this.dobDay && this.isValidCalendarDate(y, m, d)) {
      const formatted = `${this.dobYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      this.valueChange.emit(formatted);
    } else {
      this.valueChange.emit('');
    }
  }

  onDayInput(event: any, nextInput: HTMLInputElement) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      let num = parseInt(val, 10);
      if (num > 31) num = 31;
      if (num === 0) num = 1;
      val = num < 10 ? '0' + num : '' + num;
    }
    this.dobDay = val;
    event.target.value = val;
    this.emitValue();
    if (val.length === 2) {
      nextInput.focus();
    }
  }

  onMonthInput(event: any, nextInput: HTMLInputElement) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      let num = parseInt(val, 10);
      if (num > 12) num = 12;
      if (num === 0) num = 1;
      val = num < 10 ? '0' + num : '' + num;
    }
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
    if (val.length === 4) {
      let num = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      if (num > currentYear) num = currentYear;
      val = '' + num;
    }
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
