import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login.component/login.component';
import { RegisterComponent } from './auth/register.component/register.component';

import { LayoutComponent } from './layout/layout-component/layout-component';

import { DashboardComponent } from './pages/dashboard-component/dashboard-component';
import { ProductsComponent } from './pages/products-component/products-component';
import { StockComponent } from './pages/stock-component/stock-component';
import { AlertsComponent } from './pages/alerts-component/alerts-component';
import { SalesComponent } from './pages/sales-component/sales-component';
import { UsersComponent } from './pages/users-component/users-component';
import { SettingsComponent } from './pages/settings-component/settings-component';
import { ReportsComponent } from './pages/reports-component/reports-component';

import { FournisseurComponent } from './pages/fournisseur/fournisseur.component/fournisseur.component';

import { authGuard } from './core/guards/auth.guard';
import { AbonnementComponent } from './pages/abonnement/abonnement.component/abonnement.component';
import { abonnementGuard } from './core/guards/abonnement-guard';
import { CompteComponent } from './pages/compte-component/compte-component';
import { AdminUserComponent } from './pages/admin-user-component/admin-user-component';

export const routes: Routes = [

  // ================= AUTH =================
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  // ================= APP =================
  {
    path: '',

    component: LayoutComponent,

    canActivate: [authGuard, abonnementGuard],

    children: [
      {
        path: 'abonnement',
        component: AbonnementComponent
      },

      {
        path: 'compte',
        component: CompteComponent
      },
      
      {
        path: 'admin-users',
        component: AdminUserComponent
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'products',
        component: ProductsComponent
      },

      {
        path: 'stock',
        component: StockComponent
      },

      {
        path: 'alerts',
        component: AlertsComponent
      },

      {
        path: 'sales',
        component: SalesComponent
      },

      {
        path: 'users',
        component: UsersComponent
      },

      {
        path: 'fournisseurs',
        component: FournisseurComponent
      },

      {
        path: 'settings',
        component: SettingsComponent
      },

      {
        path: 'reports',
        component: ReportsComponent
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];