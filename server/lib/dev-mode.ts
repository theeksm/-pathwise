import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Check if dev mode is enabled
export const isDevMode = (): boolean => {
  // For development, enable dev mode by default
  // This can be disabled by setting DEV_MODE=false
  if (process.env.NODE_ENV !== 'production') {
    return process.env.DEV_MODE !== 'false';
  }
  return false;
};

// Mock developer user object for dev mode
const mockDevUser = {
  id: 999,
  username: 'dev_user',
  email: 'dev@pathwise.local',
  name: 'Developer Account',
  bio: 'This is a mock developer account for testing purposes',
  role: 'admin',
  password: '$dev$', // This won't be used for actual authentication
  membership: 'premium',
  createdAt: new Date().toISOString()
};

// Initialize dev user in the storage system if needed
export const initializeDevUser = async (): Promise<void> => {
  if (!isDevMode()) return;
  
  console.log('[DEV MODE] Initializing dev user...');
  
  try {
    // Check if dev user already exists
    const existingUser = await storage.getUser(mockDevUser.id);
    
    if (!existingUser) {
      // Create the mock dev user in storage
      await storage.createUser({
        ...mockDevUser,
        id: mockDevUser.id
      } as any); // Using 'any' to bypass type checking for the mock user
      
      console.log('[DEV MODE] Dev user created');
    } else {
      console.log('[DEV MODE] Dev user already exists');
    }
  } catch (error) {
    console.error('[DEV MODE] Error initializing dev user:', error);
  }
};

// Middleware to check for dev mode authentication
export const checkDevModeAuth = (req: Request, res: Response, next: NextFunction) => {
  // Only apply in dev mode
  if (!isDevMode()) {
    return next();
  }
  
  // Check for dev-access cookie
  if (req.cookies && req.cookies['dev-access'] === 'true') {
    // Set the mock user in the request
    (req as any).user = mockDevUser;
    return next();
  }
  
  // Continue with regular auth flow if no dev cookie
  next();
};

// Dev mode login endpoint
export const handleDevModeLogin = async (req: Request, res: Response) => {
  if (!isDevMode()) {
    return res.status(404).json({ message: 'Not found' });
  }
  
  // Set dev-access cookie (24 hour expiry)
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
  
  res.cookie('dev-access', 'true', {
    expires: expiryDate,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  
  // Return the mock user
  res.status(200).json(mockDevUser);
};