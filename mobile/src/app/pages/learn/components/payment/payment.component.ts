import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-learn-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false
})
export class LearnPaymentComponent {
  @Input() isProcessing: boolean = false;
  @Output() next = new EventEmitter<void>();

  isRazorpaySelected: boolean = true;

  onProceed() {
    if (!this.isRazorpaySelected) {
      alert('தயவுசெய்து Razorpay Payment Gateway-ஐ தேர்வு செய்யவும்.');
      return;
    }
    this.next.emit();
  }
}

