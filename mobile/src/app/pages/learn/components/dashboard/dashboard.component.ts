import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Chapter, Book, Seminar } from '../../learn.page';

@Component({
  selector: 'app-learn-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class LearnDashboardComponent implements OnInit {
  @Input() enrollForm: any;
  @Output() logout = new EventEmitter<void>();
  @Output() startQuiz = new EventEmitter<void>();
  @Output() viewCertificate = new EventEmitter<void>();

  @Input() dashboardTab: 'home' | 'lessons' | 'library' | 'profile' = 'home';
  @Output() dashboardTabChange = new EventEmitter<'home' | 'lessons' | 'library' | 'profile'>();

  @Input() currentLessonView: 'list' | 'detail' = 'list';
  @Output() currentLessonViewChange = new EventEmitter<'list' | 'detail'>();

  // Syllabus details
  chapters: Chapter[] = [
    {
      title: 'அத்தியாயம் 1: ஜோதிட அடிப்படைகள்',
      progress: 100,
      completed: true,
      isOpen: true,
      lessons: [
        { title: 'ஜோதிடத்தின் தோற்றம் & வரலாறு', duration: '15:30 நிமிடங்கள்', completed: true },
        { title: 'நவகிரக அறிமுகம் & முக்கியத்துவம்', duration: '12:45 நிமிடங்கள்', completed: true }
      ]
    },
    {
      title: 'அத்தியாயம் 2: ராசி மண்டலம்',
      progress: 60,
      completed: false,
      isOpen: false,
      lessons: [
        { title: '12 ராசிகள் மற்றும் அவற்றின் அதிபதிகள்', duration: '20:15 நிமிடங்கள்', completed: true },
        { title: 'ராசிகளின் குணாதிசயங்கள்', duration: '18:40 நிமிடங்கள்', completed: false }
      ]
    },
    {
      title: 'அத்தியாயம் 3: தசா புக்தி கணிதம்',
      progress: 0,
      completed: false,
      isOpen: false,
      lessons: [
        { title: 'விம்சோத்தரி தசா கணக்கீடு', duration: '25:10 நிமிடங்கள்', completed: false },
        { title: 'புத்தி நாதன்களின் பலன்கள்', duration: '22:30 நிமிடங்கள்', completed: false }
      ]
    }
  ];

  // Selected lesson for details view / player
  selectedLesson = {
    title: 'சிவ யோகம் - அறிமுகம்',
    instructor: 'ஜெக சீனிவாசன்',
    views: '24.5k',
    duration: '22 நிமிடங்கள்',
    description: 'இப்பாடம் சிவயோகத்தின் அடிப்படை தத்துவங்கள், அதன் முக்கியத்துவம் மற்றும் மனித உடலில் ஏற்படும் பிரபஞ்ச ஆற்றலின் அதிர்வுகளை விளக்குகிறது. தியானத்தின் மூலம் மனதை ஒருமுகப்படுத்த இது மிக அவசியம்.'
  };

  // Seminars List
  seminars: Seminar[] = [
    {
      title: 'சிறப்பு கருத்தரங்கம்: வாஸ்து சாஸ்திரம்',
      speaker: 'குரு சீனிவாசன் (வேத நிபுணர்)',
      date: 'இன்று',
      time: 'மாலை 06:00 - 07:30',
      status: 'live'
    },
    {
      title: 'ஜோதிடத்தின் அடிப்படைகள்',
      speaker: 'யோக குரு ராகவன்',
      date: 'ஞாயிறு, செப் 24',
      time: 'மாலை 04:00 - 05:30',
      status: 'upcoming'
    },
    {
      title: 'தியானத்தின் ஆற்றல்',
      speaker: 'முனைவர் அருண் மொழி',
      date: 'செப் 10, 2023',
      time: 'முடிந்தது',
      status: 'past'
    },
    {
      title: 'உணவே மருந்து - சித்த மருத்துவம்',
      speaker: 'சித்தர் விவேக்',
      date: 'செப் 03, 2023',
      time: 'முடிந்தது',
      status: 'past'
    }
  ];

  // Book Library Store List
  books: Book[] = [
    {
      id: 'book1',
      title: 'ஜோதிட ரகசியங்கள்',
      author: 'முனைவர் அருள்செல்வன்',
      price: 499,
      coverImage: 'assets/images/astro_service_bg.png',
      bought: false
    },
    {
      id: 'book2',
      title: 'வாஸ்து சாஸ்திர முழு விளக்கம்',
      author: 'சுவாமி நாகலிங்கம்',
      price: 599,
      coverImage: 'assets/images/temple_sunrise.png',
      bought: false
    },
    {
      id: 'book3',
      title: 'வேதங்கள் மற்றும் உபநிடதங்கள்',
      author: 'யோகி ஜெயராம்',
      price: 699,
      coverImage: 'assets/images/spiritual_education_bg.png',
      bought: false
    }
  ];

  // PDF Notes List
  pdfNotes = [
    { title: 'ராசி பலன் குறிப்பு', pages: '45 பக்கங்கள்' },
    { title: 'பஞ்சாங்க விளக்கம்', pages: '25 பக்கங்கள்' },
    { title: 'கிரக நிலைகள்', pages: '12 பக்கங்கள்' },
    { title: 'யோக விளக்கங்கள்', pages: '34 பக்கங்கள்' }
  ];

  // Checkout modal states
  activeBookCheckout = false;
  selectedCheckoutBook: Book | null = null;

  constructor(private toastController: ToastController) {}

  ngOnInit() {}

  toggleChapter(chapter: Chapter) {
    chapter.isOpen = !chapter.isOpen;
  }

  initiateBuyBook(book: Book) {
    this.selectedCheckoutBook = book;
    this.activeBookCheckout = true;
  }

  async confirmCheckoutPayment() {
    if (this.selectedCheckoutBook) {
      this.selectedCheckoutBook.bought = true;
      this.activeBookCheckout = false;
      const toast = await this.toastController.create({
        message: `${this.selectedCheckoutBook.title} வெற்றிகரமாக வாங்கப்பட்டது!`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      this.selectedCheckoutBook = null;
    }
  }

  closeCheckout() {
    this.activeBookCheckout = false;
    this.selectedCheckoutBook = null;
  }

  async downloadPDF(fileName: string) {
    const toast = await this.toastController.create({
      message: `${fileName} - PDF வெற்றிகரமாக தரவிறக்கப்பட்டது!`,
      duration: 2500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    // Trigger basic simulated download
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJVRleHQgRG93bmxvYWQgRGVtbw==';
    link.download = `${fileName}.pdf`;
    link.click();
  }

  setTab(tab: 'home' | 'lessons' | 'library' | 'profile') {
    this.dashboardTab = tab;
    this.dashboardTabChange.emit(tab);
  }

  handleBackClick() {
    if (this.currentLessonView === 'detail') {
      this.currentLessonView = 'list';
      this.currentLessonViewChange.emit('list');
    } else if (this.dashboardTab !== 'home') {
      this.setTab('home');
    } else {
      this.logout.emit();
    }
  }

  goToExams() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    // Auto-open syllabus or scroll to exam
    this.chapters.forEach(c => c.isOpen = true);
    this.showToast('தேர்வுகள் பிரிவிற்கு நகர்த்தப்பட்டது. பாடத்தைத் தேர்வுசெய்து தேர்வினை எழுதலாம்.', 'secondary');
  }

  goToSyllabus() {
    this.setTab('lessons');
    this.currentLessonView = 'list';
    this.currentLessonViewChange.emit('list');
    this.chapters.forEach(c => c.isOpen = true);
  }

  selectCourseLesson(lesson: any) {
    this.selectedLesson = {
      title: lesson.title,
      instructor: 'ஜெக சீனிவாசன்',
      views: '12.8k',
      duration: lesson.duration,
      description: `இப்பாடம் ${lesson.title} பற்றிய விரிவான விளக்கங்களை வழங்குகிறது. ஜோதிடத்தின் நுணுக்கங்களை எளிய முறையில் கற்றுக்கொள்ள இந்த வகுப்பு உதவும்.`
    };
    this.currentLessonView = 'detail';
    this.currentLessonViewChange.emit('detail');
    this.playVideo();
  }

  goToAudio() {
    this.setTab('lessons');
    this.currentLessonView = 'detail';
    this.currentLessonViewChange.emit('detail');
    this.playVideo();
  }

  openMockGoogleMeet() {
    const meetUrl = 'https://meet.google.com/abc-defg-hij';
    window.open(meetUrl, '_blank');
    this.showToast('நேரலை வகுப்பு கூகுள் மீட் லிங்க் திறக்கப்படுகிறது...', 'success');
  }

  async openDiary() {
    const toast = await this.toastController.create({
      message: 'ஆன்மீக நாட்குறிப்பு திறக்கப்பட்டது',
      duration: 2000,
      color: 'dark',
      position: 'bottom'
    });
    await toast.present();
  }

<<<<<<< Updated upstream
  async playLiveClass() {
    this.dashboardTab = 'lessons';
    const toast = await this.toastController.create({
      message: 'நேரடி வகுப்பு வீடியோ இணைக்கப்படுகிறது...',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
=======
  playLiveClass() {
    this.openMockGoogleMeet();
>>>>>>> Stashed changes
  }

  async playVideo() {
    const toast = await this.toastController.create({
      message: 'வீடியோ வகுப்பு பிளே செய்யப்படுகிறது...',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
