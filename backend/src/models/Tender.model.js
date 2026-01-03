import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema({
  tenderId: { type: String, required: true, unique: true },
  deptName: { type: String, required: true },
  year: { type: Number, required: true },
  tenderNum: { type: Number },
  title: { type: String },
  location: { type: String, required: true },
  pincode: { type: String, required: true },
  estValueInCr: { type: Number, required: true },
  publishDate: { type: Date, required: true },
  closingDate: { type: Date },
  status: { type: String, enum: ['active', 'closed', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

export default mongoose.model("Tender", tenderSchema);

