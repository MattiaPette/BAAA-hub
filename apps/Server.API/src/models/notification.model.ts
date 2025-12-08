import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  Notification as NotificationType,
  NotificationType as NotificationTypeEnum,
} from '@baaa-hub/shared-types';

/**
 * Notification document interface for Mongoose
 */
export interface NotificationDocument
  extends Omit<NotificationType, 'id'>,
    Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * Notification model interface with static methods
 */
export interface INotificationModel extends Model<NotificationDocument> {
  findByUser(userId: string): Promise<NotificationDocument[]>;
  countUnreadByUser(userId: string): Promise<number>;
}

/**
 * Mongoose schema for Notification
 */
const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: Object.values(NotificationTypeEnum),
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, 'Notification data is required'],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const id = String(ret._id);
        const result = Object.fromEntries(
          Object.entries(ret).filter(([key]) => key !== '_id' && key !== '__v'),
        );
        return { ...result, id };
      },
    },
  },
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Static methods
notificationSchema.statics.findByUser = function (
  userId: string,
): Promise<NotificationDocument[]> {
  return this.find({ userId }).sort({ createdAt: -1 });
};

notificationSchema.statics.countUnreadByUser = function (
  userId: string,
): Promise<number> {
  return this.countDocuments({ userId, isRead: false });
};

export const Notification = mongoose.model<
  NotificationDocument,
  INotificationModel
>('Notification', notificationSchema);
