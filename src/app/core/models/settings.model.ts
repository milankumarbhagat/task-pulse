export type AppTheme = 'light' | 'dark';

export interface ExtraSettings {
  autoHideCompleted?: boolean;
  confirmDeletion?: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
  emailDigest?: boolean;
}

export interface UserSettings {
  id?: number;
  userId: number;
  theme: AppTheme;
  language: string;
  timezone: string;
  dateFormat: string;
  sidebarState: 'expanded' | 'collapsed';
  extraSettings: ExtraSettings;
  updatedAt?: Date;
}
