import { Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskFormComponent } from './task-form/task-form.component';

export const TASK_ROUTES: Routes = [
    {
        path: '',
        component: TaskListComponent
    },
    {
        path: 'add',
        component: TaskFormComponent
    },
    {
        path: 'edit/:id',
        component: TaskFormComponent
    },
    {
        path: 'detail/:id',
        component: TaskDetailsComponent
    }
];