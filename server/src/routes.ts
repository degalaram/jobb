import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import {
  insertUserSchema,
  insertJobSchema,
  insertCourseSchema,
  insertApplicationSchema,
  insertContactSchema,
  insertCompanySchema,
  loginSchema
} from "../../shared/schema.js";
import path from "path";
import fs from "fs";
import { marked } from "marked";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Add missing authentication endpoints for client compatibility
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsed);
      res.status(201).json({ success: true, user, message: "Account created successfully!" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const user = await storage.login(parsed);
      res.json({ success: true, user, token: "sample-jwt-token", message: "Login successful!" });
    } catch (err) {
      next(err);
    }
  });
  // ✅ Root endpoint
  app.get("/", (_req, res) => {
    res.json({ message: "API is running 🚀" });
  });

  // ✅ Users
  app.post("/api/users", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsed);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const user = await storage.login(parsed);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Jobs
  app.get("/api/jobs", async (_req, res, next) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/jobs", async (req, res, next) => {
    try {
      const parsed = insertJobSchema.parse(req.body);
      const job = await storage.createJob(parsed);
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Courses
  app.get("/api/courses", async (_req, res, next) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/courses", async (req, res, next) => {
    try {
      const parsed = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(parsed);
      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Applications
  app.get("/api/applications", async (_req, res, next) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/applications", async (req, res, next) => {
    try {
      const parsed = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(parsed);
      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Contacts
  app.get("/api/contacts", async (_req, res, next) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/contacts", async (req, res, next) => {
    try {
      const parsed = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(parsed);
      res.status(201).json(contact);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Companies
  app.get("/api/companies", async (_req, res, next) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/companies", async (req, res, next) => {
    try {
      const parsed = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(parsed);
      res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  });

  // ✅ Markdown docs
  app.get("/api/docs/:name", async (req, res, next) => {
    try {
      const filePath = path.join(__dirname, "..", "docs", `${req.params.name}.md`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Doc not found" });
      }
      const content = fs.readFileSync(filePath, "utf-8");
      const html = marked(content);
      res.send(html);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
