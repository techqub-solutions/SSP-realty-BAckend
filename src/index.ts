import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ssp-realty";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✓ Connected to MongoDB"))
  .catch((err) => console.error("✗ MongoDB connection failed:", err.message));

// Define Schemas
const propertySchema = new mongoose.Schema({
  id: String,
  title: String,
  location: String,
  price: String,
  beds: Number,
  baths: Number,
  sqft: Number,
  image: String,
  type: String,
  tag: String,
  description: String,
  amenities: [String],
  gallery: [String],
  phone: String,
  longDescription: String,
  pricingTiers: [{
    unitNumbers: String,
    price: String,
    furnishing: String
  }],
  constructionDetails: {
    brickType: String,
    cement: String,
    steel: String,
    electrical: String,
    paints: String
  },
  furnishedItems: [String],
  offers: [String],
  launchDate: String,
  possessionDate: String,
  totalUnits: Number,
  soldOut: Number,
  booked: Number,
  available: Number,
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  id: String,
  name: String,
  role: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

// Models
const Property = mongoose.model("Property", propertySchema);
const TeamMember = mongoose.model("TeamMember", teamSchema);
const Contact = mongoose.model("Contact", contactSchema);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🏠 SSP Realty Backend API v1.0" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "✓ Backend is running" });
});

// Properties Routes
app.get("/api/properties", async (req: Request, res: Response) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.post("/api/properties", async (req: Request, res: Response) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ error: "Failed to create property" });
  }
});

app.get("/api/properties/:id", async (req: Request, res: Response) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

app.put("/api/properties/:id", async (req: Request, res: Response) => {
  try {
    await Property.findOneAndUpdate({ id: req.params.id }, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update property" });
  }
});

app.delete("/api/properties/:id", async (req: Request, res: Response) => {
  try {
    await Property.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete property" });
  }
});

// Team Routes
app.get("/api/team", async (req: Request, res: Response) => {
  try {
    const team = await TeamMember.find();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

app.post("/api/team", async (req: Request, res: Response) => {
  try {
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.json({ success: true, data: teamMember });
  } catch (error) {
    res.status(500).json({ error: "Failed to create team member" });
  }
});

app.delete("/api/team/:id", async (req: Request, res: Response) => {
  try {
    await TeamMember.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

// Contact Routes
app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const contact = new Contact({
      ...req.body,
      id: Date.now().toString()
    });
    await contact.save();
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

app.get("/api/contact", async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ created_at: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Backend running on http://localhost:${PORT}`);
});

export default app;
