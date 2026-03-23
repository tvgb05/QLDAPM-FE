import { Routes } from '@angular/router';
import { Gd1Component } from './features/gd1/gd1.component';
import { Gd2Component } from './features/gd2/gd2.component';
import { Gd3ProgressReportComponent } from './features/gd3-progress-report/gd3-progress-report.component';
import { Gd3TopicRegistrationComponent } from './features/gd3-topic-registration/gd3-topic-registration.component';
import { Gd3TopicReviewComponent } from './features/gd3-topic-review/gd3-topic-review.component';
import { LoginComponent } from './features/login/login.component';
import { PdtComponent } from './features/pdt/pdt.component';
import { TempComponent } from './features/temp/temp.component';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'gd1',
    component: Gd1Component,
  },
  {
    path: 'gd2',
    component: Gd2Component,
  },
  {
    path: 'gd3/topic-registration',
    component: Gd3TopicRegistrationComponent,
  },
  {
    path: 'gd3/topic-review',
    component: Gd3TopicReviewComponent,
  },
  {
    path: 'gd3/progress-report',
    component: Gd3ProgressReportComponent,
  },
  {
    path: 'pdt',
    component: PdtComponent,
  },
  {
    path: 'temp',
    component: TempComponent,
  },
];
