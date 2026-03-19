import { Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';

export const TASK_ROUTES: Routes = [
    {
        path: '',
        component: TaskListComponent
    },
    {
        path: 'detail/:id',
        component: TaskDetailsComponent
    }
];