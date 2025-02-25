import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class NotificationsSse {
  private logger = new Logger(NotificationsSse.name);
  private userSubjects = new Map<string, Subject<any>>();

  private getSubjectForUser(userId: string): Subject<any> {
    if (!this.userSubjects.has(userId)) {
      this.userSubjects.set(userId, new Subject());
    }
    return this.userSubjects.get(userId)!;
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.logger.debug(`Sending notification to user ${userId}`);
    const subject = this.getSubjectForUser(userId);
    if (!subject) {
      this.logger.warn(`No SSE subscription found for user ${userId}`);
      return;
    }
    console.log(subject);
    subject.next({
      type: 'notification',
      data: notification,
      timestamp: new Date(),
      event: 'notification',
    });
    this.logger.debug(`Notification sent to user ${userId}:`, notification);
  }

  sendNotificationToTenant(tenantId: string, notification: any) {
    // Get all subjects for users in this tenant
    // This would require tenant-user mapping
    this.logger.debug(`Sending notification to tenant ${tenantId}`);
    // Implementation depends on how you track tenant users
  }

  sendBroadcast(notification: any) {
    this.logger.debug('Broadcasting notification to all users');
    // Send to all subjects
    for (const subject of this.userSubjects.values()) {
      subject.next({
        type: 'broadcast',
        data: notification,
        timestamp: new Date(),
      });
    }
  }

  // Used by SSE controller to subscribe
  subscribeToUser(userId: string): Subject<any> {
    return this.getSubjectForUser(userId);
  }
}
