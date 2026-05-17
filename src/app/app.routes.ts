import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { redirectAuthGuard } from './core/guards/redirect-auth.guard';

export const routes: Routes = [
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard] // check if user is authenticated
    },
    {
        path: 'convert',
        loadComponent: () => import('./pages/convert/document-convertor.component').then(m => m.DocumentConvertorComponent)
    },
    // Use lazy loading for multiple related screens/routes
    {
        path: 'task',
        loadChildren: () => import('./pages/task/task.routes').then(m => m.TASK_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'utilities/video-to-mp3',
        loadComponent: () => import('./pages/utilities/video-to-mp3/video-to-mp3.component').then(m => m.VideoToMp3Component)
    },
    {
        path: 'notes',
        loadComponent: () => import('./pages/notes/notes-list/notes-list.component').then(m => m.NotesListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'notes/new',
        loadComponent: () => import('./pages/notes/note-form/note-form.component').then(m => m.NoteFormComponent),
        canActivate: [authGuard]
    },
    {
        path: 'notes/edit/:id',
        loadComponent: () => import('./pages/notes/note-form/note-form.component').then(m => m.NoteFormComponent),
        canActivate: [authGuard]
    },
    // Use lazy loading for single screen
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        canActivate: [redirectAuthGuard]
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./pages/sign-up/sign-up.component').then(m => m.SignUpComponent),
        canActivate: [redirectAuthGuard]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [redirectAuthGuard]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        canActivate: [redirectAuthGuard]
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
