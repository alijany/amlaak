# Notification Module

The Notification Module is a comprehensive, multi-channel notification system for the platform. It supports various notification types including SMS, Email, Telegram Bot messages, and push notifications with a flexible, extensible architecture.

## Overview

This module provides a unified interface for sending notifications across multiple channels with features like:
- Multi-channel delivery (SMS, Email, Telegram, Push notifications)
- Automatic channel detection based on user preferences
- Priority-based delivery
- Template support
- Status tracking and error handling
- Event-driven architecture

## Architecture

The module follows clean architecture principles with distinct layers:

### Core Components

1. **NotificationService** - Main service providing high-level notification interface
2. **NotificationDispatcherService** - Routes notifications based on request types
3. **NotificationDeliveryService** - Handles actual delivery through channels
4. **NotificationRepository** - Database operations for notifications
5. **UserResolverService** - Resolves user data and available channels

### Channel System

The module uses the Strategy pattern for different notification channels:

- **SmsNotificationChannel** - SMS delivery
- **EmailNotificationChannel** - Email delivery  
- **TelegramNotificationChannel** - Telegram bot messages
- **AppPushNotificationChannel** - Mobile push notifications

Each channel extends `BaseNotificationChannel` and implements `INotificationChannel`.

## Installation & Setup

### Module Import

```typescript
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    // other modules...
  ],
})
export class AppModule {}
```

### Dependencies

The module requires:
- `SmsModule` - For SMS functionality
- `RolesModule` - For user role management
- `MikroORM` - For database operations
- `UserModule` - For user management

## Usage

### Basic Notification Sending

```typescript
import { NotificationService } from './notification/services/notification.service';

@Injectable()
export class MyService {
  constructor(private notificationService: NotificationService) {}

  async sendUserNotification() {
    // Send to specific user with auto-channel detection
    await this.notificationService.sendToUser(
      userId, 
      'Your donation has been confirmed!',
      {
        priority: 'high',
        metadata: { donationId: 123 }
      }
    );

    // Send to admin users
    await this.notificationService.sendToAdmins(
      'New donation received',
      { priority: 'normal' }
    );

    // Send to specific channels
    await this.notificationService.sendToChannels(
      'Custom message',
      [
        { type: 'sms', recipientPhone: '+1234567890' },
        { type: 'telegram_bot', recipientChatId: 123456 }
      ]
    );
  }
}
```

### Advanced Request Types

#### Direct Channel Notification
```typescript
const directRequest: DirectNotificationRequest = {
  message: 'Your payment was successful',
  channels: [
    { 
      type: NotificationType.SMS, 
      recipientPhone: '+1234567890',
      message: 'Payment confirmed - Donation #123' // SMS-specific shorter message
    },
    { 
      type: NotificationType.TELEGRAM_BOT, 
      recipientChatId: 123456 
    }
  ],
  priority: 'high',
  metadata: { donationId: 123, paymentId: 'pay_456' }
};

await notificationService.sendNotification(directRequest);
```

#### User Notification with Preferences
```typescript
const userRequest: UserNotificationRequest = {
  userId: 123,
  message: 'Your travel inquiry has been updated',
  autoDetectChannels: true,
  preferredChannels: [NotificationType.TELEGRAM_BOT, NotificationType.SMS],
  smsMessage: 'Travel inquiry updated - Check app for details',
  priority: 'normal'
};

await notificationService.sendNotification(userRequest);
```

#### Admin Notification
```typescript
const adminRequest: AdminNotificationRequest = {
  sendToAdmins: true,
  message: 'System maintenance scheduled for tonight',
  priority: 'low',
  metadata: { 
    maintenanceWindow: '2024-01-15 02:00-04:00',
    affectedServices: ['api', 'web'] 
  }
};

await notificationService.sendNotification(adminRequest);
```

### Event-Driven Usage

The service listens for notification events:

```typescript
// Emit notification event
this.eventEmitter.emit(EventTypes.SEND_NOTIFICATION, {
  message: 'New lead assigned',
  userId: agencyUserId,
  autoDetectChannels: true,
  priority: 'high'
});
```

### Template-Based Notifications

The module supports template-based notifications for common use cases:

```typescript
const templateRequest: TemplateNotificationRequest = {
  template: NotificationTemplate.LEAD_ASSIGNED,
  templateData: {
    leadId: 123,
    agencyName: 'Travel Pro',
    customerName: 'John Doe'
  },
  userId: agencyUserId,
  priority: 'high'
};

await notificationService.sendNotification(templateRequest);
```

### Batch Notifications

Send multiple notifications efficiently:

```typescript
const batchRequest: BatchNotificationRequest = {
  notifications: [
    {
      userId: 1,
      message: 'Your donation #123 is ready',
      autoDetectChannels: true
    },
    {
      userId: 2, 
      message: 'Your donation #124 is ready',
      autoDetectChannels: true
    }
  ],
  priority: 'normal'
};

await notificationService.sendBatch(batchRequest);
```

