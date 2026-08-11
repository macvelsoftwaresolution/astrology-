import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-learn-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
  standalone: false
})
export class LearnCertificateComponent {
  @Input() enrollForm: any;
  @Output() close = new EventEmitter<void>();
}
