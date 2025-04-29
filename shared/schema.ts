import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  profileComplete: boolean("profile_complete").default(false),
  skills: jsonb("skills").$type<string[]>(),
  interests: jsonb("interests").$type<string[]>(),
  educationLevel: text("education_level"),
  experience: text("experience"),
  targetCareer: text("target_career"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export const careers = pgTable("careers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  careerTitle: text("career_title").notNull(),
  description: text("description"),
  salaryRange: text("salary_range"),
  growthRate: text("growth_rate"),
  fitScore: integer("fit_score"),
  requiredSkills: jsonb("required_skills").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow()
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(),
  proficiency: integer("proficiency"),
  isMissing: boolean("is_missing").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalContent: text("original_content"),
  optimizedContent: text("optimized_content"),
  status: text("status").default("pending"),
  aiSuggestions: jsonb("ai_suggestions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow()
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jobTitle: text("job_title").notNull(),
  company: text("company"),
  description: text("description"),
  matchPercentage: integer("match_percentage"),
  matchTier: text("match_tier"),
  salary: text("salary"),
  location: text("location"),
  url: text("url"),
  matchReasons: jsonb("match_reasons").$type<string[]>(),
  requiredSkills: jsonb("required_skills").$type<string[]>(),
  userSkillMatch: jsonb("user_skill_match").$type<string[]>(),
  skillGaps: jsonb("skill_gaps").$type<string[]>(),
  skillMatchCount: integer("skill_match_count"),
  skillGapCount: integer("skill_gap_count"),
  growthPotential: text("growth_potential"),
  industryTrends: text("industry_trends"),
  remoteType: text("remote_type"),
  developmentPlan: jsonb("development_plan").$type<{
    prioritySkills: string[],
    certifications: string[],
    experienceBuilding: string[]
  }>(),
  careerProgression: jsonb("career_progression").$type<{
    nextRoles: string[],
    timelineEstimate: string
  }>(),
  applicationStatus: text("application_status").default("Not Applied"),
  isSaved: boolean("is_saved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  courseTitle: text("course_title").notNull(),
  platform: text("platform"),
  cost: text("cost"),
  duration: text("duration"),
  url: text("url"),
  status: text("status").default("not_started"),
  createdAt: timestamp("created_at").defaultNow()
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").default("New Chat"),
  messages: jsonb("messages").$type<{ 
    role: string; 
    content: string; 
    timestamp: string;
    aiProvider?: string;
  }[]>(),
  chatMode: text("chat_mode").default("standard"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true
});

export const insertCareerSchema = createInsertSchema(careers).omit({
  id: true,
  createdAt: true
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careers.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;
