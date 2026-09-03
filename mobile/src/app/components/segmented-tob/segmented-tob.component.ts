import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-segmented-tob',
  template: `
    <div class="tob-segmented-container" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <div class="tob-segments-group" style="display: flex; align-items: center; background: #fff; border: 1px solid rgba(81, 23, 23, 0.4); border-radius: 8px; padding: 6px 12px; flex: 1; min-width: 130px;">
        <span style="color: #64748b; margin-right: 8px; display: flex; align-items: center;"><i class="bi bi-clock" style="font-size: 16px;"></i></span>
        <input #hhInput
               type="tel"
               maxlength="2"
               placeholder="HH"
               [(ngModel)]="tobHh"
               (input)="onHhInput($event, mmInput)"
               style="width: 28px; border: none; outline: none; font-weight: 700; text-align: center; background: transparent; font-size: 15px; color: #4A0E17;">
        <span style="font-weight: 800; color: #4A0E17; margin: 0 4px; font-size: 16px;">:</span>
        <input #mmInput
               type="tel"
               maxlength="2"
               placeholder="MM"
               [(ngModel)]="tobMm"
               (input)="onMmInput($event)"
               (keydown)="onMmKeydown($event, hhInput)"
               style="width: 28px; border: none; outline: none; font-weight: 700; text-align: center; background: transparent; font-size: 15px; color: #4A0E17;">
      </div>

      <div style="display: flex; align-items: center; gap: 4px; background: #fff; padding: 3px; border-radius: 8px; border: 1px solid rgba(81, 23, 23, 0.4);">
        <button type="button" 
                (click)="setAmPm('AM')" 
                [style.background]="tobAmPm === 'AM' ? '#4A0E17' : 'transparent'"
                [style.color]="tobAmPm === 'AM' ? '#ECC876' : '#475569'"
                style="border: none; padding: 5px 12px; border-radius: 6px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
          AM
        </button>
        <button type="button" 
                (click)="setAmPm('PM')" 
                [style.background]="tobAmPm === 'PM' ? '#4A0E17' : 'transparent'"
                [style.color]="tobAmPm === 'PM' ? '#ECC876' : '#475569'"
                style="border: none; padding: 5px 12px; border-radius: 6px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
          PM
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SegmentedTobComponent implements OnInit, OnChanges {
  @Input() value: string = ''; // HH:MM:SS format
  @Output() valueChange = new EventEmitter<string>();

  tobHh: string = '';
  tobMm: string = '';
  tobAmPm: 'AM' | 'PM' = 'AM';

  ngOnInit() {
    this.parseValue();
  }

  ngOnChanges() {
    this.parseValue();
  }

  parseValue() {
    if (this.value && this.value.includes(':')) {
      const parts = this.value.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        let m = parts[1];
        if (isNaN(h)) {
          this.tobHh = '';
          this.tobMm = '';
          return;
        }
        if (h >= 12) {
          this.tobAmPm = 'PM';
          if (h > 12) h -= 12;
        } else {
          this.tobAmPm = 'AM';
          if (h === 0) h = 12;
        }
        this.tobHh = String(h).padStart(2, '0');
        this.tobMm = m.padStart(2, '0');
      }
    } else if (!this.value) {
      this.tobHh = '';
      this.tobMm = '';
    }
  }

  emitValue() {
    if (this.tobHh && this.tobMm && this.tobHh.length === 2 && this.tobMm.length === 2) {
      let h = parseInt(this.tobHh, 10);
      let mStr = this.tobMm;
      if (this.tobAmPm === 'PM' && h < 12) h += 12;
      if (this.tobAmPm === 'AM' && h === 12) h = 0;
      const formatted = `${String(h).padStart(2, '0')}:${mStr}:00`;
      this.valueChange.emit(formatted);
    } else {
      this.valueChange.emit('');
    }
  }

  setAmPm(ampm: 'AM' | 'PM') {
    this.tobAmPm = ampm;
    this.emitValue();
  }

  onHhInput(event: any, nextInput: HTMLInputElement) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      let num = parseInt(val, 10);
      if (num > 12) num = 12;
      if (num === 0) num = 12;
      val = num < 10 ? '0' + num : '' + num;
    }
    this.tobHh = val;
    event.target.value = val;
    this.emitValue();
    if (val.length === 2) {
      nextInput.focus();
    }
  }

  onMmInput(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      let num = parseInt(val, 10);
      if (num > 59) num = 59;
      val = num < 10 ? '0' + num : '' + num;
    }
    this.tobMm = val;
    event.target.value = val;
    this.emitValue();
  }

  onMmKeydown(event: KeyboardEvent, prevInput: HTMLInputElement) {
    if (event.key === 'Backspace' && !this.tobMm) {
      prevInput.focus();
    }
  }
}
