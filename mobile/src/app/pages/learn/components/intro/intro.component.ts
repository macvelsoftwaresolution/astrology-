import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-learn-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  standalone: false
})
export class LearnIntroComponent {
  @Output() next = new EventEmitter<void>();
}
