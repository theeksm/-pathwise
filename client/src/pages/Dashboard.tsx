import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { getUserFromFirestore, UserData } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check authentication status and redirect if not logged in
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          // Fetch additional user data from Firestore
          const firestoreData = await getUserFromFirestore(authUser.uid);
          setUserData(firestoreData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Not logged in, redirect to login
        setLocation("/login");
      }
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [setLocation]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  
  // This should not happen since we redirect, but just in case
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Not Logged In</CardTitle>
            <CardDescription className="text-center dark:text-gray-400">
              Please log in to view this page
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setLocation("/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>
        
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold dark:text-white">
              Welcome, {user.displayName || userData?.displayName || "User"}!
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Your account information and profile
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={user.photoURL || userData?.photoURL || undefined} 
                  alt={user.displayName || userData?.displayName || "User"}
                />
                <AvatarFallback>
                  {(user.displayName || userData?.displayName || "User").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-semibold dark:text-white">
                  {user.displayName || userData?.displayName || "User"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.email || userData?.email || "No email available"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium dark:text-white">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="font-medium truncate dark:text-white">{user.uid}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                  <p className="font-medium dark:text-white">
                    {user.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium dark:text-white">
                    {user.phoneNumber || userData?.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="font-medium dark:text-white">
                    {userData?.createdAt 
                      ? new Date(userData.createdAt).toLocaleDateString() 
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button onClick={handleLogout} variant="destructive">
              Log Out
            </Button>
          </CardFooter>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold dark:text-white">Career Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your career development journey
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/career-path")}>
                Go to Career Path
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold dark:text-white">Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Check your skill assessment and find areas to improve
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/skill-gap")}>
                Go to Skill Gap
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold dark:text-white">Job Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Explore opportunities tailored to your profile
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/job-matching")}>
                Find Jobs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}