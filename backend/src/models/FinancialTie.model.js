import mongoose from "mongoose";

const financialTieSchema = new mongoose.Schema({
  entityId: { type: String, required: true, unique: true },
  entityType: { type: String, enum: ['company', 'person'], default: 'company' },
  bankAccHash: { type: String },
  taxIdHash: { type: String },
  notaryId: { type: String },
  emdAccountHash: { type: String }
}, { timestamps: true });

// Indexes for collusion detection queries
financialTieSchema.index({ bankAccHash: 1 });
financialTieSchema.index({ notaryId: 1 });
financialTieSchema.index({ emdAccountHash: 1 });

export default mongoose.model("FinancialTie", financialTieSchema);

