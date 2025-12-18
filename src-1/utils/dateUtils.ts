// src/utils/dateUtils.ts
import { Timestamp } from 'firebase/firestore';

export const dateUtils = {
  /**
   * Calculate days remaining until a deadline
   */
  getDaysRemaining(deadline: Date | Timestamp | null | undefined): number {
    if (!deadline) return 0;
    
    const deadlineDate = deadline instanceof Timestamp ? deadline.toDate() : deadline;
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  /**
   * Get urgency color based on days remaining
   */
  getDeadlineUrgencyColor(daysRemaining: number): string {
    if (daysRemaining <= 0) return '#EF4444'; // Red - overdue
    if (daysRemaining <= 3) return '#EF4444'; // Red
    if (daysRemaining <= 7) return '#F59E0B'; // Amber
    return '#374151'; // Normal dark text
  },

  /**
   * Format date to readable string (dd-mm-yyyy)
   */
  formatDate(date: Date | Timestamp | null | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  },

  /**
   * Format date with time (dd-mm-yyyy HH:MM AM/PM)
   */
  formatDateTime(date: Date | Timestamp | null | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${day}-${month}-${year}, ${displayHours}:${minutes} ${ampm}`;
  },

  /**
   * Get relative time string (e.g., "2 hours ago", "3 days ago")
   */
  getRelativeTime(date: Date | Timestamp | null | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return this.formatDate(dateObj);
  },

  /**
   * Format days remaining text
   */
  formatDaysRemaining(daysRemaining: number): string {
    if (daysRemaining < 0) return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''}`;
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  }
};
