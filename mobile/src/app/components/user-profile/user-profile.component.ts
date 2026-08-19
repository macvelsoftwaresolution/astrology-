import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit, OnChanges {
  @Input() orders: any[] = [];
  @Input() initialOption: string | null = null;

  currentUser: User | null = null;
  isLoading: boolean = false;

  personDetails = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    tob: '',
    pob: '',
    rasi: '',
    star: '',
    gothram: '',
    profileImageUrl: ''
  };

  editForm = { ...this.personDetails };
  selectedOption: string | null = null;
  showEditModal: boolean = false;
  isSavedNotification: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  get token() {
    return localStorage.getItem('auth_token') || '';
  }

  get headers() {
    return { headers: { Authorization: `Bearer ${this.token}` } };
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.personDetails.name = this.currentUser.fullName || this.currentUser.name || '';
      this.personDetails.email = this.currentUser.emailAddress || this.currentUser.email || '';
      this.personDetails.phone = this.currentUser.mobileNumber || this.currentUser.phone || '';
      this.personDetails.profileImageUrl = this.currentUser.profileImage || '';
    }
    if (this.initialOption) {
      this.selectedOption = this.initialOption;
    }
    this.loadProfileFromDb();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialOption'] && this.initialOption) {
      this.selectedOption = this.initialOption;
    }
  }

  loadProfileFromDb() {
    if (!this.token) return;
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/user/profile`, this.headers).subscribe({
      next: (res) => {
        if (res) {
          this.personDetails.name = res.name || this.personDetails.name;
          this.personDetails.email = res.email || this.personDetails.email;
          this.personDetails.phone = res.phone || this.personDetails.phone;
          this.personDetails.profileImageUrl = res.avatar_url || this.personDetails.profileImageUrl;

          const jd = res.jathagam_details;
          if (jd) {
            this.personDetails.dob = jd.dob || '';
            this.personDetails.tob = jd.tob || '';
            this.personDetails.pob = jd.pob || '';
            this.personDetails.rasi = jd.rasi || '';
            this.personDetails.star = jd.star || jd.nakshatra || '';
            this.personDetails.gothram = jd.gothram || '';
          }
          this.editForm = { ...this.personDetails };
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openEditModal() {
    this.editForm = { ...this.personDetails };
    this.showEditModal = true;
  }

  isUploadingAvatar = false;

  onProfilePicSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingAvatar = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatars');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.editForm.profileImageUrl = res.url;
        }
        this.isUploadingAvatar = false;
      },
      error: () => {
        this.isUploadingAvatar = false;
      }
    });
  }

  saveProfile() {
    this.personDetails = { ...this.editForm };
    this.showEditModal = false;
    this.isSavedNotification = true;

    const payload = {
      name: this.personDetails.name,
      phone: this.personDetails.phone,
      avatar_url: this.personDetails.profileImageUrl,
      jathagam_details: {
        dob: this.personDetails.dob,
        tob: this.personDetails.tob,
        pob: this.personDetails.pob,
        rasi: this.personDetails.rasi,
        star: this.personDetails.star,
        nakshatra: this.personDetails.star,
        gothram: this.personDetails.gothram
      }
    };

    this.http.put<any>(`${environment.apiUrl}/user/profile`, payload, this.headers).subscribe({
      next: () => {
        if (this.currentUser) {
          this.currentUser.fullName = this.personDetails.name;
          this.currentUser.mobileNumber = this.personDetails.phone;
          this.currentUser.profileImage = this.personDetails.profileImageUrl;
          localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
        }
      },
      error: () => {}
    });

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
    this.router.navigate([], {
      queryParams: { option: null },
      queryParamsHandling: 'merge'
    });
  }

  getFilteredOrders(): any[] {
    if (!this.selectedOption || this.selectedOption === 'payments') {
      return this.orders;
    }
    return this.orders.filter(o => o.type === this.selectedOption || this.selectedOption === 'services');
  }

  getParsedDetails(order: any): any {
    if (order.parsedDetails) return order.parsedDetails;
    if (order.details) {
      if (typeof order.details === 'object') return order.details;
      if (typeof order.details === 'string') {
        const trimmed = order.details.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            return JSON.parse(trimmed);
          } catch {
            return { notes: order.details };
          }
        } else {
          return { notes: order.details };
        }
      }
    }
    return null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
