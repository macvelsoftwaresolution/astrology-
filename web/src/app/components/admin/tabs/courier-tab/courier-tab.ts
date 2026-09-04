import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-courier-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './courier-tab.html',
  styleUrls: ['../../admin-dashboard.css', './courier-tab.css']
})
export class CourierTabComponent implements OnInit {
  activeLogisticsTab: 'books' | 'jathagam' = 'books';

  bookOrders: any[] = [];
  jathagamOrders: any[] = [];
  books: any[] = [];
  buyersList: any[] = [];
  isLoading = false;
  isJathagamLoading = false;
  isBooksLoading = false;

  selectedOrderForCourier: any = null;
  selectedOrderType: 'book' | 'jathagam' = 'book';
  courierForm = { status: 'Shipped', courier_partner: 'ST Courier', awb_number: '', shipping_address: '' };

  showAddBookModal = false;
  bookModalTitle = 'Add New Book';
  newBookForm: {
    id: number | null,
    title: string,
    author: string,
    price: string,
    original_price: string,
    is_bestseller: boolean,
    description: string
  } = {
    id: null,
    title: '',
    author: '',
    price: '',
    original_price: '',
    is_bestseller: false,
    description: ''
  };
  selectedCoverImage: File | null = null;
  selectedBookImages: File[] = [];

