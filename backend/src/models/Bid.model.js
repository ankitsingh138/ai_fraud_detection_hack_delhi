import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  tenderId: String,
  companyId: String,
  bidAmount: Number,
  bidDate: Date
}, { timestamps: true });

export default mongoose.model("Bid", bidSchema);
