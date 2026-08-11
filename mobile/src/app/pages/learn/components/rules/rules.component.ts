import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-learn-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  standalone: false
})
export class LearnRulesComponent {
  @Output() next = new EventEmitter<void>();
}