  selectedBookForBuyers: any = null;
  isLoadingBuyers = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadOrders();
      this.loadJathagamOrders();
      this.loadBooks();
    }
  }

  setLogisticsTab(tab: 'books' | 'jathagam'): void {
    this.activeLogisticsTab = tab;
    if (tab === 'jathagam' && this.jathagamOrders.length === 0) {
      this.loadJathagamOrders();
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/book-orders`, headers).subscribe({
      next: (res) => {
        this.bookOrders = res?.orders || (Array.isArray(res) ? res : []);
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: () => {
        this.bookOrders = [];
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  loadJathagamOrders(): void {
    this.isJathagamLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/jathagam-writing-orders`, headers).subscribe({
      next: (res) => {
        this.jathagamOrders = res?.orders || (Array.isArray(res) ? res : []);
        this.isJathagamLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: () => {
        this.jathagamOrders = [];
        this.isJathagamLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  parseDetails(detailsStr: any): any {
    if (!detailsStr) return {};
    if (typeof detailsStr === 'object') return detailsStr;
    try {
      return JSON.parse(detailsStr);
    } catch {
      return {};
    }
  }

  loadBooks(): void {
    this.isBooksLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/books`, headers).subscribe({
      next: (res) => {
        this.books = res?.books || (Array.isArray(res) ? res : []);
        this.isBooksLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: () => {
        this.books = [];
        this.isBooksLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  openAddBookModal(): void {
    this.bookModalTitle = 'Add New Book';
    this.newBookForm = {
      id: null,
      title: '',
      author: '',
      price: '',
      original_price: '',
      is_bestseller: false,
      description: ''
    };
    this.selectedCoverImage = null;
    this.selectedBookImages = [];
    this.showAddBookModal = true;
    try { this.cdr.markForCheck(); } catch {}
    try { this.cdr.detectChanges(); } catch {}
  }

  openEditBookModal(book: any): void {
    this.bookModalTitle = 'Edit Book';
    this.newBookForm = {
      id: book.id,
      title: book.title || '',
      author: book.author || '',
      price: book.price ? String(book.price) : '',
      original_price: book.original_price ? String(book.original_price) : '',
      is_bestseller: !!book.is_bestseller,
      description: book.description || ''
    };
    this.selectedCoverImage = null;
    this.selectedBookImages = [];
    this.showAddBookModal = true;
    try { this.cdr.markForCheck(); } catch {}
    try { this.cdr.detectChanges(); } catch {}
  }

  deleteBook(book: any): void {
    if (!confirm(`Are you sure you want to delete the book "${book.title}"?`)) return;

    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/books/${book.id}`, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Book deleted successfully!', 'புத்தகம் நீக்கப்பட்டது');
        this.loadBooks();
      },
      error: () => this.toastService.error('Failed to delete book.', 'பிழை ஏற்பட்டது')
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

  formValidationError: string = '';

  saveBook(): void {
    this.formValidationError = '';
    if (!this.newBookForm.title?.trim()) {
      this.formValidationError = 'தயவுசெய்து புத்தகத்தின் தலைப்பை (Book Title) உள்ளிடவும்.';
      this.toastService.warning(this.formValidationError, 'விவரங்கள் தேவை');
      return;
    }
    if (!this.newBookForm.price || Number(this.newBookForm.price) <= 0) {
      this.formValidationError = 'தயவுசெய்து சரியான புத்தக விற்பனை விலையை (Price) உள்ளிடவும்.';
      this.toastService.warning(this.formValidationError, 'விவரங்கள் தேவை');
      return;
    }

    const formData = new FormData();
    if (this.newBookForm.id) {
      formData.append('id', String(this.newBookForm.id));
    }
    formData.append('title', this.newBookForm.title);
    formData.append('author', this.newBookForm.author || '');
    formData.append('price', this.newBookForm.price);
    formData.append('original_price', this.newBookForm.original_price || '');
    formData.append('is_bestseller', this.newBookForm.is_bestseller ? '1' : '0');
    formData.append('description', this.newBookForm.description || '');
    if (this.selectedCoverImage) {
      formData.append('cover_image', this.selectedCoverImage);
    }

    if (this.selectedBookImages.length > 0) {
      this.selectedBookImages.forEach((file) => {
        formData.append('book_images[]', file);
      });
    }

    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post<any>(`${environment.apiUrl}/admin/books`, formData, { headers }).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Book saved successfully!', 'புத்தகம் சேமிக்கப்பட்டது');
        this.showAddBookModal = false;
        this.newBookForm = {
          id: null,
          title: '',
          author: '',
          price: '',
          original_price: '',
          is_bestseller: false,
          description: ''
        };
        this.selectedCoverImage = null;
        this.selectedBookImages = [];
        this.loadBooks();
      },
      error: () => this.toastService.error('Failed to save book.', 'பிழை ஏற்பட்டது')
    });
  }

  viewBuyers(book: any): void {
    this.selectedBookForBuyers = book;
    this.isLoadingBuyers = true;
    this.buyersList = [];
    try { this.cdr.markForCheck(); } catch {}
    try { this.cdr.detectChanges(); } catch {}

    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/books/${book.id}/buyers`, headers).subscribe({
      next: (res) => {
        this.buyersList = res.buyers || [];
        this.isLoadingBuyers = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: () => {
        this.isLoadingBuyers = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  openCourierModal(order: any, type: 'book' | 'jathagam' = 'book'): void {
    this.selectedOrderForCourier = order;
    this.selectedOrderType = type;

    let address = order.shipping_address || '';
    if (!address && type === 'jathagam') {
      const details = this.parseDetails(order.details);
      address = details.address || details.shipping_address || '';
    }

    this.courierForm = {
      status: order.status || 'Shipped',
      courier_partner: order.courier_partner || 'ST Courier',
      awb_number: order.awb_number || '',
      shipping_address: address
    };
  }

  saveCourierStatus(): void {
    if (!this.selectedOrderForCourier) return;
    const headers = this.authService.getAuthHeaders();

    const url = this.selectedOrderType === 'book'
      ? `${environment.apiUrl}/admin/book-orders/${this.selectedOrderForCourier.id}/courier`
      : `${environment.apiUrl}/admin/bookings/${this.selectedOrderForCourier.id}/courier`;

    this.http.put<any>(url, this.courierForm, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Courier status updated successfully!', 'கூரியர் நிலை மாற்றப்பட்டது');
        this.selectedOrderForCourier = null;
        if (this.selectedOrderType === 'book') {
          this.loadOrders();
        } else {
          this.loadJathagamOrders();
        }
      },
      error: () => this.toastService.error('Failed to update courier status.', 'பிழை ஏற்பட்டது')
    });
  }
}
