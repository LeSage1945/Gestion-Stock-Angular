import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {

  private route = inject(Router)

  deconnexion() {
    localStorage.removeItem('user')
    this.route.navigateByUrl("/login")
  }
}