## Configuration

### Environment Variables

The module uses these environment variables:
- SMS service configuration (through SmsModule)
- Telegram bot tokens
- Email service settings
- Push notification credentials

### Channel Priority

Channels can be prioritized when multiple channels handle the same notification type:

```typescript
@Injectable()
export class MyCustomChannel extends BaseNotificationChannel {
  getPriority(): number {
    return 5; // Higher priority than default (1)
  }
}
```

## Database Schema

### NotificationEntity

```typescript
{
  id: number;
  user?: UserEntity;           // Optional user reference
  recipientPhone?: string;     // Direct phone number
  recipientChatId?: number;    // Direct chat ID
  type: NotificationType;      // Channel type
  message: string;             // Message content
  metadata: object;            // Additional data
  status: NotificationStatus;  // Delivery status
  priority: string;            // Priority level
  sentAt?: Date;              // Delivery timestamp
  errorMessage?: string;       // Error details if failed
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Types

```typescript
enum NotificationType {
  SMS = 'sms',
  EMAIL = 'email', 
  APP_PUSH = 'app_push',
  TELEGRAM_BOT = 'telegram_bot',
  SYSTEM = 'system'
}
```

### Notification Status

```typescript
enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered', 
  FAILED = 'failed',
  CANCELED = 'canceled'
}
```

## API Endpoints

### GET /notifications
Retrieve notifications with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 0)
- `limit` (number): Items per page (default: 10)
- `text` (string): Filter by message content
- `status` (NotificationStatus): Filter by status
- `type` (NotificationType): Filter by type

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "sms",
      "message": "Your donation is ready!",
      "status": "sent",
      "priority": "high",
      "sentAt": "2024-01-15T10:30:00Z",
      "metadata": { "donationId": 123 }
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Adding New Channels

To add a new notification channel:

1. **Create Channel Class**
```typescript
@Injectable()
export class SlackNotificationChannel extends BaseNotificationChannel {
  readonly type = NotificationType.SLACK;
  
  canHandle(notification: NotificationEntity): boolean {
    return notification.type === NotificationType.SLACK && 
           !!notification.metadata.slackChannel;
  }
  
  async send(notification: NotificationEntity): Promise<void> {
    // Implement Slack API call
    await this.slackService.sendMessage(
      notification.metadata.slackChannel,
      notification.message
    );
  }
}
```

2. **Register in Module**
```typescript
@Module({
  providers: [
    // existing providers...
    SlackNotificationChannel,
  ],
})
export class NotificationModule {}
```

3. **Update Factory**
```typescript
// The factory will automatically pick up the new channel
```

## Error Handling

The module provides comprehensive error handling:

- **Channel Failures**: Failed channels don't affect other channels
- **Automatic Retries**: Can be configured per channel
- **Error Logging**: All failures are logged with context
- **Status Tracking**: Database tracks delivery status and errors

```typescript
try {
  await notificationService.sendToUser(userId, message);
} catch (error) {
  // Handle notification failure
  console.error('Notification failed:', error);
}
```

## Testing

### Unit Tests
Test individual components:

```typescript
describe('NotificationService', () => {
  it('should send notification to user', async () => {
    const result = await notificationService.sendToUser(
      1, 
      'Test message'
    );
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
Test full notification flow:

```typescript
describe('Notification Integration', () => {
  it('should deliver SMS notification', async () => {
    const notification = await notificationService.sendToChannels(
      'Test SMS',
      [{ type: 'sms', recipientPhone: '+1234567890' }]
    );
    
    // Verify notification was created and sent
    expect(notification[0].status).toBe(NotificationStatus.SENT);
  });
});
```

## Performance Considerations

- **Async Processing**: All deliveries are async
- **Batch Operations**: Multiple notifications can be sent in batches
- **Channel Failover**: Failed channels don't block others
- **Database Indexing**: Proper indexes on status, type, and user fields

## Monitoring & Metrics

The module supports monitoring through:
- Notification status tracking
- Delivery success/failure rates
- Channel performance metrics
- Error rate monitoring

## Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Check SMS service configuration
   - Verify phone number format
   - Check SMS service credits

2. **Telegram Messages Failing**
   - Verify bot token
   - Check user has started the bot
   - Validate chat ID format

3. **User Not Found Errors**
   - Ensure user exists in database
   - Check user ID is correct
   - Verify user has required channel data

### Debug Mode

Enable debug logging:
```typescript
// Set LOG_LEVEL=debug in environment
```

## Contributing

When contributing to the notification module:

1. Follow the existing patterns for channels
2. Add comprehensive tests for new features
3. Update this documentation
4. Consider backward compatibility
5. Test with all existing channels

## Related Modules

- **SmsModule**: SMS delivery functionality
- **UserModule**: User data and preferences
- **RolesModule**: User role management
- **EventsModule**: Event-driven notifications

## Support

For issues or questions about the notification module:
- Check the troubleshooting section
- Review the test cases for examples
- Consult the related modules documentation
- Contact the development team
