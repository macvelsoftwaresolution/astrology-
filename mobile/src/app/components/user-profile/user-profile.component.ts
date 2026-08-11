import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  @Input() orders: any[] = [
    {
      type: 'horoscope',
      service: 'ஜாதகம் எழுதுதல்',
      details: 'ராஜேஷ் குமார் - மேஷ ராசி (அஸ்வினி)',
      date: '10 ஆகஸ்ட் 2026',
      price: '2,000',
      status: 'Completed',
      person: {
        name: 'ராஜேஷ் குமார்',
        dob: '15-05-1995',
        tob: '06:30 AM',
        pob: 'சென்னை',
        rasi: 'மேஷம்',
        star: 'அஸ்வினி'
      }
    },
    {
      type: 'marriage',
      service: 'திருமண பொருத்தம்',
      details: 'ராஜேஷ் குமார் & பிரியா - 8/10 பொருத்தம்',
      date: '08 ஆகஸ்ட் 2026',
      price: '500',
      status: 'Completed',
      person: {
        name: 'ராஜேஷ் குமார் & பிரியா',
        dob: '15-05-1995 / 22-09-1998',
        tob: '06:30 AM / 04:15 PM',
        pob: 'சென்னை / மதுரை',
        rasi: 'மேஷம் / ரிஷபம்',
        star: 'அஸ்வினி / கார்த்திகை'
      }
    },
    {
      type: 'services',
      service: 'வாஸ்து ஆலோசனைகள்',
      details: 'அலுவலக வாஸ்து வரைபட ஆய்வு',
      date: '01 ஆகஸ்ட் 2026',
      price: '2,500',
      status: 'Completed',
      person: {
        name: 'ராஜேஷ் குமார்',
        dob: '15-05-1995',
        tob: '06:30 AM',
        pob: 'சென்னை',
        rasi: 'மேஷம்',
        star: 'அஸ்வினி'
      }
    }
  ];

  currentUser: User | null = null;

  personDetails = {
    name: 'ராஜேஷ் குமார்',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    dob: '1995-05-15',
    tob: '06:30 AM',
    pob: 'சென்னை, தமிழ்நாடு',
    rasi: 'மேஷம்',
    star: 'அஸ்வினி',
    gothram: 'சிவ கோத்திரம்'
  };

  editForm = { ...this.personDetails };
  selectedOption: string | null = null;
  showEditModal: boolean = false;
  isSavedNotification: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      if (this.currentUser.fullName) this.personDetails.name = this.currentUser.fullName;
      if (this.currentUser.emailAddress) this.personDetails.email = this.currentUser.emailAddress;
      if (this.currentUser.mobileNumber) this.personDetails.phone = this.currentUser.mobileNumber;
    }
    this.editForm = { ...this.personDetails };
  }

  openEditModal() {
    this.editForm = { ...this.personDetails };
    this.showEditModal = true;
  }

  saveProfile() {
    this.personDetails = { ...this.editForm };
    this.showEditModal = false;
    this.isSavedNotification = true;
    setTimeout(() => {
      this.isSavedNotification = false;
    }, 3000);
  }

  openOptionDetail(optionKey: string) {
    this.selectedOption = optionKey;
  }

  closeOptionDetail() {
    this.selectedOption = null;
    this.showEditModal = false;
  }

  getFilteredOrders(): any[] {
    if (!this.selectedOption || this.selectedOption === 'payments') {
      return this.orders;
    }
    return this.orders.filter(o => o.type === this.selectedOption || this.selectedOption === 'services');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
