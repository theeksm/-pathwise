import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CourseCard from "@/components/CourseCard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Layers, 
  LucideGraduationCap,
  Pause, 
  Play, 
  Plus, 
  Search, 
  Trophy, 
  RefreshCw,
  BookOpen,
  ListFilter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { LearningPath } from "@shared/schema";

// Learning path status options
const statusOptions = [
  { value: "not_started", label: "Not Started", color: "gray" },
  { value: "in_progress", label: "In Progress", color: "blue" },
  { value: "completed", label: "Completed", color: "green" }
];

// Platform options for filtering
const platformOptions = [
  "All Platforms",
  "Coursera",
  "Udemy",
  "LinkedIn Learning",
  "edX",
  "Pluralsight",
  "Codecademy",
  "FreeCodeCamp",
  "Khan Academy",
  "YouTube",
  "Other"
];

const LearningPaths = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);
  const [isAddCustomPathOpen, setIsAddCustomPathOpen] = useState(false);
  
  // New learning path form state
  const [newPathData, setNewPathData] = useState({
    skillName: "",
    courseTitle: "",
    platform: "Coursera",
    cost: "Free",
    duration: "2 weeks",
    url: "",
  });

  // Query learning paths
  const { 
    data: learningPaths, 
    isLoading 
  } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json();
    }
  });

  // Query user skills
  const { 
    data: skills,
    isLoading: isLoadingSkills
  } = useQuery({
    queryKey: ["/api/skills"],
    queryFn: async () => {
      const res = await fetch("/api/skills");
      if (!res.ok) throw new Error("Failed to fetch skills");
      return res.json();
    }
  });

  // Mutation to update learning path status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/learning-paths/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      toast({
        title: "Status updated",
        description: "Your learning path status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Mutation to add a custom learning path
  const addCustomPathMutation = useMutation({
    mutationFn: async (pathData: any) => {
      const response = await apiRequest("POST", "/api/learning-paths", pathData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      setIsAddCustomPathOpen(false);
      setNewPathData({
        skillName: "",
        courseTitle: "",
        platform: "Coursera",
        cost: "Free",
        duration: "2 weeks",
        url: "",
      });
      toast({
        title: "Learning path added",
        description: "Your custom learning path has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add learning path",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Handle custom path submission
  const handleAddCustomPath = () => {
    // Find skill ID based on skillName
    const matchingSkill = skills?.find((s: any) => 
      s.skillName.toLowerCase() === newPathData.skillName.toLowerCase()
    );
    
    let skillId = matchingSkill?.id;
    
    // If no matching skill is found, we need to handle that
    if (!skillId && !matchingSkill) {
      toast({
        title: "Skill not found",
        description: "Please select a skill from your existing skills or add it in the Skills section first.",
        variant: "destructive",
      });
      return;
    }
    
    addCustomPathMutation.mutate({
      skillId,
      courseTitle: newPathData.courseTitle,
      platform: newPathData.platform,
      cost: newPathData.cost,
      duration: newPathData.duration,
      url: newPathData.url,
      status: "not_started"
    });
  };

  // Filter learning paths based on search, platform, and tab
  const filteredPaths = learningPaths?.filter(path => {
    // Status filter based on active tab
    const statusMatch = 
      activeTab === "all" || 
      path.status === activeTab;
    
    // Platform filter
    const platformMatch = 
      selectedPlatform === "All Platforms" || 
      path.platform === selectedPlatform;
    
    // Search filter - match course title, skill name, or platform
    const searchMatch = 
      !searchQuery || 
      path.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skills?.find(s => s.id === path.skillId)?.skillName || "")
        .toLowerCase().includes(searchQuery.toLowerCase()) ||
      (path.platform || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && platformMatch && searchMatch;
  });

  // Calculate learning progress stats
  const totalPaths = learningPaths?.length || 0;
  const completedPaths = learningPaths?.filter(p => p.status === "completed").length || 0;
  const inProgressPaths = learningPaths?.filter(p => p.status === "in_progress").length || 0;
  const notStartedPaths = learningPaths?.filter(p => p.status === "not_started").length || 0;
  const completionPercentage = totalPaths ? Math.round((completedPaths / totalPaths) * 100) : 0;

  // Get skill name by ID
  const getSkillName = (skillId: number) => {
    const skill = skills?.find(s => s.id === skillId);
    return skill?.skillName || "Unknown Skill";
  };

  // Get skill status (missing or present)
  const getSkillStatus = (skillId: number) => {
    const skill = skills?.find(s => s.id === skillId);
    return skill?.isMissing || false;
  };

  if (isLoading || isLoadingSkills) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading your learning journey...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Management System</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Track your learning progress, manage your courses, and develop the skills you need for your career goals.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddCustomPathOpen(true)}
          className="mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Course
        </Button>
      </div>

      {/* Learning Progress Overview Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            Learning Progress Overview
          </CardTitle>
          <CardDescription>
            Track your overall learning journey and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-medium mb-1">Total Courses</div>
              <div className="text-2xl font-bold">{totalPaths}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-medium mb-1">Completed</div>
              <div className="text-2xl font-bold">{completedPaths}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <div className="text-amber-600 dark:text-amber-400 font-medium mb-1">In Progress</div>
              <div className="text-2xl font-bold">{inProgressPaths}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 font-medium mb-1">Not Started</div>
              <div className="text-2xl font-bold">{notStartedPaths}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search courses, skills, or platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-full md:w-[180px]">
            <ListFilter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map(platform => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Learning Paths Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="not_started">Not Started</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredPaths && filteredPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map(path => (
                <div key={path.id} className="flex">
                  <CourseCard
                    title={path.courseTitle}
                    platform={path.platform || ""}
                    cost={path.cost || ""}
                    duration={path.duration || ""}
                    skillName={getSkillName(path.skillId)}
                    isMissing={getSkillStatus(path.skillId)}
                    tags={[path.status.replace("_", " ")]}
                    onStartCourse={() => {
                      if (path.url) {
                        window.open(path.url, "_blank");
                      } else {
                        toast({
                          title: "No URL available",
                          description: "This course doesn't have a link available.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onShowMoreOptions={() => setSelectedPathId(path.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No learning paths found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                {searchQuery || selectedPlatform !== "All Platforms" 
                  ? "Try adjusting your filters or search query." 
                  : "Get started by adding a custom course or analyzing your skill gaps."}
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPlatform("All Platforms");
                }}
                variant="link" 
                className="mt-4"
                disabled={!searchQuery && selectedPlatform === "All Platforms"}
              >
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Similar structure for other tabs, but with filtered content */}
        <TabsContent value="in_progress" className="space-y-4">
          {/* Similar to "all" but with pre-filtered courses */}
          {filteredPaths && filteredPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map(path => (
                <div key={path.id} className="flex">
                  <CourseCard
                    title={path.courseTitle}
                    platform={path.platform || ""}
                    cost={path.cost || ""}
                    duration={path.duration || ""}
                    skillName={getSkillName(path.skillId)}
                    isMissing={getSkillStatus(path.skillId)}
                    tags={[path.status.replace("_", " ")]}
                    onStartCourse={() => {
                      if (path.url) {
                        window.open(path.url, "_blank");
                      } else {
                        toast({
                          title: "No URL available",
                          description: "This course doesn't have a link available.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onShowMoreOptions={() => setSelectedPathId(path.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pause className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No courses in progress</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                Start learning by changing the status of a course to "In Progress".
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredPaths && filteredPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map(path => (
                <div key={path.id} className="flex">
                  <CourseCard
                    title={path.courseTitle}
                    platform={path.platform || ""}
                    cost={path.cost || ""}
                    duration={path.duration || ""}
                    skillName={getSkillName(path.skillId)}
                    isMissing={getSkillStatus(path.skillId)}
                    tags={[path.status.replace("_", " ")]}
                    onStartCourse={() => {
                      if (path.url) {
                        window.open(path.url, "_blank");
                      } else {
                        toast({
                          title: "No URL available",
                          description: "This course doesn't have a link available.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onShowMoreOptions={() => setSelectedPathId(path.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No completed courses yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                Complete your courses to track your progress and achievements.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="not_started" className="space-y-4">
          {filteredPaths && filteredPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map(path => (
                <div key={path.id} className="flex">
                  <CourseCard
                    title={path.courseTitle}
                    platform={path.platform || ""}
                    cost={path.cost || ""}
                    duration={path.duration || ""}
                    skillName={getSkillName(path.skillId)}
                    isMissing={getSkillStatus(path.skillId)}
                    tags={[path.status.replace("_", " ")]}
                    onStartCourse={() => {
                      if (path.url) {
                        window.open(path.url, "_blank");
                      } else {
                        toast({
                          title: "No URL available",
                          description: "This course doesn't have a link available.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onShowMoreOptions={() => setSelectedPathId(path.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No courses in queue</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                Add courses to your learning path to get started.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog - shows when a path is selected */}
      {selectedPathId !== null && (
        <Dialog open={selectedPathId !== null} onOpenChange={() => setSelectedPathId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Course Status</DialogTitle>
              <DialogDescription>
                Change the status of your course to track your progress.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {statusOptions.map(option => {
                const path = learningPaths?.find(p => p.id === selectedPathId);
                const isCurrentStatus = path?.status === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors
                      ${isCurrentStatus ? `bg-${option.color}-50 border-${option.color}-200 dark:bg-${option.color}-900/20 dark:border-${option.color}-900` : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                    `}
                    onClick={() => {
                      if (!isCurrentStatus) {
                        handleStatusChange(selectedPathId, option.value);
                        setSelectedPathId(null);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {option.value === "not_started" && <Clock className="h-5 w-5 mr-2 text-gray-600" />}
                      {option.value === "in_progress" && <Play className="h-5 w-5 mr-2 text-blue-600" />}
                      {option.value === "completed" && <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />}
                      <span>{option.label}</span>
                    </div>
                    
                    {isCurrentStatus && (
                      <Badge 
                        variant="outline"
                        className={`bg-${option.color}-100 text-${option.color}-800 border-${option.color}-200`}
                      >
                        Current
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPathId(null)}>
                Cancel
              </Button>
              {learningPaths?.find(p => p.id === selectedPathId)?.url && (
                <Button 
                  onClick={() => {
                    const path = learningPaths?.find(p => p.id === selectedPathId);
                    if (path?.url) {
                      window.open(path.url, "_blank");
                    }
                    setSelectedPathId(null);
                  }}
                >
                  Go to Course
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Custom Learning Path Dialog */}
      <Dialog open={isAddCustomPathOpen} onOpenChange={setIsAddCustomPathOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Custom Course</DialogTitle>
            <DialogDescription>
              Add a course manually to your learning path.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skill-name" className="text-right">
                Skill
              </Label>
              <div className="col-span-3">
                <Select
                  value={newPathData.skillName}
                  onValueChange={(value) => setNewPathData({...newPathData, skillName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills?.map(skill => (
                      <SelectItem key={skill.id} value={skill.skillName}>
                        {skill.skillName} {skill.isMissing ? "🔴" : "✅"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course-title" className="text-right">
                Course Title
              </Label>
              <Input
                id="course-title"
                value={newPathData.courseTitle}
                onChange={(e) => setNewPathData({...newPathData, courseTitle: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
              <Select
                value={newPathData.platform}
                onValueChange={(value) => setNewPathData({...newPathData, platform: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.filter(p => p !== "All Platforms").map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Cost
              </Label>
              <Input
                id="cost"
                value={newPathData.cost}
                onChange={(e) => setNewPathData({...newPathData, cost: e.target.value})}
                placeholder="Free, $12.99, etc."
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                value={newPathData.duration}
                onChange={(e) => setNewPathData({...newPathData, duration: e.target.value})}
                placeholder="2 weeks, 8 hours, etc."
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={newPathData.url}
                onChange={(e) => setNewPathData({...newPathData, url: e.target.value})}
                placeholder="https://example.com/course"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddCustomPathOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomPath}
              disabled={!newPathData.skillName || !newPathData.courseTitle}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningPaths;