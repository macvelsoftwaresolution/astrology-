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
    reason: '',
    courseLevel: 'ilanilai',
    prevCertificate: '',
    completionYear: '',
    prevMarks: ''
  };

  ngOnInit() {
    if (this.form) {
      this.localForm = {
        fullName: '',
        dob: '',
        tob: '',
        pob: '',
        qualification: '',
        reason: '',
        courseLevel: 'ilanilai',
        prevCertificate: '',
        completionYear: '',
        prevMarks: '',
        ...this.form
      };
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.localForm.prevCertificate = file.name;
    }
  }

  onSubmit() {
    this.next.emit(this.localForm);
  }
}
