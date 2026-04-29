import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 120 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    quote: { type: String, required: true, trim: true, maxlength: 1000 },
    is_featured: { type: Boolean, default: false, index: true },
    is_active: { type: Boolean, default: true, index: true },
    source: { type: String, trim: true, default: 'manual' },
    display_order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export type ITestimonial = mongoose.InferSchemaType<typeof testimonialSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
