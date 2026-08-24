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
    emailAddress: '',
    mobileNumber: '',
    dob: '',
    tob: '',
    pob: '',
    qualification: '',
    reason: '',
    courseLevel: 'ilanilai',
    prevCertificate: '',
    completionYear: '',
    prevMarks: '',
    prevUserId: ''
  };

  errorMessage: string = '';

  ngOnInit() {
    if (this.form) {
      this.localForm = {
        fullName: '',
        emailAddress: '',
        mobileNumber: '',
        dob: '',
        tob: '',
        pob: '',
        qualification: '',
        reason: '',
        courseLevel: 'ilanilai',
        prevCertificate: '',
        completionYear: '',
        prevMarks: '',
        prevUserId: '',
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
    if (!this.localForm.fullName || !this.localForm.emailAddress || !this.localForm.mobileNumber) {
      this.errorMessage = 'தயவுசெய்து பெயர், மின்னஞ்சல் முகவரி மற்றும் அலைபேசி எண்ணை உள்ளிடவும்.';
      return;
    }
    this.errorMessage = '';
    this.next.emit(this.localForm);
  }
}
