import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Output, EventEmitter, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-bar, [app-side-bar]',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideBarComponent {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  sidebarStatus = input.required<boolean>();
  listSections = [
    {'icon': 'home',
      'link': '/',
      'name': 'Inicio'
    },
    {'icon': 'calendar_month',
      'link': '/historial',
      'name': 'Historial'
    },
    {'icon': 'pages',
      'link': '/graficos',
      'name': 'Graficos'
    }
  ];
  changeSidebar(){
    //this.toggle.emit(!this.sidebarStatus);
  }
}
