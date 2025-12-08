import mongoose, { Schema, Document, Model } from 'mongoose';
import { Follow as FollowType } from '@baaa-hub/shared-types';

/**
 * Follow document interface for Mongoose
 */
export interface FollowDocument extends Omit<FollowType, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * Follow model interface with static methods
 */
export interface IFollowModel extends Model<FollowDocument> {
  findByFollower(followerId: string): Promise<FollowDocument[]>;
  findByFollowing(followingId: string): Promise<FollowDocument[]>;
  findFollow(
    followerId: string,
    followingId: string,
  ): Promise<FollowDocument | null>;
  countFollowers(userId: string): Promise<number>;
  countFollowing(userId: string): Promise<number>;
}

/**
 * Mongoose schema for Follow
 */
const followSchema = new Schema<FollowDocument>(
  {
    followerId: {
      type: String,
      required: [true, 'Follower ID is required'],
      index: true,
    },
    followingId: {
      type: String,
      required: [true, 'Following ID is required'],
      index: true,
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

// Compound index to ensure uniqueness and optimize queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Static methods
followSchema.statics.findByFollower = function (
  followerId: string,
): Promise<FollowDocument[]> {
  return this.find({ followerId });
};

followSchema.statics.findByFollowing = function (
  followingId: string,
): Promise<FollowDocument[]> {
  return this.find({ followingId });
};

followSchema.statics.findFollow = function (
  followerId: string,
  followingId: string,
): Promise<FollowDocument | null> {
  return this.findOne({ followerId, followingId });
};

followSchema.statics.countFollowers = function (
  userId: string,
): Promise<number> {
  return this.countDocuments({ followingId: userId });
};

followSchema.statics.countFollowing = function (
  userId: string,
): Promise<number> {
  return this.countDocuments({ followerId: userId });
};

export const Follow = mongoose.model<FollowDocument, IFollowModel>(
  'Follow',
  followSchema,
);
