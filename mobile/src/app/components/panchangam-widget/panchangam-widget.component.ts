import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panchangam-widget',
  templateUrl: './panchangam-widget.component.html',
  styleUrls: ['./panchangam-widget.component.scss'],
  standalone: false
})
export class PanchangamWidgetComponent {
  @Input() panchangam: any = {
    thithi: 'சுக்கில பட்ச துவாதசி',
    star: 'ரோகிணி',
    rahukalam: '10:30 AM - 12:00 PM',
    yamagandam: '09:15 AM - 10:15 AM',
    nalla_neram: '06:15 AM - 07:15 AM'
  };
}
