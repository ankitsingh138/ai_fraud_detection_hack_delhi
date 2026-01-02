import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyId: String,
  name: String,
  address: String,
  director: String
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
