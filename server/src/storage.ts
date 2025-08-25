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
  loginSchema
} from "../../shared/schema.js";

export const storage = {
  // ✅ Users
  async createUser(data: unknown) {
    const parsed = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(parsed).returning();
    return user;
  },

  async login(data: unknown) {
    const parsed = loginSchema.parse(data);
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
    return db.select().from(jobs);
  },
  async createJob(data: unknown) {
    const parsed = insertJobSchema.parse(data);
    const [job] = await db.insert(jobs).values(parsed).returning();
    return job;
  },

  // ✅ Courses
  async getCourses() {
    return db.select().from(courses);
  },
  async createCourse(data: unknown) {
    const parsed = insertCourseSchema.parse(data);
    const [course] = await db.insert(courses).values(parsed).returning();
    return course;
  },

  // ✅ Applications
  async getApplications() {
    return db.select().from(applications);
  },
  async createApplication(data: unknown) {
    const parsed = insertApplicationSchema.parse(data);
    const [application] = await db.insert(applications).values(parsed).returning();
    return application;
  },

  // ✅ Contacts
  async getContacts() {
    return db.select().from(contacts);
  },
  async createContact(data: unknown) {
    const parsed = insertContactSchema.parse(data);
    const [contact] = await db.insert(contacts).values(parsed).returning();
    return contact;
  },

  // ✅ Companies
  async getCompanies() {
    return db.select().from(companies);
  },
  async createCompany(data: unknown) {
    const parsed = insertCompanySchema.parse(data);
    const [company] = await db.insert(companies).values(parsed).returning();
    return company;
  },
};
