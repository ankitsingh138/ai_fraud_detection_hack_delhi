import Company from "../models/Company.model.js";
import Bid from "../models/Bid.model.js";
import { parseCSV } from "../utils/csvParser.js";

export const uploadCompanies = async (req, res) => {
  const data = await parseCSV(req.file.path);
  await Company.insertMany(data);
  res.json({ message: "Companies uploaded", count: data.length });
};

export const uploadBids = async (req, res) => {
  const data = await parseCSV(req.file.path);

  const cleaned = data.map(b => ({
    ...b,
    bidAmount: Number(b.bidAmount),
    bidDate: new Date(b.bidDate)
  }));

  await Bid.insertMany(cleaned);
  res.json({ message: "Bids uploaded", count: cleaned.length });
};
