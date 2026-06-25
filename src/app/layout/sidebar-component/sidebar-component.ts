import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
})
export class SidebarComponent {

  private authService = inject(AuthService);

  menu = [
    // ===== GÉNÉRAL =====
    {
      label: 'Tableau de bord',
      route: '/dashboard',
      icon: 'bi bi-speedometer2',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR', 'CAISSIER'],
      premium: false,
      group: 'Général'
    },

    // ===== VENTES & STOCK =====
    {
      label: 'Ventes',
      route: '/sales',
      icon: 'bi bi-cart-check',
      roles: ['SUPER_ADMIN', 'ADMIN', 'CAISSIER'],
      premium: false,
      group: 'Commerce'
    },
    {
      label: 'Produits',
      route: '/products',
      icon: 'bi bi-box-seam',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR'],
      premium: false,
      group: 'Commerce'
    },
    {
      label: 'Stocks',
      route: '/stock',
      icon: 'bi bi-archive',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR'],
      premium: false,
      group: 'Commerce'
    },
    {
      label: 'Fournisseurs',
      route: '/fournisseurs',
      icon: 'bi bi-truck',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false,
      group: 'Commerce'
    },

    // ===== ANALYSE =====
    {
      label: 'Rapports',
      route: '/reports',
      icon: 'bi bi-bar-chart-line',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false,
      group: 'Analyse'
    },

    // ===== ADMINISTRATION =====
    {
      label: 'Utilisateurs',
      route: '/users',
      icon: 'bi bi-people',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false,
      group: 'Administration'
    },
    {
      label: 'Paramètres',
      route: '/settings',
      icon: 'bi bi-gear',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false,
      group: 'Administration'
    },

    // ===== SUPER ADMIN =====
    {
      label: 'Comptes',
      route: '/compte',
      icon: 'bi bi-folder2-open',
      roles: ['SUPER_ADMIN'],
      premium: false,
      group: 'Super Admin'
    },
    {
      label: 'Utilisateurs admin',
      route: '/admin-users',
      icon: 'bi bi-person-badge',
      roles: ['SUPER_ADMIN'],
      premium: false,
      group: 'Super Admin'
    },
    {
      label: 'Abonnements',
      route: '/abonnement',
      icon: 'bi bi-credit-card',
      roles: ['SUPER_ADMIN'],
      premium: false,
      group: 'Super Admin'
    },
  ];

  get filteredMenu() {
    const role = this.authService.getRole();
    const abonnement = this.authService.getAbonnement();
    const isSuperAdmin = role === 'SUPER_ADMIN_SAGE_066062594';

    return this.menu.filter(item => {
      const roleOk = isSuperAdmin || item.roles.includes(role);
      const abonnementOk = isSuperAdmin || abonnement === 'ACTIF' || !item.premium;
      return roleOk && abonnementOk;
    });
  }

  get groupedMenu() {
    const groups: Record<string, typeof this.menu> = {};
    this.filteredMenu.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return Object.entries(groups);
  }

  get isBlocked(): boolean {
    const abonnement = this.authService.getAbonnement();
    return abonnement === 'BLOQUE' || abonnement === 'EXPIRE';
  }
}