import { eq, and } from "drizzle-orm";
import { db } from "./db.js";
import {
  users,
  jobs,
  courses,
  applications,
  contacts,
  companies,
  insertUserSchema,
  insertJobSchema,
  insertCourseSchema,
  insertApplicationSchema,
  insertContactSchema,
  insertCompanySchema,
  loginSchema,
  type InsertUser,
  type InsertJob,
  type InsertCourse,
  type InsertApplication,
  type InsertContact,
  type InsertCompany,
  type LoginData
} from "../../shared/schema.js";

export const storage = {
  // ✅ Users
  async createUser(data: unknown) {
    const parsed: InsertUser = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(parsed).returning();
    return user;
  },

  async login(data: unknown) {
    const parsed: LoginData = loginSchema.parse(data);
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.email, parsed.email),
        eq(users.password, parsed.password)
      ))
      .limit(1);
    if (!user) throw new Error("Invalid credentials");
    return user;
  },

  // ✅ Jobs
  async getJobs() {
    return db.select({
      id: jobs.id,
      companyId: jobs.companyId,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      qualifications: jobs.qualifications,
      skills: jobs.skills,
      experienceLevel: jobs.experienceLevel,
      experienceMin: jobs.experienceMin,
      experienceMax: jobs.experienceMax,
      location: jobs.location,
      jobType: jobs.jobType,
      salary: jobs.salary,
      applyUrl: jobs.applyUrl,
      closingDate: jobs.closingDate,
      batchEligible: jobs.batchEligible,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      company: {
        id: companies.id,
        name: companies.name,
        description: companies.description,
        website: companies.website,
        linkedinUrl: companies.linkedinUrl,
        logo: companies.logo,
        location: companies.location,
        createdAt: companies.createdAt,
      }
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id));
  },
  async createJob(data: unknown) {
    const parsed: InsertJob = insertJobSchema.parse(data);
    const [job] = await db.insert(jobs).values(parsed).returning();
    return job;
  },

  // ✅ Courses
  async getCourses() {
    return db.select().from(courses);
  },
  async createCourse(data: unknown) {
    const parsed: InsertCourse = insertCourseSchema.parse(data);
    const [course] = await db.insert(courses).values(parsed).returning();
    return course;
  },

  // ✅ Applications
  async getApplications() {
    return db.select().from(applications);
  },
  async createApplication(data: unknown) {
    const parsed: InsertApplication = insertApplicationSchema.parse(data);
    const [application] = await db.insert(applications).values(parsed).returning();
    return application;
  },

  // ✅ Contacts
  async getContacts() {
    return db.select().from(contacts);
  },
  async createContact(data: unknown) {
    const parsed: InsertContact = insertContactSchema.parse(data);
    const [contact] = await db.insert(contacts).values(parsed).returning();
    return contact;
  },

  // ✅ Companies
  async getCompanies() {
    return db.select().from(companies);
  },
  async createCompany(data: unknown) {
    const parsed: InsertCompany = insertCompanySchema.parse(data);
    const [company] = await db.insert(companies).values(parsed).returning();
    return company;
  },
};
