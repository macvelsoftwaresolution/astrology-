import { environment } from '../../../../../environments/environment';
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
  selectedCoverImage: File | null = null;
  selectedBookImages: File[] = [];

  selectedBookForBuyers: any = null;
  isLoadingBuyers = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadOrders();
      this.loadBooks();
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/book-orders`, headers).subscribe({
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
    this.http.get<any>(`${environment.apiUrl}/admin/books`, headers).subscribe({
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

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCoverImage = event.target.files[0];
    }
  }

  onBookImagesSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedBookImages = Array.from(event.target.files);
    }
  }

  saveBook(): void {
    if (!this.newBookForm.title || !this.newBookForm.price) {
      alert('Title and Price are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newBookForm.title);
    formData.append('author', this.newBookForm.author || '');
    formData.append('price', this.newBookForm.price);
    formData.append('description', this.newBookForm.description || '');
    if (this.selectedCoverImage) {
      formData.append('cover_image', this.selectedCoverImage);
    }

    if (this.selectedBookImages.length > 0) {
      this.selectedBookImages.forEach((file) => {
        formData.append('book_images[]', file);
      });
    }

    // When sending FormData, angular sets multipart/form-data automatically, but we need the auth header.
    // getAuthHeaders() typically returns HttpHeaders object. If it sets Content-Type to application/json, we need to override it or remove it.
    // Let's assume authService.getAuthHeaders() adds Authorization. If it adds Content-Type, we might have an issue.
    // Let's use authService.getToken() which has the correct logic
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post<any>(`${environment.apiUrl}/admin/books`, formData, { headers }).subscribe({
      next: (res) => {
        alert(res.message || 'Book added successfully!');
        this.showAddBookModal = false;
        this.newBookForm = { title: '', author: '', price: '', description: '' };
        this.selectedCoverImage = null;
        this.selectedBookImages = [];
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
    this.http.get<any>(`${environment.apiUrl}/admin/books/${book.id}/buyers`, headers).subscribe({
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
    this.http.put<any>(`${environment.apiUrl}/admin/book-orders/${this.selectedOrderForCourier.id}/courier`, this.courierForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Courier status updated successfully!');
        this.selectedOrderForCourier = null;
        this.loadOrders();
      },
      error: () => alert('Failed to update courier status.')
    });
  }
}
