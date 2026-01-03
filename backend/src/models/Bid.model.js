import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  bidId: { type: String, unique: true },
  tenderId: { type: String, required: true, index: true },
  companyId: { type: String, required: true, index: true },
  bidAmount: { type: Number, required: true },
  bidDate: { type: Date, default: Date.now },
  ipAddress: { type: String, index: true }, // For IP collusion detection
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'winner'], default: 'pending' }
}, { timestamps: true });

// Compound index for efficient queries
bidSchema.index({ tenderId: 1, companyId: 1 });
bidSchema.index({ ipAddress: 1, tenderId: 1 });

export default mongoose.model("Bid", bidSchema);
