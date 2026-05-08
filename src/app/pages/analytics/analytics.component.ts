import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  analyticsData: any = null;
  loading = true;
  selectedTimeframe: string = '7d';

  // Trend Chart
  trendChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  trendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Tasks Completed (Last 7 Days)', color: '#a0aec0' }
    },
    scales: {
      x: { ticks: { color: '#a0aec0' }, grid: { color: '#2d3748' } },
      y: { ticks: { color: '#a0aec0', stepSize: 1 }, grid: { color: '#2d3748' }, beginAtZero: true }
    }
  };

  // Priority Chart
  priorityChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: []
  };
  priorityChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#a0aec0' } },
      title: { display: true, text: 'Tasks by Priority', color: '#a0aec0' }
    }
  };

  // Status Chart
  statusChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };
  statusChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#a0aec0' } },
      title: { display: true, text: 'Tasks by Status', color: '#a0aec0' }
    }
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  onTimeframeChange() {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    this.loading = true;
    this.taskService.getAnalytics(this.selectedTimeframe).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.setupCharts(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching analytics', err);
        this.loading = false;
      }
    });
  }

  setupCharts(data: any) {
    // Trend Chart setup
    if (data.completedTrend) {
      const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const dates = data.completedTrend.map((t: any) => {
        const date = new Date(t.date);
        const dayStr = days[date.getDay()];
        return `${dayStr} ${date.getDate()}/${date.getMonth() + 1}`;
      });
      const counts = data.completedTrend.map((t: any) => t.count);

      this.trendChartData = {
        labels: dates,
        datasets: [
          {
            data: counts,
            label: 'Completed',
            fill: true,
            tension: 0.4,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            pointBackgroundColor: '#10b981'
          }
        ]
      };
    }

    // Priority Chart setup
    if (data.tasksByPriority) {
      const labels = data.tasksByPriority.map((p: any) => p.priority);
      const counts = data.tasksByPriority.map((p: any) => p.count);
      const bgColors = labels.map((l: string) => {
        if (l === 'HIGH') return '#ef4444'; // red-500
        if (l === 'MEDIUM') return '#f59e0b'; // amber-500
        return '#3b82f6'; // blue-500
      });

      this.priorityChartData = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: bgColors,
            hoverOffset: 4,
            borderWidth: 0
          }
        ]
      };
    }

    // Status Chart setup
    if (data.tasksByStatus) {
      const labels = data.tasksByStatus.map((s: any) => s.status);
      const counts = data.tasksByStatus.map((s: any) => s.count);
      const bgColors = labels.map((l: string) => {
        if (l === 'COMPLETED') return '#10b981';
        if (l === 'IN_PROGRESS') return '#8b5cf6'; // violet-500
        if (l === 'TODO') return '#64748b'; // slate-500
        return '#f97316'; // orange-500
      });

      this.statusChartData = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: bgColors,
            hoverOffset: 4,
            borderWidth: 0
          }
        ]
      };
    }
  }

  get completionRate(): number {
    if (!this.analyticsData || this.analyticsData.totalTasks === 0) return 0;
    return Math.round((this.analyticsData.completedTasks / this.analyticsData.totalTasks) * 100);
  }
}
