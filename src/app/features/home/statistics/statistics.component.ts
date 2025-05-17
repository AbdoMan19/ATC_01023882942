import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  value: number;
  label: string;
  icon: string;
  currentValue: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  stats: Stat[] = [
    { value: 10000, label: 'Events Created', icon: 'fas fa-calendar-check', currentValue: 0 },
    { value: 50000, label: 'Active Users', icon: 'fas fa-users', currentValue: 0 },
    { value: 100, label: 'Cities Covered', icon: 'fas fa-map-marker-alt', currentValue: 0 },
    { value: 4.8, label: 'User Rating', icon: 'fas fa-star', currentValue: 0 }
  ];

  private observer: IntersectionObserver;
  private animationDuration = 2000; // 2 seconds
  private animationInterval = 20; // Update every 20ms

  ngOnInit() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateNumbers();
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5 // Start animation when 50% of the element is visible
    });

    // Start observing the statistics section
    const statsSection = document.querySelector('.statistics');
    if (statsSection) {
      this.observer.observe(statsSection);
    }
  }

  private animateNumbers() {
    this.stats.forEach(stat => {
      const startValue = 0;
      const endValue = stat.value;
      const duration = this.animationDuration;
      const steps = duration / this.animationInterval;
      const increment = (endValue - startValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        stat.currentValue = Math.min(
          startValue + (increment * currentStep),
          endValue
        );

        if (currentStep >= steps) {
          clearInterval(interval);
          stat.currentValue = endValue;
        }
      }, this.animationInterval);
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
} 