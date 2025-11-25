import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a Book document in MongoDB
 */
export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MongoDB schema for Book
 */
const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
        'Please provide a valid ISBN',
      ],
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1000, 'Year must be after 1000'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Create indexes for efficient querying
 */
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ available: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
