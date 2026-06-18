import { Component } from '@angular/core';
import { HeaderComponent } from "../header-component/header-component";
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-component',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css',
})
export class LayoutComponent {

}
