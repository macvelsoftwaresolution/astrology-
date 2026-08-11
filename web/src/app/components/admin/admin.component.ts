import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Booking {
  id: string;
  user: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Refunded';
  details: any;
  chartUrl?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';

  // Login Gate State
  isLoggedIn = false;
  username = '';
  password = '';
  loginError = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
    this.loadPanchangam();
  }

  loadBookings() {
    this.http.get<any[]>(`${this.apiUrl}/admin/bookings`).subscribe({
      next: (data) => {
        this.bookings = data.map(b => ({
          id: b.id,
          user: b.user_name,
          phone: b.user_phone,
          service: b.service_type,
          price: b.price,
          date: b.created_at ? b.created_at.substring(0, 10) : '',
          status: b.status,
          details: typeof b.details === 'string' ? JSON.parse(b.details) : b.details,
          chartUrl: b.chart_url
        }));
        this.totalRevenue = this.bookings.reduce((sum, b) => sum + Number(b.price), 0);
        this.totalBookingsCount = this.bookings.length;
        this.pendingHoroscopesCount = this.bookings.filter(b => b.status === 'Pending' && b.service === 'ஜாதகம் எழுதுதல்').length;
      },
      error: (err) => console.error('Failed to load bookings', err)
    });
  }

  loadPanchangam() {
    this.http.get<any>(`${this.apiUrl}/panchangam/today`).subscribe({
      next: (data) => {
        this.panchangam = {
          date: data.date,
          thithi: data.thithi,
          nakshathiram: data.star,
          rahukalam: data.rahukalam,
          yamagandam: data.yamagandam,
          nallaNeram: data.nalla_neram
        };
      },
      error: (err) => console.error('Failed to load panchangam', err)
    });
  }

  // Tab State
  activeTab: 'dashboard' | 'bookings' | 'horoscope-editor' | 'astrologers' = 'dashboard';

  // Analytics Metrics
  totalRevenue = 28750;
  totalBookingsCount = 24;
  pendingHoroscopesCount = 3;
  totalUsers = 142;

  // Mock Bookings Data
  bookings: Booking[] = [
    {
      id: 'AST-2026-001',
      user: 'கார்த்திக் ராஜா',
      phone: '+91 94440 12345',
      service: 'ஜாதகம் எழுதுதல்',
      price: 2000,
      date: '2026-08-09',
      status: 'Completed',
      details: { name: 'Karthik Raja', dob: '1995-05-15', tob: '08:45 AM', pob: 'Chennai', gender: 'ஆண்' },
      chartUrl: 'horoscope_karthik_raja.pdf'
    },
    {
      id: 'AST-2026-002',
      user: 'சரவணன் பி.',
      phone: '+91 98840 54321',
      service: 'வீட்டு வாஸ்து ஆலோசனை',
      price: 2500,
      date: '2026-08-10',
      status: 'Pending',
      details: { name: 'Saravanan', dob: '-', address: '12, காந்தி வீதி, கோவை', slot: '2026-08-12 (மாலை 3:00)', planUploaded: 'floorplan_v2.png' }
    },
    {
      id: 'AST-2026-003',
      user: 'பிரியா மோகன்',
      phone: '+91 90030 98765',
      service: 'திருமண பொருத்தம்',
      price: 500,
      date: '2026-08-10',
      status: 'Pending',
      details: { 
        boyName: 'விஜய்', boyDob: '1992-10-20', boyTob: '11:15 PM', boyPob: 'Madurai', boyRasi: 'சிம்மம்', boyStar: 'பூரம்',
        girlName: 'பிரியா', girlDob: '1996-03-12', girlTob: '02:30 AM', girlPob: 'Trichy', girlRasi: 'தனுசு', girlStar: 'மூலம்'
      }
    },
    {
      id: 'AST-2026-004',
      user: 'செல்வராஜ் கே.',
      phone: '+91 88701 44556',
      service: 'தொழில் எண் கணிதம்',
      price: 750,
      date: '2026-08-08',
      status: 'Completed',
      details: { name: 'Selvaraj K', dob: '1982-12-05', currentBusinessName: 'SK Enterprises', desiredBusinessField: 'உணவகம் (Hotel)' }
    },
    {
      id: 'AST-2026-005',
      user: 'ராஜேஷ் குமார்',
      phone: '+91 95000 66778',
      service: 'ஜாதகம் எழுதுதல்',
      price: 2000,
      date: '2026-08-10',
      status: 'Pending',
      details: { name: 'Rajesh Kumar', dob: '1988-07-24', tob: '04:20 PM', pob: 'Tirunelveli', gender: 'ஆண்' }
    }
  ];

  // Daily Panchangam Details
  panchangam = {
    date: '2026-08-10',
    thithi: 'ஏகாதசி (Ekadashi) - இரவு 10:20 வரை',
    nakshathiram: 'ரோகிணி (Rohini) - மாலை 06:15 வரை',
    rahukalam: 'மாலை 04:30 - மாலை 06:00',
    yamagandam: 'காலை 09:00 - காலை 10:30',
    nallaNeram: 'காலை 06:15 - காலை 07:15, மதியம் 12:15 - மதியம் 01:15'
  };

  // Rasi Palan Predictions
  rasiPalanList = [
    { rasi: 'மேஷம்', star: 'அஸ்வினி, பரணி, கார்த்திகை 1-ம் பாதம்', prediction: 'தொழிலில் லாபகரமான சூழல் நிலவும். குடும்பத்தில் மகிழ்ச்சி கூடும். உடல் ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை.' },
    { rasi: 'ரிஷபம்', star: 'கார்த்திகை 2,3,4, ரோகிணி, மிருகசீரிடம் 1,2-ம் பாதம்', prediction: 'புதிய முயற்சிகள் வெற்றியைத் தரும். எதிர்பார்த்த பணவரவு தடையின்றி கிடைக்கும். சுப காரியங்கள் கைகூடும்.' },
    { rasi: 'மிதுனம்', star: 'மிருகசீரிடம் 3,4, திருவாதிரை, புனர்பூசம் 1,2,3-ம் பாதம்', prediction: 'உத்தியோகத்தில் பதவி உயர்வு கிடைக்க வாய்ப்புண்டு. நண்பர்களின் உதவி மனதிற்கு நிம்மதி தரும்.' },
    { rasi: 'கடகம்', star: 'புனர்பூசம் 4, பூசம், ஆயில்யம்', prediction: 'மன அமைதி கூடும். கொடுத்த கடன்கள் வசூலாகும். வியாபாரத்தில் புதிய வாடிக்கையாளர்கள் அறிமுகமாவார்கள்.' },
    { rasi: 'சிம்மம்', star: 'மகம், பூரம், உத்திரம் 1-ம் பாதம்', prediction: 'பேச்சில் நிதானம் தேவை. தேவையற்ற அலைச்சல்கள் வரலாம். வாகனப் பயணங்களில் எச்சரிக்கையாக இருக்கவும்.' },
    { rasi: 'கன்னி', star: 'உத்திரம் 2,3,4, அஸ்தம், சித்திரை 1,2-ம் பாதம்', prediction: 'தொழில் விரிவாக்க சிந்தனை தோன்றும். கணவன்-மனைவி இடையே ஒற்றுமை பலப்படும். சுபச் செய்திகள் வந்து சேரும்.' },
    { rasi: 'துலாம்', star: 'சித்திரை 3,4, சுவாதி, விசாகம் 1,2,3-ம் பாதம்', prediction: 'பொருளாதார நிலை உயரும். உறவினர்களுடன் இருந்த கருத்து வேறுபாடுகள் நீங்கும். வியாபாரத்தில் வளர்ச்சி உண்டு.' },
    { rasi: 'விருச்சிகம்', star: 'விசாகம் 4, அனுஷம், கேட்டை', prediction: 'வழக்குகளில் சாதகமான முடிவு வரும். ஆன்மீக காரியங்களில் ஈடுபாடு அதிகரிக்கும். உத்தியோகத்தில் அமைதி.' },
    { rasi: 'தனுசு', star: 'மூலம், பூராடம், உத்திராடம் 1-ம் பாதம்', prediction: 'எதிர்பாராத பொருள் சேர்க்கை ஏற்படும். மனக்குழப்பங்கள் நீங்கி தெளிவான முடிவுகள் எடுப்பீர்கள்.' },
    { rasi: 'மகரம்', star: 'உத்திராடம் 2,3,4, திருவோணம், அவிட்டம் 1,2-ம் பாதம்', prediction: 'திடீர் செலவுகள் உண்டாகலாம். கூட்டுத் தொழில் சாதகமாக அமையும். உணவு விஷயத்தில் கவனம் செலுத்துங்கள்.' },
    { rasi: 'கும்பம்', star: 'அவிட்டம் 3,4, சதயம், பூரட்டாதி 1,2,3-ம் பாதம்', prediction: 'திட்டமிட்ட காரியங்கள் கைகூடும். புதிய சொத்துக்கள் வாங்கும் யோகம் உண்டு. சுபச்செய்தி தேடிவரும்.' },
    { rasi: 'மீனம்', star: 'பூரட்டாதி 4, உத்திரட்டாதி, ரேவதி', prediction: 'தடைபட்ட காரியங்கள் எளிதில் முடியும். பிள்ளைகள் வழியில் மகிழ்ச்சியான தகவல்கள் கிடைக்கும்.' }
  ];

  // Astrologer Calendars Availability
  astrologers = [
    {
      name: 'குரு ராமஜெயம் (Guru Ramajayam)',
      specialty: 'எண்கணிதம் மற்றும் வாஸ்து நிபுணர்',
      slots: [
        { time: 'காலை 10:00 - 11:00', status: 'Available' },
        { time: 'காலை 11:30 - மதியம் 12:30', status: 'Booked' },
        { time: 'மாலை 03:00 - 04:00', status: 'Available' }
      ]
    },
    {
      name: 'குரு ஸ்ரீநிவாசன் (Guru Srinivasan)',
      specialty: 'தலைமை ஜாதக கணிப்பாளர்',
      slots: [
        { time: 'காலை 09:30 - 10:30', status: 'Booked' },
        { time: 'காலை 11:00 - மதியம் 12:00', status: 'Available' },
        { time: 'மாலை 04:00 - 05:00', status: 'Available' }
      ]
    }
  ];

  // Booking detail modal variables
  selectedBooking: Booking | null = null;
  uploadedFileName = '';

  // Auth Handler
  login() {
    if (this.username === 'admin' && this.password === 'admin123') {
      this.isLoggedIn = true;
      this.loginError = '';
    } else {
      this.loginError = 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!';
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.username = '';
    this.password = '';
  }

  // Fulfill Booking Simulation
  viewBookingDetails(booking: Booking) {
    this.selectedBooking = booking;
    this.uploadedFileName = '';
  }

  closeModal() {
    this.selectedBooking = null;
  }

  fulfillBooking() {
    if (this.selectedBooking) {
      const payload = {
        chart_url: this.uploadedFileName || 'generated_horoscope_' + Date.now() + '.pdf'
      };
      this.http.put(`${this.apiUrl}/admin/bookings/${this.selectedBooking.id}/fulfill`, payload).subscribe({
        next: () => {
          this.loadBookings();
          this.closeModal();
        },
        error: (err) => alert('Fulfillment failed!')
      });
    }
  }

  // Edit Panchangam Handler
  savePanchangam() {
    const payload = {
      date: this.panchangam.date,
      thithi: this.panchangam.thithi,
      star: this.panchangam.nakshathiram,
      rahukalam: this.panchangam.rahukalam,
      yamagandam: this.panchangam.yamagandam,
      nalla_neram: this.panchangam.nallaNeram
    };
    this.http.put(`${this.apiUrl}/admin/panchangam`, payload).subscribe({
      next: () => alert('பஞ்சாங்கம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'),
      error: (err) => alert('பஞ்சாங்கம் புதுப்பிப்பதில் தோல்வி!')
    });
  }

  // Edit Rasi Palan Handler
  saveRasiPalan() {
    const payload = {
      date: this.panchangam.date,
      type: 'daily',
      predictions: this.rasiPalanList.map(r => ({
        rasi_name: r.rasi,
        prediction_text: r.prediction
      }))
    };
    this.http.put(`${this.apiUrl}/admin/rasi-palan`, payload).subscribe({
      next: () => alert('ராசி பலன் கணிப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'),
      error: (err) => alert('ராசி பலன் புதுப்பிப்பதில் தோல்வி!')
    });
  }

  // Add Astrologer Slot
  addSlot(astrologerIndex: number) {
    const newTime = prompt('புதிய நேரத்தை உள்ளிடவும் (எ.கா., மாலை 06:00 - 07:00):');
    if (newTime) {
      this.astrologers[astrologerIndex].slots.push({
        time: newTime,
        status: 'Available'
      });
    }
  }

  // Toggle Astrologer Slot Status
  toggleSlot(astrologerIndex: number, slotIndex: number) {
    const slot = this.astrologers[astrologerIndex].slots[slotIndex];
    slot.status = slot.status === 'Available' ? 'Booked' : 'Available';
  }
}
