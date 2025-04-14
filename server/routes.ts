import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
// Using imported zValidator has naming conflicts with our local function
// import { zValidator } from "./lib/zValidator";
import { 
  insertUserSchema, 
  insertCareerSchema,
  insertSkillSchema,
  insertResumeSchema,
  insertJobSchema,
  insertLearningPathSchema,
  insertChatSchema
} from "@shared/schema";
import { generateCareerRecommendations, analyzeSkillGap, optimizeResume, matchJobs, generateChatResponse } from "./lib/openai";
import { getStockData, StockAPIError, StockAPIErrorType } from "./lib/stockAPI";
import { generateContent } from "./lib/generateContent";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Type alias for JobMatch from OpenAI responses
type JobMatch = {
  title: string;
  company: string;
  description: string;
  matchPercentage: number;
  matchTier?: string;
  salary: string;
  location: string;
  url?: string;
  matchReasons?: string[];
  requiredSkills?: string[];
  userSkillMatch?: string[];
  skillGaps?: string[];
  skillMatchCount?: number;
  skillGapCount?: number;
  growthPotential?: string;
  industryTrends?: string;
  remoteType?: 'remote' | 'hybrid' | 'on-site';
  applicationStatus?: string;
  developmentPlan?: {
    prioritySkills: string[];
    certifications: string[];
    experienceBuilding: string[];
  };
  careerProgression?: {
    nextRoles: string[];
    timelineEstimate: string;
  };
};

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: 'lax'
      },
      secret: process.env.SESSION_SECRET || "pathwise-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Set up passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy({ 
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: false
    }, async (username, password, done) => {
      try {
        console.log(`Attempting login for user: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Incorrect username" });
        }
        
        // Simple password comparison (for development only)
        if (user.password !== password) {
          console.log(`Password mismatch for user: ${username}`);
          return done(null, false, { message: "Incorrect password" });
        }
        
        console.log(`Successful login for user: ${username} (id: ${user.id})`);
        return done(null, user);
      } catch (err) {
        console.error("Authentication error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", routeZValidator("body", insertUserSchema), async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(req.body);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login", error: err });
        }
        return res.status(201).json({ id: user.id, username: user.username, email: user.email });
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username, email: user.email });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username, email: user.email });
  });

  // User routes
  app.get("/api/user", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userData = await storage.getUser(user.id);
    res.json(userData);
  });

  app.patch("/api/user", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const updateSchema = z.object({
      fullName: z.string().optional(),
      skills: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      educationLevel: z.string().optional(),
      experience: z.string().optional(),
      targetCareer: z.string().optional(),
      resumeUrl: z.string().optional(),
      profileComplete: z.boolean().optional()
    });
    
    try {
      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(user.id, validatedData);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Career routes
  app.get("/api/careers", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const careers = await storage.getCareersByUserId(user.id);
    res.json(careers);
  });

  app.post("/api/careers/generate", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const inputSchema = z.object({
      skills: z.array(z.string()),
      interests: z.array(z.string()),
      educationLevel: z.string(),
      experience: z.string()
    });
    
    try {
      const validatedData = inputSchema.parse(req.body);
      const recommendations = await generateCareerRecommendations(
        validatedData.skills,
        validatedData.interests,
        validatedData.educationLevel,
        validatedData.experience
      );
      
      const savedCareers = [];
      for (const career of recommendations) {
        const savedCareer = await storage.createCareer({
          userId: user.id,
          careerTitle: career.title,
          description: career.description,
          salaryRange: career.salaryRange,
          growthRate: career.growthRate,
          fitScore: career.fitScore,
          requiredSkills: career.requiredSkills
        });
        savedCareers.push(savedCareer);
      }
      
      res.json(savedCareers);
    } catch (error) {
      console.error("Error generating career recommendations:", error);
      res.status(500).json({ message: "Error generating career recommendations", error });
    }
  });

  // Skills routes
  app.get("/api/skills", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const category = req.query.category as string | undefined;
    
    if (category) {
      const skills = await storage.getSkillsByCategory(user.id, category);
      return res.json(skills);
    }
    
    const skills = await storage.getSkillsByUserId(user.id);
    res.json(skills);
  });

  app.post("/api/skills", isAuthenticated, routeZValidator("body", insertSkillSchema), async (req, res) => {
    try {
      const skill = await storage.createSkill(req.body);
      res.status(201).json(skill);
    } catch (error) {
      res.status(500).json({ message: "Error creating skill", error });
    }
  });

  app.patch("/api/skills/:id", isAuthenticated, async (req, res) => {
    const skillId = parseInt(req.params.id);
    const updateSchema = z.object({
      skillName: z.string().optional(),
      category: z.string().optional(),
      proficiency: z.number().optional(),
      isMissing: z.boolean().optional()
    });
    
    try {
      const validatedData = updateSchema.parse(req.body);
      const updatedSkill = await storage.updateSkill(skillId, validatedData);
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  app.delete("/api/skills/:id", isAuthenticated, async (req, res) => {
    const skillId = parseInt(req.params.id);
    const deleted = await storage.deleteSkill(skillId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.json({ success: true });
  });

  app.post("/api/skills/analyze-gap", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const inputSchema = z.object({
      currentSkills: z.array(z.string()),
      targetCareer: z.string()
    });
    
    try {
      const validatedData = inputSchema.parse(req.body);
      const gapAnalysis = await analyzeSkillGap(
        validatedData.currentSkills,
        validatedData.targetCareer
      );
      
      // Save missing skills to the database
      for (const missingSkill of gapAnalysis.missingSkills) {
        await storage.createSkill({
          userId: user.id,
          skillName: missingSkill.name,
          category: missingSkill.category,
          isMissing: true
        });
      }
      
      // Create learning paths for recommended courses
      const learningPaths = [];
      for (const course of gapAnalysis.recommendedCourses) {
        // First find or create the skill
        let skill = (await storage.getSkillsByUserId(user.id))
          .find(s => s.skillName.toLowerCase() === course.skillName.toLowerCase());
        
        if (!skill) {
          skill = await storage.createSkill({
            userId: user.id,
            skillName: course.skillName,
            category: course.category || "Unknown",
            isMissing: true
          });
        }
        
        const learningPath = await storage.createLearningPath({
          userId: user.id,
          skillId: skill.id,
          courseTitle: course.title,
          platform: course.platform,
          cost: course.cost,
          duration: course.duration,
          url: course.url,
          status: "not_started"
        });
        
        learningPaths.push(learningPath);
      }
      
      res.json({
        analysis: gapAnalysis,
        learningPaths
      });
    } catch (error) {
      console.error("Error analyzing skill gap:", error);
      res.status(500).json({ message: "Error analyzing skill gap", error });
    }
  });

  // Resume routes
  app.get("/api/resumes", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const resumes = await storage.getResumesByUserId(user.id);
    res.json(resumes);
  });

  app.get("/api/resumes/:id", isAuthenticated, async (req, res) => {
    const resumeId = parseInt(req.params.id);
    const resume = await storage.getResumeById(resumeId);
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    res.json(resume);
  });

  app.post("/api/resumes", isAuthenticated, routeZValidator("body", insertResumeSchema), async (req, res) => {
    try {
      const resume = await storage.createResume(req.body);
      res.status(201).json(resume);
    } catch (error) {
      res.status(500).json({ message: "Error creating resume", error });
    }
  });

  app.post("/api/resumes/optimize", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const inputSchema = z.object({
      resumeContent: z.string(),
      targetPosition: z.string().optional()
    });
    
    try {
      const validatedData = inputSchema.parse(req.body);
      const optimizedResume = await optimizeResume(
        validatedData.resumeContent,
        validatedData.targetPosition
      );
      
      const resume = await storage.createResume({
        userId: user.id,
        originalContent: validatedData.resumeContent,
        optimizedContent: optimizedResume.optimizedContent,
        aiSuggestions: optimizedResume.improvements,
        status: "completed"
      });
      
      res.json(resume);
    } catch (error) {
      console.error("Error optimizing resume:", error);
      res.status(500).json({ message: "Error optimizing resume", error });
    }
  });

  // Job routes
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const savedOnly = req.query.saved === "true";
    
    if (savedOnly) {
      const jobs = await storage.getSavedJobsByUserId(user.id);
      return res.json(jobs);
    }
    
    const jobs = await storage.getJobsByUserId(user.id);
    res.json(jobs);
  });

  app.post("/api/jobs/match", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const inputSchema = z.object({
      userSkills: z.array(z.string()),
      userExperience: z.string().optional(),
      preferences: z.object({
        location: z.string().optional(),
        remote: z.boolean().optional(),
        minSalary: z.number().optional()
      }).optional()
    });
    
    try {
      const validatedData = inputSchema.parse(req.body);
      const matchedJobs = await matchJobs(
        validatedData.userSkills,
        validatedData.userExperience,
        validatedData.preferences
      );
      
      const savedJobs = [];
      for (const job of matchedJobs) {
        const savedJob = await storage.createJob({
          userId: user.id,
          jobTitle: job.title,
          company: job.company,
          description: job.description,
          matchPercentage: job.matchPercentage,
          matchTier: job.matchTier || '',
          salary: job.salary,
          location: job.location,
          url: job.url,
          matchReasons: job.matchReasons || [],
          requiredSkills: job.requiredSkills || [],
          userSkillMatch: job.userSkillMatch || [],
          skillGaps: job.skillGaps || [],
          skillMatchCount: job.skillMatchCount || 0,
          skillGapCount: job.skillGapCount || 0,
          growthPotential: job.growthPotential || '',
          industryTrends: job.industryTrends || '',
          remoteType: job.remoteType || 'on-site',
          applicationStatus: job.applicationStatus || 'Not Applied',
          developmentPlan: job.developmentPlan || {
            prioritySkills: [],
            certifications: [],
            experienceBuilding: []
          },
          careerProgression: job.careerProgression || {
            nextRoles: [],
            timelineEstimate: ''
          },
          isSaved: false
        });
        savedJobs.push(savedJob);
      }
      
      res.json(savedJobs);
    } catch (error) {
      console.error("Error matching jobs:", error);
      res.status(500).json({ message: "Error matching jobs", error });
    }
  });

  app.patch("/api/jobs/:id", isAuthenticated, async (req, res) => {
    const jobId = parseInt(req.params.id);
    const updateSchema = z.object({
      isSaved: z.boolean().optional(),
      applicationStatus: z.string().optional()
    });
    
    try {
      const validatedData = updateSchema.parse(req.body);
      const updatedJob = await storage.updateJob(jobId, validatedData);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Learning paths routes
  app.get("/api/learning-paths", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const learningPaths = await storage.getLearningPathsByUserId(user.id);
    res.json(learningPaths);
  });

  app.patch("/api/learning-paths/:id", isAuthenticated, async (req, res) => {
    const pathId = parseInt(req.params.id);
    const updateSchema = z.object({
      status: z.enum(["not_started", "in_progress", "completed"])
    });
    
    try {
      const validatedData = updateSchema.parse(req.body);
      const updatedPath = await storage.updateLearningPath(pathId, validatedData);
      
      if (!updatedPath) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      res.json(updatedPath);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Resume Generator - Free Tool (No Authentication Required)
  app.post("/api/generate-content", async (req, res) => {
    try {
      const inputSchema = z.object({
        prompt: z.string()
      });
      
      const validatedData = inputSchema.parse(req.body);
      const content = await generateContent(validatedData.prompt);
      
      res.json({ content });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ 
        message: "Error generating content", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Chat routes
  app.get("/api/chats", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const chats = await storage.getChatsByUserId(user.id);
    res.json(chats);
  });

  app.get("/api/chats/:id", isAuthenticated, async (req, res) => {
    const chatId = parseInt(req.params.id);
    const chat = await storage.getChatById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    res.json(chat);
  });

  app.post("/api/chats", isAuthenticated, routeZValidator("body", insertChatSchema), async (req, res) => {
    try {
      const chat = await storage.createChat(req.body);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Error creating chat", error });
    }
  });

  app.post("/api/chats/:id/message", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const chatId = parseInt(req.params.id);
    const messageSchema = z.object({
      content: z.string()
    });
    
    try {
      const validatedData = messageSchema.parse(req.body);
      const chat = await storage.getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      if (chat.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Add new user message
      const userMessage = {
        role: "user",
        content: validatedData.content,
        timestamp: new Date().toISOString()
      };
      
      // Ensure chat.messages is always an array
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : [];
      const messages = [...currentMessages, userMessage];
      
      // Get AI response
      const aiResponse = await generateChatResponse(
        messages.map(m => ({ role: m.role, content: m.content }))
      );
      
      // Add AI response to messages
      const aiMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, aiMessage];
      
      // Update chat in storage
      const updatedChat = await storage.updateChat(chatId, {
        messages: updatedMessages
      });
      
      res.json(updatedChat);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Error processing chat message", error });
    }
  });

  // Market trends routes
  app.get("/api/market-trends/stocks/search", async (req, res) => {
    const query = req.query.q as string;
    
    try {
      const { searchStockSymbols } = await import('./lib/stockSymbols');
      const results = await searchStockSymbols(query || '');
      res.json(results);
    } catch (error) {
      console.error("Error searching for stock symbols:", error);
      res.status(500).json({ 
        message: "Failed to search for stock symbols", 
        errorType: "search_error" 
      });
    }
  });

  app.get("/api/market-trends/stocks", async (req, res) => {
    const symbol = req.query.symbol as string;
    
    if (!symbol) {
      return res.status(400).json({ 
        message: "Symbol parameter is required",
        errorType: "validation_error"
      });
    }
    
    try {
      const stockData = await getStockData(symbol);
      
      // If the stockData contains an error, use mock data instead
      if (stockData.error) {
        console.log(`Using mock data for symbol ${symbol} due to error: ${stockData.error}`);
        const { getMockStockData } = await import('./lib/mockStockData');
        const mockData = getMockStockData(symbol);
        return res.json(mockData);
      }
      
      res.json(stockData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      
      // For any error, use the mock data for consistent user experience
      console.log(`Using mock data for symbol ${symbol} due to error during fetch:`, error);
      try {
        const { getMockStockData } = await import('./lib/mockStockData');
        const mockData = getMockStockData(symbol);
        return res.json(mockData);
      } catch (mockError) {
        // If even the mock data fails, then return an error response
        console.error("Error generating mock data:", mockError);
        res.status(500).json({ 
          message: "Failed to fetch stock data", 
          errorType: "fatal_error",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Utility function for zod validation
function routeZValidator(type: "body" | "params" | "query", schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: Function) => {
    try {
      req[type] = schema.parse(req[type]);
      next();
    } catch (error) {
      return res.status(400).json({ message: "Validation failed", error });
    }
  };
}
