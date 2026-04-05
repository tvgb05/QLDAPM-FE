import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'gd1',
    loadComponent: () =>
      import('./features/gd1/gd1.component').then((m) => m.Gd1Component),
  },
  {
    path: 'gd2',
    loadComponent: () =>
      import('./features/gd2/gd2.component').then((m) => m.Gd2Component),
  },
  {
    path: 'topic-registration',
    loadComponent: () =>
      import('./features/gd3-topic-registration/gd3-topic-registration.component').then(
        (m) => m.Gd3TopicRegistrationComponent
      ),
  },
  {
    path: 'topic-review',
    loadComponent: () =>
      import('./features/gd3-topic-review/gd3-topic-review.component').then(
        (m) => m.Gd3TopicReviewComponent
      ),
  },
  {
    path: 'progress-report',
    loadComponent: () =>
      import('./features/gd3-progress-report/gd3-progress-report.component').then(
        (m) => m.Gd3ProgressReportComponent
      ),
  },
  {
    path: 'pdt',
    loadComponent: () =>
      import('./features/pdt/pdt.component').then((m) => m.PdtComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
