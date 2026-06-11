import mongoose from 'mongoose';

const WardSchema = new mongoose.Schema(
  {
    wardName: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
    },
    wardNumber: {
      type: Number,
      required: [true, 'Ward number is required'],
      unique: true,
    },
    city: {
      type: String,
      default: 'Vadodara',
      trim: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Ward', WardSchema);