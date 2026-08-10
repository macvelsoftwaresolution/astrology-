import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panchangam-widget',
  templateUrl: './panchangam-widget.component.html',
  styleUrls: ['./panchangam-widget.component.scss'],
  standalone: false
})
export class PanchangamWidgetComponent {
  @Input() panchangam: any = {
    thithi: 'ஏகாதசி',
    star: 'ரோகினி',
    rahukalam: '10:30 - 12:00',
    yamagandam: '09:15 - 10:15'
  };
}
