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
import { getMagicLoopsResponse } from "./lib/magicLoops";
import session from "express-session";
import cookieParser from "cookie-parser";
import { checkDevModeAuth, handleDevModeLogin, initializeDevUser, isDevMode } from "./lib/dev-mode";
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
  // Initialize the dev user if in dev mode
  if (isDevMode()) {
    await initializeDevUser();
    console.log('[DEV MODE] Developer mode is enabled');
  }
  
  // Set up cookie parser middleware
  app.use(cookieParser());
  
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
    // First check developer mode authentication
    if (isDevMode() && req.cookies && req.cookies['dev-access'] === 'true') {
      console.log('[DEV MODE] Using developer authentication bypass');
      // Set the mock dev user in the request
      const mockDevUser = {
        id: 999,
        username: 'dev_user',
        email: 'dev@pathwise.local',
        name: 'Developer Account',
        bio: 'This is a mock developer account for testing purposes',
        role: 'admin',
        membership: 'premium',
        createdAt: new Date().toISOString()
      };
      req.user = mockDevUser;
      return next();
    }
    
    // Regular authentication check
    if (req.isAuthenticated()) {
      return next();
    }
    
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Developer mode login endpoint is defined below with the other auth routes

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

  app.get("/api/auth/user", (req, res) => {
    // Check for developer mode with dev-access cookie
    if (isDevMode() && req.cookies && req.cookies['dev-access'] === 'true') {
      console.log('[DEV MODE] Returning mock developer user data');
      return res.json({
        id: 999,
        username: 'dev_user',
        email: 'dev@pathwise.local',
        name: 'Developer Account',
        role: 'admin',
        membership: 'premium'
      });
    }
    
    // Regular authentication check
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as any;
    res.json({ id: user.id, username: user.username, email: user.email });
  });
  
  // Dev mode login route - only available in dev mode
  app.post("/api/auth/dev-login", (req, res) => {
    if (!isDevMode()) {
      return res.status(404).json({ message: "Not found" });
    }
    
    console.log('[DEV MODE] Setting dev-access cookie for developer mode');
    
    // Set dev-access cookie (24 hour expiry)
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
    
    res.cookie('dev-access', 'true', {
      expires: expiryDate,
      httpOnly: false, // Allow JS access to read the cookie
      sameSite: 'lax',
      path: '/'
    });
    
    // Return the mock user
    res.status(200).json({
      id: 999,
      username: 'dev_user',
      email: 'dev@pathwise.local',
      name: 'Developer Account',
      role: 'admin',
      membership: 'premium'
    });
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

  app.post("/api/learning-paths", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    try {
      // Create a custom schema that extends the insertLearningPathSchema
      // but makes some fields optional based on our application needs
      const createLearningPathSchema = z.object({
        skillId: z.number().optional(),
        skillName: z.string(),
        courseTitle: z.string(),
        platform: z.string(),
        cost: z.string().optional().default("Free"),
        duration: z.string().optional().default("Self-paced"),
        url: z.string().optional().default(""),
        status: z.enum(["not_started", "in_progress", "completed"]).optional().default("not_started")
      });
      
      const validatedData = createLearningPathSchema.parse(req.body);
      
      // Create the learning path with the user ID
      const learningPath = await storage.createLearningPath({
        userId: user.id,
        skillId: validatedData.skillId || 0, // Default to 0 if undefined
        courseTitle: validatedData.courseTitle,
        platform: validatedData.platform,
        cost: validatedData.cost,
        duration: validatedData.duration,
        url: validatedData.url,
        status: validatedData.status
      });
      
      res.status(201).json(learningPath);
    } catch (error) {
      console.error("Error creating learning path:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to create learning path" });
    }
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
      console.log("Creating new chat with data:", req.body);
      
      // Make sure we always include an empty messages array
      const chatData = {
        ...req.body,
        messages: [] // Always initialize with empty messages array
      };
      
      const chat = await storage.createChat(chatData);
      console.log("Created new chat:", chat);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Error creating chat", error });
    }
  });

  // Magic Loops AI Chat API
  app.post("/api/chat/magic-loops", async (req, res) => {
    try {
      const inputSchema = z.object({
        message: z.string(),
        careerInterest: z.string().optional(),
        educationLevel: z.string().optional(),
      });
      
      const validatedData = inputSchema.parse(req.body);
      
      // Log the request (without sensitive data)
      console.log(`Magic Loops chat request received, message length: ${validatedData.message.length}`);
      
      // Call the Magic Loops API
      const response = await getMagicLoopsResponse(
        validatedData.message,
        validatedData.careerInterest,
        validatedData.educationLevel
      );
      
      // Log the response status
      console.log(`Magic Loops chat response received, success: ${response.success}`);
      
      // Return the response
      res.json(response);
    } catch (error) {
      console.error("Error processing Magic Loops chat request:", error);
      res.status(500).json({
        message: "Failed to process chat request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/chats/:id/message", isAuthenticated, async (req, res) => {
    console.log("POST /api/chats/:id/message - Request received");
    const user = req.user as any;
    console.log("User:", user);
    const chatId = parseInt(req.params.id);
    console.log("Chat ID:", chatId);
    const messageSchema = z.object({
      content: z.string(),
      chatMode: z.enum(["standard", "enhanced", "magic-loops"]).optional(),
      userId: z.union([z.number(), z.string()]).nullish() // Accept string|number|null
    });
    
    try {
      const validatedData = messageSchema.parse(req.body);
      console.log("Validated message data:", {
        ...validatedData,
        userId: typeof validatedData.userId // Log the type for debugging
      });
      
      // Determine which AI service to use based on chatMode and user membership
      // Default to standard mode for free users
      const chatMode = validatedData.chatMode || "standard";
      const isPremiumUser = user.premiumMember === true;
      
      // If user is trying to use enhanced mode but isn't premium, reject
      if (chatMode === "enhanced" && !isPremiumUser) {
        return res.status(403).json({ 
          message: "Premium membership required for enhanced AI mode", 
          requiresUpgrade: true 
        });
      }
      
      console.log("Fetching chat from storage");
      const chat = await storage.getChatById(chatId);
      
      if (!chat) {
        console.log("Chat not found with ID:", chatId);
        return res.status(404).json({ message: "Chat not found" });
      }
      console.log("Retrieved chat:", JSON.stringify(chat));
      
      if (chat.userId !== user.id) {
        console.log("User ID mismatch, access denied");
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Add new user message
      const userMessage = {
        role: "user",
        content: validatedData.content,
        timestamp: new Date().toISOString()
      };
      console.log("Created user message:", userMessage);
      
      // Ensure chat.messages is always an array
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : [];
      const messages = [...currentMessages, userMessage];
      
      // Get AI response based on chat mode
      console.log(`Generating ${chatMode} AI response for chat`, chatId, "with messages:", messages);
      let aiMessage;
      try {
        let aiResponse = "";
        
        if (chatMode === "magic-loops") {
          // Use Magic Loops for premium career guidance - replacing the enhanced mode
          console.log("Using Magic Loops API (May - Career Assistant)");
          
          // Get the last user message for Magic Loops
          const userMessage = validatedData.content;
          
          // Get user profile information for context if available
          const userProfile = await storage.getUser(user.id);
          const careerInterest = userProfile?.targetCareer || '';
          const educationLevel = userProfile?.educationLevel || '';
          
          // Call Magic Loops API
          const magicLoopsResponse = await getMagicLoopsResponse(
            userMessage,
            careerInterest,
            educationLevel
          );
          
          aiResponse = magicLoopsResponse.response;
          console.log("Magic Loops response received:", 
            aiResponse.substring(0, 50) + (aiResponse.length > 50 ? '...' : '')
          );
        } else if (chatMode === "enhanced") {
          // Use OpenAI for enhanced mode (legacy support)
          console.log("Using OpenAI API (Enhanced mode)");
          aiResponse = await generateChatResponse(
            messages.map(m => ({ role: m.role, content: m.content }))
          );
          console.log("OpenAI response received:", aiResponse);
        } else {
          // Use Gemini for standard mode
          console.log("Using Gemini API (Standard mode)");
          const { generateGeminiChatResponse } = await import('./lib/gemini');
          aiResponse = await generateGeminiChatResponse(
            messages.map(m => ({ role: m.role, content: m.content }))
          );
          console.log("Gemini response received:", aiResponse);
        }
        
        // Add AI response to messages with the appropriate provider
        let aiProvider = "gemini";
        if (chatMode === "enhanced") aiProvider = "openai";
        if (chatMode === "magic-loops") aiProvider = "magic-loops";
        
        aiMessage = {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString(),
          aiProvider: aiProvider
        };
      } catch (err) {
        console.error(`Error from ${chatMode} AI API:`, err);
        // Add error message as AI response
        aiMessage = {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          aiProvider: chatMode === "enhanced" ? "openai" : "gemini"
        };
      }
      
      const updatedMessages = [...messages, aiMessage];
      
      // Update chat in storage
      const updatedChat = await storage.updateChat(chatId, {
        messages: updatedMessages,
        chatMode: chatMode // Save the mode used for this chat
      });
      
      res.json(updatedChat);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Error processing chat message", error });
    }
  });

  // Market trends routes
  // Search for stocks using Polygon API
  app.get("/api/market-trends/stocks/search", async (req, res) => {
    const query = req.query.q as string;
    
    try {
      const { searchStocks } = await import('./lib/polygonAPI');
      const results = await searchStocks(query || '');
      res.json(results);
    } catch (error) {
      console.error("Error searching for stock symbols:", error);
      res.status(500).json({ 
        message: "Failed to search for stock symbols", 
        errorType: "search_error" 
      });
    }
  });

  // Get real-time stock data by symbol using Polygon API
  app.get("/api/market-trends/stocks", async (req, res) => {
    const symbol = req.query.symbol as string;
    
    if (!symbol) {
      return res.status(400).json({ 
        message: "Symbol parameter is required",
        errorType: "validation_error"
      });
    }
    
    try {
      // Get real-time stock data from Polygon API with caching
      const { getRealTimeStockData } = await import('./lib/polygonAPI');
      const stockData = await getRealTimeStockData(symbol);
      
      // Return the real stock data to the client
      res.json(stockData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      
      // For critical errors only, return a proper error response
      res.status(500).json({ 
        message: "Failed to fetch stock data", 
        errorType: "api_error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get trending stocks
  app.get("/api/market-trends/trending-stocks", async (req, res) => {
    try {
      const { getTrendingStocks } = await import('./lib/polygonAPI');
      const trendingStocks = await getTrendingStocks();
      res.json(trendingStocks);
    } catch (error) {
      console.error("Error fetching trending stocks:", error);
      res.status(500).json({ 
        message: "Failed to fetch trending stocks", 
        errorType: "api_error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get tech industry news
  app.get("/api/news/tech", async (req, res) => {
    try {
      const { getAllTechNews } = await import('./lib/newsAPI');
      const news = await getAllTechNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching tech news:", error);
      res.status(500).json({ 
        message: "Failed to fetch tech news", 
        errorType: "api_error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get company-specific news
  app.get("/api/news/company", async (req, res) => {
    const symbol = req.query.symbol as string;
    
    if (!symbol) {
      return res.status(400).json({
        message: "Symbol parameter is required",
        errorType: "validation_error"
      });
    }
    
    try {
      const { getCompanyNews } = await import('./lib/newsAPI');
      const news = await getCompanyNews(symbol);
      res.json(news);
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      res.status(500).json({
        message: "Failed to fetch company news",
        errorType: "api_error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
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
