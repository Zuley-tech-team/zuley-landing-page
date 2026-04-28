import mongoose from 'mongoose';

const corporateLeadSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    contact_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    product_type: {
      type: String,
      required: true,
      enum: ['silver-pens', 'silver-phone-covers', 'mixed'],
      default: 'mixed',
    },
    expected_timeline: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
      index: true,
    },
    source_page: { type: String, trim: true, default: 'corporate' },
  },
  { timestamps: true }
);

export type ICorporateLead = mongoose.InferSchemaType<typeof corporateLeadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CorporateLead = mongoose.model('CorporateLead', corporateLeadSchema);
