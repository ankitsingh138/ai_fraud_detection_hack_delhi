import mongoose from "mongoose";

const tenderSpecificationSchema = new mongoose.Schema({
  tenderId: { type: String, required: true, index: true },
  clauseId: { type: String, required: true },
  sectionType: { type: String, default: 'Technical Eligibility' },
  requirementText: { type: String, required: true },
  isMandatory: { type: Boolean, default: true },
  restrictiveness_score: { type: Number, default: null }
}, { timestamps: true });

// Compound index for efficient queries
tenderSpecificationSchema.index({ tenderId: 1, clauseId: 1 }, { unique: true });

export default mongoose.model("TenderSpecification", tenderSpecificationSchema);

