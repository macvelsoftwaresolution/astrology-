import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-courier-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './courier-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './courier-tab.component.css']
})
export class CourierTabComponent implements OnInit {
  bookOrders: any[] = [];
  books: any[] = [];
  buyersList: any[] = [];
  isLoading = false;
  isBooksLoading = false;
  
  selectedOrderForCourier: any = null;
  courierForm = { status: 'Shipped', courier_partner: 'Blue Dart', awb_number: '' };

  showAddBookModal = false;
  newBookForm = { title: '', author: '', price: '', description: '' };

  selectedBookForBuyers: any = null;
  isLoadingBuyers = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadOrders();
      this.loadBooks();
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/book-orders', headers).subscribe({
      next: (res) => {
        this.bookOrders = res.orders || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadBooks(): void {
    this.isBooksLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/books', headers).subscribe({
      next: (res) => {
        this.books = res.books || [];
        this.isBooksLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isBooksLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveBook(): void {
    if (!this.newBookForm.title || !this.newBookForm.price) {
      alert('Title and Price are required.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>('http://127.0.0.1:8000/api/admin/books', this.newBookForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Book added successfully!');
        this.showAddBookModal = false;
        this.newBookForm = { title: '', author: '', price: '', description: '' };
        this.loadBooks();
      },
      error: () => alert('Failed to add book.')
    });
  }

  viewBuyers(book: any): void {
    this.selectedBookForBuyers = book;
    this.isLoadingBuyers = true;
    this.buyersList = [];
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`http://127.0.0.1:8000/api/admin/books/${book.id}/buyers`, headers).subscribe({
      next: (res) => {
        this.buyersList = res.buyers || [];
        this.isLoadingBuyers = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingBuyers = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCourierModal(order: any): void {
    this.selectedOrderForCourier = order;
    this.courierForm = {
      status: order.status || 'Shipped',
      courier_partner: order.courier_partner || 'Blue Dart',
      awb_number: order.awb_number || ''
    };
  }

  saveCourierStatus(): void {
    if (!this.selectedOrderForCourier) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/book-orders/${this.selectedOrderForCourier.id}/courier`, this.courierForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Courier status updated successfully!');
        this.selectedOrderForCourier = null;
        this.loadOrders();
      },
      error: () => alert('Failed to update courier status.')
    });
  }
}
