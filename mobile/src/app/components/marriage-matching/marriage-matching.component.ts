import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marriage-matching',
  templateUrl: './marriage-matching.component.html',
  styleUrls: ['./marriage-matching.component.scss'],
  standalone: false
})
export class MarriageMatchingComponent {
  @Input() rasis: any[] = [];

  matchingForm = {
    boyName: '', boyDob: '', boyTob: '', boyPob: '', boyRasi: 'சிம்மம்', boyStar: 'பூரம்',
    girlName: '', girlDob: '', girlTob: '', girlPob: '', girlRasi: 'தனுசு', girlStar: 'மூலம்'
  };

  matchingResult: any = null;
  serviceStep: number = 1; // 1: Form, 2: Results

  calculateMatching() {
    if (!this.matchingForm.boyName || !this.matchingForm.girlName) {
      alert('இருபாலரின் விவரங்களையும் முழுமையாக பூர்த்தி செய்யவும்!');
      return;
    }
    this.matchingResult = {
      score: '8 / 10',
      status: 'நன்றாக பொருந்துகிறது (Good Match)',
      boy: { name: this.matchingForm.boyName, rasi: this.matchingForm.boyRasi, star: this.matchingForm.boyStar },
      girl: { name: this.matchingForm.girlName, rasi: this.matchingForm.girlRasi, star: this.matchingForm.girlStar },
      matchesDetails: [
        { name: 'தினப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'கணப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'மகேந்திரப் பொருத்தம்', status: 'பொருந்தவில்லை ❌' },
        { name: 'ஸ்திரீ தீர்க்கப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'யோனிப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'இராசிப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'இராசியதிபதி பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'வசியப் பொருத்தம்', status: 'பொருந்தவில்லை ❌' },
        { name: 'இரஜ்ஜுப் பொருத்தம்', status: 'பொருந்துகிறது ✅' },
        { name: 'வேதைப் பொருத்தம்', status: 'பொருந்துகிறது ✅' }
      ]
    };
    this.serviceStep = 2;
  }

  resetForm() {
    this.matchingResult = null;
    this.serviceStep = 1;
    this.matchingForm.boyName = '';
    this.matchingForm.girlName = '';
  }
}
