import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ssp-realty";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ssprealty.com";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const JWT_SECRET = process.env.JWT_SECRET || "ssp-realty-jwt-secret-key-change-in-production";

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

const leadSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  propertyType: String,
  budget: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

// Models
const Property = mongoose.model("Property", propertySchema);
const TeamMember = mongoose.model("TeamMember", teamSchema);
const Contact = mongoose.model("Contact", contactSchema);
const Lead = mongoose.model("Lead", leadSchema);

// JWT Middleware
const verifyToken = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🏠 SSP Realty Backend API v1.0" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "✓ Backend is running" });
});

// Auth Routes
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate credentials
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Hash password if not already hashed (first time setup)
    if (!ADMIN_PASSWORD_HASH) {
      // If no hash set, deny access and ask to set password
      return res.status(401).json({ error: "Admin password not configured. Please set ADMIN_PASSWORD_HASH in .env" });
    }

    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token (24 hour expiry)
    const token = jwt.sign(
      { email: ADMIN_EMAIL, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
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

app.post("/api/properties", verifyToken, async (req: Request, res: Response) => {
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

app.put("/api/properties/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    await Property.findOneAndUpdate({ id: req.params.id }, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update property" });
  }
});

app.delete("/api/properties/:id", verifyToken, async (req: Request, res: Response) => {
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

app.post("/api/team", verifyToken, async (req: Request, res: Response) => {
  try {
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.json({ success: true, data: teamMember });
  } catch (error) {
    res.status(500).json({ error: "Failed to create team member" });
  }
});

app.put("/api/team/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const updated = await TeamMember.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Team member not found" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update team member" });
  }
});

app.delete("/api/team/:id", verifyToken, async (req: Request, res: Response) => {
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

// Lead Routes (Visitor Lead Capture)
app.post("/api/leads", async (req: Request, res: Response) => {
  try {
    const lead = new Lead({
      ...req.body,
      id: Date.now().toString()
    });
    await lead.save();
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit lead form" });
  }
});

app.get("/api/leads", verifyToken, async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ created_at: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads" });
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
