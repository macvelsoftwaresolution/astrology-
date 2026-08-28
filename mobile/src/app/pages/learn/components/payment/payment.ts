import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-learn-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
  standalone: false
})
export class LearnPaymentComponent {
  @Input() isProcessing: boolean = false;
  @Input() amount: number = 2500;
  @Input() courseLevel: string = 'ilanilai';
  @Output() next = new EventEmitter<void>();

  isRazorpaySelected: boolean = true;

  getCourseTitle(): string {
    const lvl = this.courseLevel?.toLowerCase() || 'ilanilai';
    return (lvl === 'mudhunilai' || lvl === 'muthunilai')
      ? 'முதுநிலை ஜோதிடப் பயிலரங்கம் (Mudhunilai Master)'
      : 'இளநிலை ஜோதிடப் பயிலரங்கம் (Ilanilai Fast Track)';
  }

  onProceed() {
    if (!this.isRazorpaySelected) {
      alert('தயவுசெய்து Razorpay Payment Gateway-ஐ தேர்வு செய்யவும்.');
      return;
    }
    this.next.emit();
  }
}

