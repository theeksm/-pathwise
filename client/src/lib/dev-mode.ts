// Developer Mode Utilities
// This file contains utilities for developer mode and should never be exposed in production builds

// Check if dev mode is enabled
export const isDevMode = (): boolean => {
  // For development, let's enable dev mode by default
  // This can be overridden by setting VITE_DEV_MODE=false explicitly
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_DEV_MODE !== 'false';
  }
  return false;
};

// Mock developer user data
export const mockDevUser = {
  id: 999,
  username: 'dev_user',
  email: 'dev@pathwise.local',
  name: 'Developer Account',
  bio: 'This is a mock developer account for testing purposes',
  role: 'admin',
  membership: 'premium',
  createdAt: new Date().toISOString(),
};

// Check for dev session cookie
export const hasDevSession = (): boolean => {
  return document.cookie.includes('dev-access=true');
};

// Set dev session cookie (expires in 24 hours)
export const setDevSession = (): void => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
  document.cookie = `dev-access=true; expires=${expiryDate.toUTCString()}; path=/`;
};

// Activate developer mode via API
export const activateDevMode = async (): Promise<boolean> => {
  if (!isDevMode()) {
    console.error('[DEV MODE] Developer mode is not enabled in environment');
    return false;
  }
  
  try {
    const response = await fetch('/api/auth/dev-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to activate dev mode: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[DEV MODE] Developer mode activated successfully:', data);
    return true;
  } catch (error) {
    console.error('[DEV MODE] Error activating developer mode:', error);
    return false;
  }
};

// Clear dev session cookie
export const clearDevSession = (): void => {
  document.cookie = 'dev-access=; Max-Age=0; path=/;';
};

// Mock data injection functions
export const mockDataFunctions = {
  prefillResume: () => {
    localStorage.setItem('dev-resume-prefill', JSON.stringify({
      name: 'John Developer',
      email: 'john@example.com',
      phone: '555-123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced full-stack developer with 5+ years in React and Node.js',
      experience: [
        {
          title: 'Senior Developer',
          company: 'Tech Solutions Inc.',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: 'Present',
          description: 'Led development of multiple web applications using React and Node.js'
        }
      ],
      education: [
        {
          institution: 'University of California',
          degree: 'B.S. Computer Science',
          location: 'Berkeley, CA',
          startDate: '2012-09',
          endDate: '2016-05'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL', 'MongoDB']
    }));
    console.log('[DEV MODE] Resume data prefilled');
    alert('Resume data prefilled!');
  },
  
  triggerSkillAnalysis: () => {
    localStorage.setItem('dev-trigger-skill-analysis', 'true');
    console.log('[DEV MODE] Skill analysis triggered');
    alert('Skill analysis will be triggered on next visit to Skill Gap page');
  },
  
  clearMockData: () => {
    localStorage.removeItem('dev-resume-prefill');
    localStorage.removeItem('dev-trigger-skill-analysis');
    console.log('[DEV MODE] Cleared all mock data');
    alert('All mock data cleared');
  },
  
  logAuthState: () => {
    console.log('[DEV MODE] Current auth state:', {
      devMode: isDevMode(),
      hasDevSession: hasDevSession(),
      mockUser: mockDevUser,
      localStorageKeys: Object.keys(localStorage)
    });
    alert('Auth state logged to console');
  }
};