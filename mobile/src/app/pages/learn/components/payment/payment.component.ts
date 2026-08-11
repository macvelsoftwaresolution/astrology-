import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-learn-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false
})
export class LearnPaymentComponent {
  @Output() next = new EventEmitter<void>();
}
