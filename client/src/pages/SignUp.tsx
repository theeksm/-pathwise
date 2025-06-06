import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationResult } from "firebase/auth";
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import PhoneVerification from "@/components/PhoneVerification";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const SignUp = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const phoneButtonRef = useRef<HTMLButtonElement>(null);
  
  // Use our custom auth hook
  const { user, registerMutation } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      toast({
        title: "Already logged in",
        description: "You are already logged in to PathWise.",
      });
      setLocation("/dashboard");
    }
  }, [user, setLocation, toast]);
  
  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    
    try {
      console.log("Attempting Google sign-in for registration...");
      
      // Check if Firebase is properly configured
      if (!auth || !googleProvider) {
        throw new Error("Firebase authentication is not initialized. Please contact the administrator.");
      }
      
      // Reset any previous state
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Add auth scopes for better user data
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Directly use Firebase SDK
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in result:", result);
      
      // Handle the user data from Firebase
      if (result && result.user) {
        // Import dynamically to avoid circular dependencies
        const { saveUserToFirestore } = await import("@/lib/firestore");
        
        // Prepare user data for Firestore
        const userData = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          phoneNumber: result.user.phoneNumber
        };
        
        // Save to Firestore
        try {
          await saveUserToFirestore(userData);
        } catch (firestoreError) {
          console.error("Error saving user to Firestore during signup:", firestoreError);
          // Continue with registration even if Firestore fails
        }
        
        console.log("User registered with Google:", userData);
        
        toast({
          title: "Account created",
          description: `Welcome ${userData.displayName || "to PathWise"}!`,
        });
        
        // Navigate to dashboard
        setLocation("/dashboard");
      }
      
    } catch (error: any) {
      // Reset loading state immediately for popup-related errors
      if (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        setIsGoogleLoading(false);
        return; // Don't show error message for user-initiated cancellations
      }

      // More detailed error logging
      console.error("Detailed Google sign-in error:", {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      });
      
      // Create a more user-friendly error message based on error code
      let errorMessage = "Google sign-up failed. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Authentication popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'The authentication credential is invalid. Please try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for OAuth operations. Contact your administrator.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };
  
  // Phone authentication handler
  const handlePhoneSignIn = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setError(null);
    setIsPhoneLoading(true);
    
    try {
      // Check if Firebase is properly configured
      if (!import.meta.env.VITE_FIREBASE_API_KEY || 
          !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
          !import.meta.env.VITE_FIREBASE_APP_ID) {
        throw new Error("Firebase is not properly configured. Please contact the administrator.");
      }
      
      if (!phoneButtonRef.current) {
        throw new Error("Button reference not found");
      }
      
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;
      
      // Initialize reCAPTCHA verifier directly
      const verifier = new RecaptchaVerifier(auth, 'phone-sign-in-button-signup', {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved for signup");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired for signup");
        },
      });
      
      // Sign in with phone number
      console.log("Attempting phone authentication for signup with:", formattedPhoneNumber);
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
      setConfirmationResult(result);
      
      toast({
        title: "Verification code sent",
        description: "Please enter the code sent to your phone.",
      });
      
    } catch (error: any) {
      console.error("Phone sign-in error during signup:", {
        code: error.code,
        message: error.message
      });
      
      // Create a more user-friendly error message based on error code
      let errorMessage = "Failed to send verification code. Please try again.";
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Please enter a valid phone number with country code (e.g., +1 for US).';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again tomorrow.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for SMS operations. Contact your administrator.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Phone verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };
  
  // Phone verification completed handler
  const handleVerificationComplete = async (user: any) => {
    setConfirmationResult(null);
    setPhoneNumber("");
    setShowPhoneInput(false);
    
    // Import dynamically to avoid circular dependencies
    const { saveUserToFirestore } = await import("@/lib/firestore");
    
    // Prepare user data for Firestore
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber
    };
    
    // Save to Firestore
    try {
      await saveUserToFirestore(userData);
    } catch (firestoreError) {
      console.error("Error saving phone user to Firestore during signup:", firestoreError);
      // Continue with signup even if Firestore fails
    }
    
    toast({
      title: "Account created",
      description: "You've registered with your phone number successfully!",
    });
    
    setLocation("/dashboard");
  };
  
  // Regular email/password registration
  const onSubmit = (data: FormData) => {
    setError(null);
    registerMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
      onError: (error: Error) => {
        setError(error.message || "Error creating account. Please try again.");
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      {confirmationResult ? (
        // Phone verification component
        <PhoneVerification 
          confirmationResult={confirmationResult} 
          onVerificationComplete={handleVerificationComplete}
          onCancel={() => {
            setConfirmationResult(null);
            setPhoneNumber("");
          }}
        />
      ) : (
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Create an account</CardTitle>
          </CardHeader>
          <CardContent>
            {showPhoneInput ? (
              // Phone number input form
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-red-500 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Include country code (e.g., +1 for US)
                  </div>
                </div>
                
                <Button
                  id="phone-sign-in-button-signup"
                  ref={phoneButtonRef}
                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
                  onClick={handlePhoneSignIn}
                  disabled={isPhoneLoading}
                >
                  {isPhoneLoading ? "Sending code..." : "Send verification code"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setShowPhoneInput(false)}
                >
                  Back to signup
                </Button>
              </div>
            ) : (
              // Regular signup form
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-red-500 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Continue"}
                  </Button>
                  
                  <div className="text-center text-sm dark:text-gray-300">
                    Already have an account?{" "}
                    <button className="p-0 text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setLocation("/login")}>
                      Log in
                    </button>
                  </div>
                  
                  <div className="relative my-6">
                    <Separator className="dark:bg-gray-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-card dark:bg-gray-800 px-2 text-muted-foreground dark:text-gray-400 text-sm">OR</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700" 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700" 
                    type="button"
                    onClick={() => setShowPhoneInput(true)}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Continue with Phone number
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignUp;
