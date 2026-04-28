import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
      index: true,
    },
    subscribed_at: { type: Date, default: Date.now },
    unsubscribed_at: { type: Date },
    source: { type: String, trim: true, default: 'footer' },
  },
  { timestamps: true }
);

export type INewsletterSubscriber = mongoose.InferSchemaType<typeof newsletterSubscriberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
