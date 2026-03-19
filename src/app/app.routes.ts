import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    // Use lazy loading for multiple related screens/routes
    {
        path: 'task',
        loadChildren: () => import('./pages/task/task.routes').then(m => m.TASK_ROUTES),
        canActivate: [authGuard]
    },
    // Use lazy loading for single screen
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
