import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
  personId: { type: String, required: true, unique: true },
  personName: { type: String, required: true },
  // Array of company ownerships
  companies: [{
    companyId: { type: String, required: true },
    designation: { type: String },
    sharePercent: { type: Number }
  }]
}, { timestamps: true });

// Index for efficient lookups
personSchema.index({ 'companies.companyId': 1 });

export default mongoose.model("Person", personSchema);

