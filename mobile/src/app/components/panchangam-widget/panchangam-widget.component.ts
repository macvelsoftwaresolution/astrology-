import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panchangam-widget',
  templateUrl: './panchangam-widget.component.html',
  styleUrls: ['./panchangam-widget.component.scss'],
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
