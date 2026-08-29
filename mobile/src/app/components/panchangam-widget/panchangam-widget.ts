import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panchangam-widget',
  templateUrl: './panchangam-widget.html',
  styleUrls: ['./panchangam-widget.scss'],
  standalone: false
})
export class PanchangamWidgetComponent {
  @Input() panchangam: any = {
    thithi: '',
    star: '',
    rahukalam: '',
    yamagandam: '',
    nalla_neram: ''
  };
}
