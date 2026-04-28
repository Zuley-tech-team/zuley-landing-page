import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    inquiry_type: {
      type: String,
      required: true,
      enum: [
        'general',
        'product',
        'order',
        'personalization',
        'corporate',
        'complaint',
        'other',
      ],
      default: 'general',
    },
    order_id: { type: String, trim: true },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    source_page: { type: String, trim: true, default: 'contact' },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export type IContactInquiry = mongoose.InferSchemaType<typeof contactInquirySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema);
