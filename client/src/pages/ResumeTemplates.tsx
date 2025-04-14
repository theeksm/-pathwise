import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Sparkles, Plus, X, FileText, Gift } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Resume template types
const RESUME_TYPES = [
  {
    id: "professional",
    name: "Professional",
    description: "A clean, minimal design for experienced professionals",
    color: "#2563eb",
    fontFamily: "'Inter', 'Arial', sans-serif",
    headingFont: "'Inter', 'Arial', sans-serif",
    headingWeight: "600",
    bodyFont: "'Inter', 'Arial', sans-serif",
    primaryColor: "#2563eb",
    secondaryColor: "#e2e8f0",
    sectionSpacing: "1.5rem",
    borderStyle: "1px solid #e2e8f0",
    layoutType: "traditional",
    titleSize: "1.75rem",
    subtitleSize: "1.25rem",
    headingSize: "1.15rem",
    bodySize: "0.875rem",
  },
  {
    id: "creative",
    name: "Creative",
    description: "A visually appealing design for creative fields",
    color: "#8b5cf6",
    fontFamily: "'Poppins', 'Helvetica', sans-serif",
    headingFont: "'Poppins', 'Helvetica', sans-serif",
    headingWeight: "600",
    bodyFont: "'Poppins', 'Helvetica', sans-serif",
    primaryColor: "#8b5cf6",
    secondaryColor: "#f3e8ff",
    sectionSpacing: "1.75rem",
    borderStyle: "none",
    layoutType: "modern",
    titleSize: "2rem",
    subtitleSize: "1.25rem",
    headingSize: "1.15rem",
    bodySize: "0.875rem",
  },
  {
    id: "student",
    name: "Student",
    description: "An organized layout highlighting education and skills",
    color: "#10b981",
    fontFamily: "'Nunito', 'Arial', sans-serif",
    headingFont: "'Nunito', 'Arial', sans-serif",
    headingWeight: "700",
    bodyFont: "'Nunito', 'Arial', sans-serif",
    primaryColor: "#10b981",
    secondaryColor: "#ecfdf5",
    sectionSpacing: "1.5rem",
    borderStyle: "1px solid #d1fae5",
    layoutType: "education-focused",
    titleSize: "1.75rem",
    subtitleSize: "1.25rem",
    headingSize: "1.1rem",
    bodySize: "0.875rem",
  },
  {
    id: "executive",
    name: "Executive",
    description: "A sophisticated design for leadership positions",
    color: "#0f172a",
    fontFamily: "'Playfair Display', 'Georgia', serif",
    headingFont: "'Playfair Display', 'Georgia', serif",
    headingWeight: "700",
    bodyFont: "'Source Sans Pro', 'Arial', sans-serif",
    primaryColor: "#0f172a",
    secondaryColor: "#f8fafc",
    sectionSpacing: "1.75rem",
    borderStyle: "2px solid #e2e8f0",
    layoutType: "executive",
    titleSize: "2rem",
    subtitleSize: "1.25rem",
    headingSize: "1.25rem",
    bodySize: "0.875rem",
  },
  {
    id: "career-changer",
    name: "Career Changer",
    description: "Emphasizes transferable skills and achievements",
    color: "#ef4444",
    fontFamily: "'Roboto', 'Arial', sans-serif",
    headingFont: "'Roboto', 'Arial', sans-serif",
    headingWeight: "500",
    bodyFont: "'Roboto', 'Arial', sans-serif",
    primaryColor: "#ef4444",
    secondaryColor: "#fef2f2",
    sectionSpacing: "1.5rem",
    borderStyle: "none",
    layoutType: "skills-focused",
    titleSize: "1.75rem",
    subtitleSize: "1.25rem",
    headingSize: "1.15rem",
    bodySize: "0.875rem",
  }
];

interface FormState {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  skills: { name: string }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    from: string;
    to: string;
    description: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    from: string;
    to: string;
    current: boolean;
    description: string;
  }[];
  projects: {
    title: string;
    technologies: string;
    description: string;
    link: string;
  }[];
}

const initialState: FormState = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: ""
  },
  skills: [{ name: "" }],
  education: [{
    degree: "",
    institution: "",
    location: "",
    from: "",
    to: "",
    description: ""
  }],
  experience: [{
    title: "",
    company: "",
    location: "",
    from: "",
    to: "",
    current: false,
    description: ""
  }],
  projects: [{
    title: "",
    technologies: "",
    description: "",
    link: ""
  }]
};

const ResumeTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TYPES[0].id);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [activeTab, setActiveTab] = useState("personal-info");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Handle input changes for personal information
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  // Handle input changes for skills
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formState.skills];
    newSkills[index] = { name: value };
    setFormState(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // Add a new skill field
  const addSkill = () => {
    setFormState(prev => ({
      ...prev,
      skills: [...prev.skills, { name: "" }]
    }));
  };

  // Remove a skill field
  const removeSkill = (index: number) => {
    if (formState.skills.length > 1) {
      const newSkills = formState.skills.filter((_, i) => i !== index);
      setFormState(prev => ({
        ...prev,
        skills: newSkills
      }));
    }
  };

  // Handle input changes for education
  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...formState.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setFormState(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  // Add a new education field
  const addEducation = () => {
    setFormState(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: "",
        institution: "",
        location: "",
        from: "",
        to: "",
        description: ""
      }]
    }));
  };

  // Remove an education field
  const removeEducation = (index: number) => {
    if (formState.education.length > 1) {
      const newEducation = formState.education.filter((_, i) => i !== index);
      setFormState(prev => ({
        ...prev,
        education: newEducation
      }));
    }
  };

  // Handle input changes for experience
  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    const newExperience = [...formState.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setFormState(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  // Add a new experience field
  const addExperience = () => {
    setFormState(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: "",
        company: "",
        location: "",
        from: "",
        to: "",
        current: false,
        description: ""
      }]
    }));
  };

  // Remove an experience field
  const removeExperience = (index: number) => {
    if (formState.experience.length > 1) {
      const newExperience = formState.experience.filter((_, i) => i !== index);
      setFormState(prev => ({
        ...prev,
        experience: newExperience
      }));
    }
  };

  // Handle input changes for projects
  const handleProjectChange = (index: number, field: string, value: string) => {
    const newProjects = [...formState.projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    setFormState(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  // Add a new project field
  const addProject = () => {
    setFormState(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: "",
        technologies: "",
        description: "",
        link: ""
      }]
    }));
  };

  // Remove a project field
  const removeProject = (index: number) => {
    if (formState.projects.length > 1) {
      const newProjects = formState.projects.filter((_, i) => i !== index);
      setFormState(prev => ({
        ...prev,
        projects: newProjects
      }));
    }
  };

  // Generate AI suggestions for summary
  const generateSummary = async () => {
    if (!formState.personalInfo.title || !formState.skills[0].name) {
      toast({
        title: "Missing information",
        description: "Please provide at least your job title and some skills for better suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Construct the skills string
      const skillsString = formState.skills
        .filter(skill => skill.name.trim() !== "")
        .map(skill => skill.name)
        .join(", ");
      
      // Construct the experience string
      const experienceString = formState.experience
        .filter(exp => exp.title.trim() !== "" && exp.company.trim() !== "")
        .map(exp => `${exp.title} at ${exp.company}`)
        .join(", ");

      // Prepare the prompt
      const prompt = `Generate a professional resume summary for a ${formState.personalInfo.title} with skills in ${skillsString}${experienceString ? ` and experience as ${experienceString}` : ""}. Keep it concise, professional, and around 2-3 sentences.`;
      
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      
      const data = await response.json();
      
      if (data.content) {
        setFormState(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.content.trim()
          }
        }));
        
        toast({
          title: "Summary generated",
          description: "AI-suggested summary has been added to your resume."
        });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate summary. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI suggestions for job descriptions
  const generateJobDescription = async (index: number) => {
    const experience = formState.experience[index];
    
    if (!experience.title || !experience.company) {
      toast({
        title: "Missing information",
        description: "Please provide both job title and company name for better suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare the prompt
      const prompt = `Generate 3-4 professional bullet points describing responsibilities and achievements for a ${experience.title} position at ${experience.company}. Focus on impactful, measurable achievements where possible. Format as bullet points.`;
      
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate job description");
      }
      
      const data = await response.json();
      
      if (data.content) {
        // Update the specific job description
        handleExperienceChange(index, "description", data.content.trim());
        
        toast({
          title: "Description generated",
          description: "AI-suggested job description has been added."
        });
      }
    } catch (error) {
      console.error("Error generating job description:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate job description. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle PDF download using react-pdf
  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Import dynamic component to avoid SSR issues
      const { default: ResumePDF } = await import('@/components/ResumePDF');
      const { pdf } = await import('@react-pdf/renderer');
      
      // Get the template object
      const templateObj = RESUME_TYPES.find(t => t.id === selectedTemplate) || RESUME_TYPES[0];
      
      // Generate the PDF
      const blob = await pdf(<ResumePDF formState={formState} template={templateObj} />).toBlob();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formState.personalInfo.fullName || 'resume'}_${selectedTemplate}.pdf`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded as a professional PDF file."
      });
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download failed",
        description: "Failed to download your resume. Please try again or try another browser.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Free Resume Templates</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create a professional resume in minutes. Choose a template, fill in your details, and download your resume.
          </p>
          <Badge variant="outline" className="mt-4 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors border-blue-500/20 dark:border-blue-500/30">
            <Gift className="h-4 w-4 mr-1" /> 100% Free Tool - No Login Required
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Step 1: Select template */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl dark:text-white">Step 1: Select Template</CardTitle>
                <CardDescription className="dark:text-gray-400">Choose a design that fits your style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {RESUME_TYPES.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: template.color }}
                      />
                      <div>
                        <h3 className="font-medium dark:text-white">{template.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resume Preview Toggle */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl dark:text-white">Resume Preview</CardTitle>
                <CardDescription className="dark:text-gray-400">See how your resume will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setPreviewMode(!previewMode)} 
                    className="w-full"
                    variant={previewMode ? "default" : "outline"}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {previewMode ? "Hide Preview" : "Show Preview"}
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    variant="outline"
                    className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-500/30 border-green-500/20 dark:border-green-500/30"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                  <Gift className="inline h-3 w-3 mr-1" />
                  Free to use — no login or payment required
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {previewMode ? (
              // Resume Preview
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl dark:text-white">Resume Preview</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    This is how your resume will look when downloaded
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div 
                    id="resume-preview"
                    className="border p-8 rounded-lg bg-white dark:bg-gray-900 min-h-[800px]"
                    style={{ fontFamily: selectedTemplate === 'creative' ? 'Georgia, serif' : 'Arial, sans-serif' }}
                  >
                    {/* Resume Header */}
                    <div className={`${
                      selectedTemplate === 'creative' ? 'border-b-4' : 
                      selectedTemplate === 'executive' ? 'bg-gray-100 dark:bg-gray-800 p-4 rounded' : 
                      'border-b'
                    }`}
                    style={{ 
                      borderColor: RESUME_TYPES.find(t => t.id === selectedTemplate)?.color || '#2563eb',
                      marginBottom: '1.5rem'
                    }}>
                      <h1 className="text-3xl font-bold mb-1 dark:text-white">{formState.personalInfo.fullName || 'Your Name'}</h1>
                      <p className="text-lg font-medium mb-3 dark:text-gray-300">{formState.personalInfo.title || 'Professional Title'}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2 dark:text-gray-400">
                        {formState.personalInfo.email && (
                          <span>{formState.personalInfo.email}</span>
                        )}
                        {formState.personalInfo.phone && (
                          <span>{formState.personalInfo.phone}</span>
                        )}
                        {formState.personalInfo.location && (
                          <span>{formState.personalInfo.location}</span>
                        )}
                        {formState.personalInfo.linkedin && (
                          <span>{formState.personalInfo.linkedin}</span>
                        )}
                        {formState.personalInfo.website && (
                          <span>{formState.personalInfo.website}</span>
                        )}
                      </div>
                    </div>

                    {/* Professional Summary */}
                    {formState.personalInfo.summary && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400' : 
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase' : 
                          'text-gray-900 dark:text-white'
                        }`}>Professional Summary</h2>
                        <p className="dark:text-gray-300">{formState.personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {formState.skills.some(skill => skill.name.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400' : 
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase' : 
                          'text-gray-900 dark:text-white'
                        }`}>Skills</h2>
                        
                        <div className="flex flex-wrap gap-2">
                          {formState.skills.map((skill, index) => (
                            skill.name.trim() !== '' && (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-sm rounded ${
                                  selectedTemplate === 'creative' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                                  selectedTemplate === 'student' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                  selectedTemplate === 'executive' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 
                                  selectedTemplate === 'career-changer' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}
                              >
                                {skill.name}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {formState.experience.some(exp => exp.title.trim() !== '' || exp.company.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400' : 
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase' : 
                          'text-gray-900 dark:text-white'
                        }`}>Professional Experience</h2>
                        
                        {formState.experience.map((exp, index) => (
                          (exp.title.trim() !== '' || exp.company.trim() !== '') && (
                            <div key={index} className="mb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold dark:text-white">{exp.title || 'Position Title'}</h3>
                                  <p className="text-gray-700 dark:text-gray-300">{exp.company || 'Company Name'}{exp.location ? `, ${exp.location}` : ''}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {exp.from || 'Start Date'} - {exp.current ? 'Present' : exp.to || 'End Date'}
                                </p>
                              </div>
                              {exp.description && (
                                <div 
                                  className="mt-2 dark:text-gray-300"
                                  dangerouslySetInnerHTML={{ __html: exp.description.replace(/•/g, '<br/>•').replace(/\n/g, '<br/>') }}
                                />
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {formState.education.some(edu => edu.degree.trim() !== '' || edu.institution.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400' : 
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase' : 
                          'text-gray-900 dark:text-white'
                        }`}>Education</h2>
                        
                        {formState.education.map((edu, index) => (
                          (edu.degree.trim() !== '' || edu.institution.trim() !== '') && (
                            <div key={index} className="mb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold dark:text-white">{edu.degree || 'Degree'}</h3>
                                  <p className="text-gray-700 dark:text-gray-300">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {edu.from || 'Start Date'} - {edu.to || 'End Date'}
                                </p>
                              </div>
                              {edu.description && <p className="mt-2 dark:text-gray-300">{edu.description}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {formState.projects.some(proj => proj.title.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400' : 
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase' : 
                          'text-gray-900 dark:text-white'
                        }`}>Projects</h2>
                        
                        {formState.projects.map((proj, index) => (
                          proj.title.trim() !== '' && (
                            <div key={index} className="mb-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold dark:text-white">{proj.title || 'Project Title'}</h3>
                                {proj.link && (
                                  <a 
                                    href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Project Link
                                  </a>
                                )}
                              </div>
                              {proj.technologies && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                  Technologies: {proj.technologies}
                                </p>
                              )}
                              {proj.description && <p className="mt-2 dark:text-gray-300">{proj.description}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={handleDownload} 
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              // Resume Form
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl dark:text-white">Step 2: Fill Your Information</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Complete the sections below to create your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full mb-6">
                      <TabsTrigger value="personal-info" className="flex-1">Personal Info</TabsTrigger>
                      <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
                      <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
                      <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
                      <TabsTrigger value="projects" className="flex-1">Projects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal-info" className="space-y-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="Jane Doe"
                            value={formState.personalInfo.fullName}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title">Professional Title</Label>
                          <Input
                            id="title"
                            name="title"
                            placeholder="Software Engineer"
                            value={formState.personalInfo.title}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jane.doe@example.com"
                            value={formState.personalInfo.email}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="(123) 456-7890"
                            value={formState.personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            placeholder="New York, NY"
                            value={formState.personalInfo.location}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
                          <Input
                            id="linkedin"
                            name="linkedin"
                            placeholder="linkedin.com/in/username"
                            value={formState.personalInfo.linkedin}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (optional)</Label>
                          <Input
                            id="website"
                            name="website"
                            placeholder="yourwebsite.com"
                            value={formState.personalInfo.website}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 text-blue-600 dark:text-blue-400"
                            onClick={generateSummary}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5 mr-1" />
                                Generate AI Summary
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          id="summary"
                          name="summary"
                          placeholder="Briefly describe your professional background, key skills, and career goals."
                          value={formState.personalInfo.summary}
                          onChange={handlePersonalInfoChange}
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Pro tip: A good summary highlights your unique value and makes employers want to read more.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-6 mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium dark:text-white">Skills</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addSkill}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Skill
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {formState.skills.map((skill, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="e.g., React.js, Project Management, UX Design"
                                value={skill.name}
                                onChange={(e) => handleSkillChange(index, e.target.value)}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeSkill(index)}
                                disabled={formState.skills.length <= 1}
                                className="h-10 w-10 flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Pro tip: Include a mix of technical skills, soft skills, and industry-specific knowledge.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-6 mt-4">
                      {formState.experience.map((exp, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium dark:text-white">
                              Experience {formState.experience.length > 1 ? `#${index + 1}` : ''}
                            </h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateJobDescription(index)}
                                disabled={isGenerating}
                                className="h-8 text-blue-600 dark:text-blue-400"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                                    Generate Description
                                  </>
                                )}
                              </Button>
                              {formState.experience.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeExperience(index)}
                                  className="h-8"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`exp-title-${index}`}>Job Title</Label>
                              <Input
                                id={`exp-title-${index}`}
                                placeholder="Senior Software Engineer"
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`exp-company-${index}`}>Company</Label>
                              <Input
                                id={`exp-company-${index}`}
                                placeholder="Acme Inc."
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`exp-location-${index}`}>Location (optional)</Label>
                              <Input
                                id={`exp-location-${index}`}
                                placeholder="New York, NY"
                                value={exp.location}
                                onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                              />
                            </div>
                            <div className="flex space-x-4">
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`exp-from-${index}`}>Start Date</Label>
                                <Input
                                  id={`exp-from-${index}`}
                                  placeholder="Aug 2018"
                                  value={exp.from}
                                  onChange={(e) => handleExperienceChange(index, 'from', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`exp-to-${index}`}>End Date</Label>
                                <Input
                                  id={`exp-to-${index}`}
                                  placeholder="Present"
                                  value={exp.to}
                                  disabled={exp.current}
                                  onChange={(e) => handleExperienceChange(index, 'to', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`exp-current-${index}`}
                                  checked={exp.current}
                                  onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                />
                                <Label htmlFor={`exp-current-${index}`} className="text-sm font-normal">
                                  I currently work here
                                </Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`exp-description-${index}`}>Job Description</Label>
                            <Textarea
                              id={`exp-description-${index}`}
                              placeholder="Describe your responsibilities, achievements, and key projects. Use bullet points for better readability."
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                              rows={5}
                            />
                          </div>
                          
                          {index < formState.experience.length - 1 && <Separator />}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={addExperience}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Another Experience
                      </Button>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6 mt-4">
                      {formState.education.map((edu, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium dark:text-white">
                              Education {formState.education.length > 1 ? `#${index + 1}` : ''}
                            </h3>
                            {formState.education.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                className="h-8"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edu-degree-${index}`}>Degree/Certificate</Label>
                              <Input
                                id={`edu-degree-${index}`}
                                placeholder="Bachelor of Science in Computer Science"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                              <Input
                                id={`edu-institution-${index}`}
                                placeholder="University of Technology"
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edu-location-${index}`}>Location (optional)</Label>
                              <Input
                                id={`edu-location-${index}`}
                                placeholder="Boston, MA"
                                value={edu.location}
                                onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                              />
                            </div>
                            <div className="flex space-x-4">
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`edu-from-${index}`}>Start Date</Label>
                                <Input
                                  id={`edu-from-${index}`}
                                  placeholder="Sep 2014"
                                  value={edu.from}
                                  onChange={(e) => handleEducationChange(index, 'from', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`edu-to-${index}`}>End Date</Label>
                                <Input
                                  id={`edu-to-${index}`}
                                  placeholder="May 2018"
                                  value={edu.to}
                                  onChange={(e) => handleEducationChange(index, 'to', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`edu-description-${index}`}>Additional Information (optional)</Label>
                            <Textarea
                              id={`edu-description-${index}`}
                              placeholder="Relevant coursework, honors, activities, etc."
                              value={edu.description}
                              onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          {index < formState.education.length - 1 && <Separator />}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={addEducation}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Another Education
                      </Button>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6 mt-4">
                      {formState.projects.map((proj, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium dark:text-white">
                              Project {formState.projects.length > 1 ? `#${index + 1}` : ''}
                            </h3>
                            {formState.projects.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeProject(index)}
                                className="h-8"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`proj-title-${index}`}>Project Title</Label>
                              <Input
                                id={`proj-title-${index}`}
                                placeholder="E-commerce Website"
                                value={proj.title}
                                onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`proj-tech-${index}`}>Technologies Used</Label>
                              <Input
                                id={`proj-tech-${index}`}
                                placeholder="React, Node.js, MongoDB"
                                value={proj.technologies}
                                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`proj-link-${index}`}>Project Link (optional)</Label>
                              <Input
                                id={`proj-link-${index}`}
                                placeholder="https://github.com/username/project"
                                value={proj.link}
                                onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`proj-description-${index}`}>Project Description</Label>
                            <Textarea
                              id={`proj-description-${index}`}
                              placeholder="Describe the project, your role, and key accomplishments."
                              value={proj.description}
                              onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          {index < formState.projects.length - 1 && <Separator />}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={addProject}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Another Project
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab(activeTab === "personal-info" ? "skills" : 
                                             activeTab === "skills" ? "experience" :
                                             activeTab === "experience" ? "education" :
                                             activeTab === "education" ? "projects" : "personal-info")}
                  >
                    {activeTab === "projects" ? "Back to Personal Info" : "Next Section"}
                  </Button>
                  <Button onClick={() => setPreviewMode(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Preview Resume
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;