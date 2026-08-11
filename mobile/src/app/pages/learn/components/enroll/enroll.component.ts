import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-learn-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss'],
  standalone: false
})
export class LearnEnrollComponent implements OnInit {
  @Input() form: any;
  @Output() next = new EventEmitter<any>();

  localForm = {
    fullName: '',
    dob: '',
    tob: '',
    pob: '',
    qualification: '',
    reason: ''
  };

  ngOnInit() {
    if (this.form) {
      this.localForm = { ...this.form };
    }
  }

  onSubmit() {
    this.next.emit(this.localForm);
  }
}
