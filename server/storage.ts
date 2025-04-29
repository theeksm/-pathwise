import { 
  users, type User, type InsertUser,
  careers, type Career, type InsertCareer,
  skills, type Skill, type InsertSkill,
  resumes, type Resume, type InsertResume,
  jobs, type Job, type InsertJob,
  learningPaths, type LearningPath, type InsertLearningPath,
  chats, type Chat, type InsertChat
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Career operations
  getCareersByUserId(userId: number): Promise<Career[]>;
  createCareer(career: InsertCareer): Promise<Career>;
  
  // Skills operations
  getSkillsByUserId(userId: number): Promise<Skill[]>;
  getSkillsByCategory(userId: number, category: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Resume operations
  getResumesByUserId(userId: number): Promise<Resume[]>;
  getResumeById(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Job operations
  getJobsByUserId(userId: number): Promise<Job[]>;
  getSavedJobsByUserId(userId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  
  // Learning path operations
  getLearningPathsByUserId(userId: number): Promise<LearningPath[]>;
  getLearningPathById(id: number): Promise<LearningPath | undefined>;
  createLearningPath(learningPath: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: number, learningPath: Partial<LearningPath>): Promise<LearningPath | undefined>;
  
  // Chat operations
  getChatsByUserId(userId: number): Promise<Chat[]>;
  getChatById(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: number, chat: Partial<Chat>): Promise<Chat | undefined>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private careersData: Map<number, Career>;
  private skillsData: Map<number, Skill>;
  private resumesData: Map<number, Resume>;
  private jobsData: Map<number, Job>;
  private learningPathsData: Map<number, LearningPath>;
  private chatsData: Map<number, Chat>;
  
  private currentUserId: number;
  private currentCareerId: number;
  private currentSkillId: number;
  private currentResumeId: number;
  private currentJobId: number;
  private currentLearningPathId: number;
  private currentChatId: number;

  constructor() {
    this.usersData = new Map();
    this.careersData = new Map();
    this.skillsData = new Map();
    this.resumesData = new Map();
    this.jobsData = new Map();
    this.learningPathsData = new Map();
    this.chatsData = new Map();
    
    this.currentUserId = 1;
    this.currentCareerId = 1;
    this.currentSkillId = 1;
    this.currentResumeId = 1;
    this.currentJobId = 1;
    this.currentLearningPathId = 1;
    this.currentChatId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      profileComplete: false,
      skills: [],
      interests: [],
      educationLevel: null,
      experience: null,
      targetCareer: null,
      resumeUrl: null,
      createdAt: now
    };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  // Career operations
  async getCareersByUserId(userId: number): Promise<Career[]> {
    return Array.from(this.careersData.values()).filter(
      (career) => career.userId === userId,
    );
  }
  
  async createCareer(insertCareer: InsertCareer): Promise<Career> {
    const id = this.currentCareerId++;
    const now = new Date();
    const career: Career = { ...insertCareer, id, createdAt: now };
    this.careersData.set(id, career);
    return career;
  }
  
  // Skills operations
  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    return Array.from(this.skillsData.values()).filter(
      (skill) => skill.userId === userId,
    );
  }
  
  async getSkillsByCategory(userId: number, category: string): Promise<Skill[]> {
    return Array.from(this.skillsData.values()).filter(
      (skill) => skill.userId === userId && skill.category === category,
    );
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const now = new Date();
    const skill: Skill = { ...insertSkill, id, createdAt: now };
    this.skillsData.set(id, skill);
    return skill;
  }
  
  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skillsData.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skillsData.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skillsData.delete(id);
  }
  
  // Resume operations
  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumesData.values()).filter(
      (resume) => resume.userId === userId,
    );
  }
  
  async getResumeById(id: number): Promise<Resume | undefined> {
    return this.resumesData.get(id);
  }
  
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const now = new Date();
    const resume: Resume = { ...insertResume, id, createdAt: now };
    this.resumesData.set(id, resume);
    return resume;
  }
  
  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumesData.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumesData.set(id, updatedResume);
    return updatedResume;
  }
  
  // Job operations
  async getJobsByUserId(userId: number): Promise<Job[]> {
    return Array.from(this.jobsData.values()).filter(
      (job) => job.userId === userId,
    );
  }
  
  async getSavedJobsByUserId(userId: number): Promise<Job[]> {
    return Array.from(this.jobsData.values()).filter(
      (job) => job.userId === userId && job.isSaved,
    );
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const now = new Date();
    const job: Job = { ...insertJob, id, createdAt: now };
    this.jobsData.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobsData.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...jobData };
    this.jobsData.set(id, updatedJob);
    return updatedJob;
  }
  
  // Learning path operations
  async getLearningPathsByUserId(userId: number): Promise<LearningPath[]> {
    return Array.from(this.learningPathsData.values()).filter(
      (learningPath) => learningPath.userId === userId,
    );
  }
  
  async getLearningPathById(id: number): Promise<LearningPath | undefined> {
    return this.learningPathsData.get(id);
  }
  
  async createLearningPath(insertLearningPath: InsertLearningPath): Promise<LearningPath> {
    const id = this.currentLearningPathId++;
    const now = new Date();
    const learningPath: LearningPath = { ...insertLearningPath, id, createdAt: now };
    this.learningPathsData.set(id, learningPath);
    return learningPath;
  }
  
  async updateLearningPath(id: number, learningPathData: Partial<LearningPath>): Promise<LearningPath | undefined> {
    const learningPath = this.learningPathsData.get(id);
    if (!learningPath) return undefined;
    
    const updatedLearningPath = { ...learningPath, ...learningPathData };
    this.learningPathsData.set(id, updatedLearningPath);
    return updatedLearningPath;
  }
  
  // Chat operations
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chatsData.values()).filter(
      (chat) => chat.userId === userId,
    );
  }
  
  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chatsData.get(id);
  }
  
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const now = new Date();
    const chat: Chat = { 
      ...insertChat, 
      id, 
      createdAt: now,
      title: insertChat.title || "New Chat",
      chatMode: insertChat.chatMode || "standard",
      messages: insertChat.messages || [] // Ensure messages is always initialized
    };
    console.log("Storage: Creating chat with data:", JSON.stringify(chat));
    this.chatsData.set(id, chat);
    return chat;
  }
  
  async updateChat(id: number, chatData: Partial<Chat>): Promise<Chat | undefined> {
    console.log(`Storage: Updating chat ${id} with data:`, JSON.stringify(chatData));
    const chat = this.chatsData.get(id);
    if (!chat) {
      console.log(`Storage: Chat ${id} not found in storage`);
      return undefined;
    }
    
    const updatedChat = { ...chat, ...chatData };
    console.log(`Storage: Updated chat data:`, JSON.stringify(updatedChat));
    this.chatsData.set(id, updatedChat);
    return updatedChat;
  }
}

export const storage = new MemStorage();
