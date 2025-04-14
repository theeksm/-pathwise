import { useState, useEffect } from "react";
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
import { Loader2, Download, Sparkles, Plus, X, FileText, Gift, CheckCircle, ArrowRight } from "lucide-react";
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

// Track which fields the user has actively edited to avoid counting placeholder values as "completed"
interface EditedFieldsState {
  personalInfo: Record<string, boolean>;
  skills: boolean[];
  education: { [key: string]: boolean }[];
  experience: { [key: string]: boolean }[];
  projects: { [key: string]: boolean }[];
}

const ResumeTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TYPES[0].id);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [activeTab, setActiveTab] = useState("personal-info");
  
  // Track completed sections
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    "personal-info": false,
    "skills": false,
    "experience": false,
    "education": false,
    "projects": false
  });
  
  // Track which tabs are accessible
  const [accessibleTabs, setAccessibleTabs] = useState<Record<string, boolean>>({
    "personal-info": true,
    "skills": false,
    "experience": false,
    "education": false,
    "projects": false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  
  // Track which fields the user has actively edited (to differentiate from placeholder values)
  const [editedFields, setEditedFields] = useState<EditedFieldsState>({
    personalInfo: {
      fullName: false,
      title: false,
      email: false,
      phone: false,
      location: false,
      linkedin: false,
      website: false,
      summary: false
    },
    skills: [false],
    education: [{ degree: false, institution: false, location: false, from: false, to: false, description: false }],
    experience: [{ title: false, company: false, location: false, from: false, to: false, current: false, description: false }],
    projects: [{ title: false, technologies: false, description: false, link: false }]
  });
  
  // Monitor form changes and update section completion status
  useEffect(() => {
    // Check personal info section
    const personalInfoValid = validateSection("personal-info").valid;
    
    // Check skills section
    const skillsValid = validateSection("skills").valid;
    
    // Check experience section
    const experienceValid = validateSection("experience").valid;
    
    // Check education section
    const educationValid = validateSection("education").valid;
    
    // Check projects section
    const projectsValid = validateSection("projects").valid;
    
    // Check if personal info has been edited by user (not just placeholders)
    const personalInfoEdited = Object.values(editedFields.personalInfo).some(value => value);
    
    // Check if at least one skill has been edited
    const skillsEdited = editedFields.skills.some(value => value);
    
    // Check if experience has at least one entry with edited fields
    const experienceEdited = editedFields.experience.some(entry => 
      Object.values(entry).some(value => value)
    );
    
    // Check if education has at least one entry with edited fields
    const educationEdited = editedFields.education.some(entry => 
      Object.values(entry).some(value => value)
    );
    
    // Check if projects has at least one entry with edited fields
    const projectsEdited = editedFields.projects.some(entry => 
      Object.values(entry).some(value => value)
    );
    
    // Update completed sections - only if the section is valid AND has been edited by user
    setCompletedSections({
      "personal-info": personalInfoValid && personalInfoEdited,
      "skills": skillsValid && skillsEdited,
      "experience": experienceValid && experienceEdited, // Must be valid AND edited by user
      "education": educationValid && educationEdited,   // Must be valid AND edited by user  
      "projects": projectsValid && projectsEdited       // Must be valid AND edited by user
    });
    
    // Update accessible tabs based on which sections are completed or have been edited
    if ((personalInfoValid && personalInfoEdited) && !accessibleTabs["skills"]) {
      setAccessibleTabs(prev => ({ ...prev, "skills": true }));
    }
    if ((skillsValid && skillsEdited) && !accessibleTabs["experience"]) {
      setAccessibleTabs(prev => ({ ...prev, "experience": true }));
    }
    if ((experienceValid && experienceEdited) && !accessibleTabs["education"]) {
      setAccessibleTabs(prev => ({ ...prev, "education": true }));
    }
    if ((educationValid && educationEdited) && !accessibleTabs["projects"]) {
      setAccessibleTabs(prev => ({ ...prev, "projects": true }));
    }
  }, [formState, editedFields]);

  // Handle input changes for personal information
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update form state
    setFormState(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
    
    // Mark this field as edited by the user
    setEditedFields(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: true
      }
    }));
    
    // Add visual feedback for edited field
    const inputEl = document.getElementById(name);
    if (inputEl) {
      // Add a subtle green border to show the field has been edited
      inputEl.classList.add('border-green-500');
    }
  };

  // Handle input changes for skills
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formState.skills];
    newSkills[index] = { name: value };
    setFormState(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    // Mark this skill as edited by the user
    const newEditedSkills = [...editedFields.skills];
    while (newEditedSkills.length <= index) {
      newEditedSkills.push(false);
    }
    newEditedSkills[index] = true;
    
    setEditedFields(prev => ({
      ...prev,
      skills: newEditedSkills
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
    
    // Mark this education field as edited by the user
    const newEditedEducation = [...editedFields.education];
    while (newEditedEducation.length <= index) {
      newEditedEducation.push({ degree: false, institution: false, location: false, from: false, to: false, description: false });
    }
    newEditedEducation[index] = {
      ...newEditedEducation[index],
      [field]: true
    };
    
    setEditedFields(prev => ({
      ...prev,
      education: newEditedEducation
    }));
    
    // Add visual feedback for edited field
    const inputEl = document.getElementById(`education-${index}-${field}`);
    if (inputEl) {
      inputEl.classList.add('border-green-500');
    }
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
    
    // Mark this experience field as edited by the user
    const newEditedExperience = [...editedFields.experience];
    while (newEditedExperience.length <= index) {
      newEditedExperience.push({ title: false, company: false, location: false, from: false, to: false, current: false, description: false });
    }
    newEditedExperience[index] = {
      ...newEditedExperience[index],
      [field]: true
    };
    
    setEditedFields(prev => ({
      ...prev,
      experience: newEditedExperience
    }));
    
    // Add visual feedback for edited field
    const inputEl = document.getElementById(`experience-${index}-${field}`);
    if (inputEl) {
      inputEl.classList.add('border-green-500');
    }
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
    
    // Mark this project field as edited by the user
    const newEditedProjects = [...editedFields.projects];
    while (newEditedProjects.length <= index) {
      newEditedProjects.push({ title: false, technologies: false, description: false, link: false });
    }
    newEditedProjects[index] = {
      ...newEditedProjects[index],
      [field]: true
    };
    
    setEditedFields(prev => ({
      ...prev,
      projects: newEditedProjects
    }));
    
    // Add visual feedback for edited field
    const inputEl = document.getElementById(`project-${index}-${field}`);
    if (inputEl) {
      inputEl.classList.add('border-green-500');
    }
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
        
        // Mark the summary as user-edited since it was generated with user input
        setEditedFields(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: true
          }
        }));
        
        // Add visual feedback for AI-generated content
        const summaryEl = document.getElementById('summary');
        if (summaryEl) {
          summaryEl.classList.add('border-green-500');
        }
        
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

  // Check if section is valid to proceed
  const validateSection = (section: string): { valid: boolean; message?: string } => {
    switch (section) {
      case "personal-info":
        const { fullName, title } = formState.personalInfo;
        const { fullName: fullNameEdited, title: titleEdited } = editedFields.personalInfo;
        
        // First check if content exists
        if (!fullName.trim()) {
          return { valid: false, message: "Please provide your full name" };
        }
        if (!title.trim()) {
          return { valid: false, message: "Please provide your professional title" };
        }
        
        // Now check if user actually edited these fields rather than using placeholders
        if (!fullNameEdited) {
          return { valid: false, message: "Please edit your full name" };
        }
        if (!titleEdited) {
          return { valid: false, message: "Please edit your professional title" };
        }
        
        return { valid: true };
      
      case "skills":
        const hasEditedSkill = formState.skills.some((skill, index) => 
          skill.name.trim() !== "" && 
          (index < editedFields.skills.length ? editedFields.skills[index] : false)
        );
        
        if (!hasEditedSkill) {
          return { valid: false, message: "Please add at least one skill that you've edited" };
        }
        return { valid: true };
      
      case "experience":
        // Experience is optional
        const hasAnyEditedExperience = formState.experience.some((exp, index) => {
          if (index >= editedFields.experience.length) return false;
          const fieldEdits = editedFields.experience[index];
          return exp.title.trim() !== "" && exp.company.trim() !== "" && 
                 (fieldEdits.title || fieldEdits.company || fieldEdits.description);
        });
        
        // If any experience entry has title or company but not both, that's invalid
        const hasInvalidExperience = formState.experience.some(
          exp => (exp.title.trim() !== "" && exp.company.trim() === "") || 
                 (exp.title.trim() === "" && exp.company.trim() !== "")
        );
        
        if (hasInvalidExperience) {
          return { valid: false, message: "Please complete both job title and company for each experience entry" };
        }
        
        // If no edited experience is found, that's okay - it's optional
        return { valid: true };
      
      case "education":
        // Education is optional
        const hasInvalidEducation = formState.education.some(
          edu => (edu.degree.trim() !== "" && edu.institution.trim() === "") || 
                 (edu.degree.trim() === "" && edu.institution.trim() !== "")
        );
        
        if (hasInvalidEducation) {
          return { valid: false, message: "Please complete both degree and institution for each education entry" };
        }
        
        // Education is optional
        return { valid: true };
      
      case "projects":
        // Projects are optional
        const hasInvalidProject = formState.projects.some(
          proj => proj.title.trim() === "" && (proj.technologies.trim() !== "" || proj.description.trim() !== "")
        );
        
        if (hasInvalidProject) {
          return { valid: false, message: "Please provide a title for each project" };
        }
        
        // Projects are optional
        return { valid: true };
      
      default:
        return { valid: true };
    }
  };

  // Handle navigation to next section
  const handleNextSection = () => {
    const currentSection = activeTab;
    const validation = validateSection(currentSection);
    
    if (!validation.valid) {
      toast({
        title: "Please fix the following issues",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    // Mark current section as completed
    setCompletedSections(prev => ({
      ...prev,
      [currentSection]: true
    }));
    
    // Determine next section and make it accessible
    let nextSection = "";
    if (currentSection === "personal-info") nextSection = "skills";
    else if (currentSection === "skills") nextSection = "experience";
    else if (currentSection === "experience") nextSection = "education";
    else if (currentSection === "education") nextSection = "projects";
    else if (currentSection === "projects") nextSection = "personal-info"; // Loop back
    
    setAccessibleTabs(prev => ({
      ...prev,
      [nextSection]: true
    }));
    
    // Navigate to next section
    setActiveTab(nextSection);
  };
  
  // Handle skip section
  const handleSkipSection = () => {
    const currentSection = activeTab;
    
    // Mark current section as skipped but not completed
    setCompletedSections(prev => ({
      ...prev,
      [currentSection]: false
    }));
    
    // Determine next section and make it accessible
    let nextSection = "";
    if (currentSection === "personal-info") {
      toast({
        title: "Section skipped",
        description: "Personal information is important for your resume. You can come back to it later.",
        variant: "default"
      });
      nextSection = "skills";
    }
    else if (currentSection === "skills") nextSection = "experience";
    else if (currentSection === "experience") nextSection = "education";
    else if (currentSection === "education") nextSection = "projects";
    else if (currentSection === "projects") {
      setPreviewMode(true);
      return; // Don't navigate if skipping projects, just show preview
    }
    
    // Make next section accessible
    setAccessibleTabs(prev => ({
      ...prev,
      [nextSection]: true
    }));
    
    // Navigate to next section
    setActiveTab(nextSection);
    
    toast({
      title: "Section skipped",
      description: "You can come back to this section later.",
    });
  };
  
  // Handle tab change with validation
  const handleTabChange = (value: string) => {
    // If trying to access a tab that's not accessible, prevent navigation and show message
    if (!accessibleTabs[value]) {
      // Don't allow navigation to locked sections
      toast({
        title: "Section locked",
        description: "Please complete the previous sections in order first",
        variant: "destructive"
      });
      return;
    }
    
    // If going to a previous tab, or an accessible tab, allow navigation
    setActiveTab(value);
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
                    className="border p-8 rounded-lg bg-white dark:bg-gray-900 min-h-[800px] shadow-md overflow-auto"
                    style={{ 
                      fontFamily: RESUME_TYPES.find(t => t.id === selectedTemplate)?.fontFamily || 'Arial, sans-serif',
                      backgroundColor: selectedTemplate === 'executive' ? '#fcfcfc' : 'white'
                    }}
                  >
                    {/* Resume Header */}
                    <div className={`${
                      selectedTemplate === 'creative' ? 'border-b-4 pb-4 relative overflow-hidden' : 
                      selectedTemplate === 'student' ? 'border-b-2 pb-4 border-l-4 pl-4 rounded-l' :
                      selectedTemplate === 'executive' ? 'bg-gray-100 dark:bg-gray-800 p-6 mb-8 rounded shadow-sm' : 
                      selectedTemplate === 'career-changer' ? 'border-b-2 pb-4 mb-8 relative' :
                      'border-b pb-4'
                    }`}
                    style={{ 
                      borderColor: RESUME_TYPES.find(t => t.id === selectedTemplate)?.color || '#2563eb',
                      marginBottom: selectedTemplate === 'executive' ? '2rem' : '1.5rem'
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
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1' : 
                          selectedTemplate === 'student' ? 'text-green-700 dark:text-green-400 pl-2 border-l-4 border-green-500' :
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase border-b border-gray-300 dark:border-gray-700 pb-1' : 
                          selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-400 pb-1 border-b border-red-200 dark:border-red-900' :
                          'text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200 dark:border-blue-900'
                        }`}>Professional Summary</h2>
                        <p className="dark:text-gray-300 leading-relaxed">{formState.personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {formState.skills.some(skill => skill.name.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1' : 
                          selectedTemplate === 'student' ? 'text-green-700 dark:text-green-400 pl-2 border-l-4 border-green-500' :
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase border-b border-gray-300 dark:border-gray-700 pb-1' : 
                          selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-400 pb-1 border-b border-red-200 dark:border-red-900' :
                          'text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200 dark:border-blue-900'
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
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1' : 
                          selectedTemplate === 'student' ? 'text-green-700 dark:text-green-400 pl-2 border-l-4 border-green-500' :
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase border-b border-gray-300 dark:border-gray-700 pb-1' : 
                          selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-400 pb-1 border-b border-red-200 dark:border-red-900' :
                          'text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200 dark:border-blue-900'
                        }`}>Professional Experience</h2>
                        
                        {formState.experience.map((exp, index) => (
                          (exp.title.trim() !== '' || exp.company.trim() !== '') && (
                            <div key={index} className={`mb-4 ${
                              selectedTemplate === 'creative' ? 'p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md' : 
                              selectedTemplate === 'student' ? 'p-3 border-l-2 border-green-500 pl-4' :
                              selectedTemplate === 'executive' ? 'p-3 mb-4 border-b border-gray-200 dark:border-gray-700' : 
                              selectedTemplate === 'career-changer' ? 'p-3 bg-red-50 dark:bg-red-950/20 rounded-md' :
                              'p-3 border-l-2 border-blue-200 dark:border-blue-900 pl-4'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold dark:text-white">{exp.title || 'Position Title'}</h3>
                                  <p className={`text-gray-700 dark:text-gray-300 ${
                                    selectedTemplate === 'executive' ? 'font-medium' : ''
                                  }`}>{exp.company || 'Company Name'}{exp.location ? `, ${exp.location}` : ''}</p>
                                </div>
                                <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                                  selectedTemplate === 'executive' ? 'font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' : 
                                  selectedTemplate === 'creative' ? 'italic' : ''
                                }`}>
                                  {exp.from || 'Start Date'} - {exp.current ? 'Present' : exp.to || 'End Date'}
                                </p>
                              </div>
                              {exp.description && (
                                <div 
                                  className="mt-2 dark:text-gray-300 leading-relaxed"
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
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1' : 
                          selectedTemplate === 'student' ? 'text-green-700 dark:text-green-400 pl-2 border-l-4 border-green-500' :
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase border-b border-gray-300 dark:border-gray-700 pb-1' : 
                          selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-400 pb-1 border-b border-red-200 dark:border-red-900' :
                          'text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200 dark:border-blue-900'
                        }`}>Education</h2>
                        
                        {formState.education.map((edu, index) => (
                          (edu.degree.trim() !== '' || edu.institution.trim() !== '') && (
                            <div key={index} className={`mb-4 ${
                              selectedTemplate === 'creative' ? 'p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md' : 
                              selectedTemplate === 'student' ? 'p-3 border-l-2 border-green-500 pl-4' :
                              selectedTemplate === 'executive' ? 'p-3 mb-4 border-b border-gray-200 dark:border-gray-700' : 
                              selectedTemplate === 'career-changer' ? 'p-3 bg-red-50 dark:bg-red-950/20 rounded-md' :
                              'p-3 border-l-2 border-blue-200 dark:border-blue-900 pl-4'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className={`font-bold dark:text-white ${
                                    selectedTemplate === 'student' ? 'text-lg' : ''
                                  }`}>{edu.degree || 'Degree'}</h3>
                                  <p className={`text-gray-700 dark:text-gray-300 ${
                                    selectedTemplate === 'executive' ? 'font-medium' : 
                                    selectedTemplate === 'student' ? 'font-semibold' : ''
                                  }`}>{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</p>
                                </div>
                                <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                                  selectedTemplate === 'executive' ? 'font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' : 
                                  selectedTemplate === 'creative' ? 'italic' : ''
                                }`}>
                                  {edu.from || 'Start Date'} - {edu.to || 'End Date'}
                                </p>
                              </div>
                              {edu.description && <p className="mt-2 dark:text-gray-300 leading-relaxed">{edu.description}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {formState.projects.some(proj => proj.title.trim() !== '') && (
                      <div className="mb-6">
                        <h2 className={`text-lg font-bold mb-2 ${
                          selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-1' : 
                          selectedTemplate === 'student' ? 'text-green-700 dark:text-green-400 pl-2 border-l-4 border-green-500' :
                          selectedTemplate === 'executive' ? 'text-gray-900 dark:text-white uppercase border-b border-gray-300 dark:border-gray-700 pb-1' : 
                          selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-400 pb-1 border-b border-red-200 dark:border-red-900' :
                          'text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200 dark:border-blue-900'
                        }`}>Projects</h2>
                        
                        {formState.projects.map((proj, index) => (
                          proj.title.trim() !== '' && (
                            <div key={index} className={`mb-4 ${
                              selectedTemplate === 'creative' ? 'p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md' : 
                              selectedTemplate === 'student' ? 'p-3 border-l-2 border-green-500 pl-4' :
                              selectedTemplate === 'executive' ? 'p-3 mb-4 border-b border-gray-200 dark:border-gray-700' : 
                              selectedTemplate === 'career-changer' ? 'p-3 bg-red-50 dark:bg-red-950/20 rounded-md' :
                              'p-3 border-l-2 border-blue-200 dark:border-blue-900 pl-4'
                            }`}>
                              <div className="flex justify-between items-start">
                                <h3 className={`font-bold dark:text-white ${
                                  selectedTemplate === 'creative' ? 'text-purple-800 dark:text-purple-300' : 
                                  selectedTemplate === 'student' ? 'text-green-800 dark:text-green-300' : ''
                                }`}>{proj.title || 'Project Title'}</h3>
                                {proj.link && (
                                  <a 
                                    href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`text-sm hover:underline ${
                                      selectedTemplate === 'creative' ? 'text-purple-600 dark:text-purple-400' :
                                      selectedTemplate === 'student' ? 'text-green-600 dark:text-green-400' :
                                      selectedTemplate === 'executive' ? 'text-gray-600 dark:text-gray-400 font-medium' :
                                      selectedTemplate === 'career-changer' ? 'text-red-600 dark:text-red-400' :
                                      'text-blue-600 dark:text-blue-400'
                                    }`}
                                  >
                                    Project Link
                                  </a>
                                )}
                              </div>
                              {proj.technologies && (
                                <p className={`text-sm mt-1 ${
                                  selectedTemplate === 'creative' ? 'text-purple-700 dark:text-purple-300 font-medium' :
                                  selectedTemplate === 'student' ? 'text-green-700 dark:text-green-300 font-medium' :
                                  selectedTemplate === 'executive' ? 'text-gray-700 dark:text-gray-300 font-medium' :
                                  selectedTemplate === 'career-changer' ? 'text-red-700 dark:text-red-300 font-medium' :
                                  'text-blue-700 dark:text-blue-300 font-medium'
                                }`}>
                                  Technologies: {proj.technologies}
                                </p>
                              )}
                              {proj.description && <p className="mt-2 dark:text-gray-300 leading-relaxed">{proj.description}</p>}
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
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step {
                        activeTab === "personal-info" ? "1/5" :
                        activeTab === "skills" ? "2/5" :
                        activeTab === "experience" ? "3/5" :
                        activeTab === "education" ? "4/5" :
                        "5/5"
                      }</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Object.values(completedSections).filter(Boolean).length}/5 completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(Object.values(completedSections).filter(Boolean).length / 5) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Section completion indicators */}
                    <div className="flex justify-between mt-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          completedSections["personal-info"] 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {completedSections["personal-info"] && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Info</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          completedSections["skills"] 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {completedSections["skills"] && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Skills</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          completedSections["experience"] 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {completedSections["experience"] && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Exp</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          completedSections["education"] 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {completedSections["education"] && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Edu</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          completedSections["projects"] 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {completedSections["projects"] && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Proj</span>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="w-full mb-6">
                      <TabsTrigger 
                        value="personal-info" 
                        className={`flex-1 ${accessibleTabs["personal-info"] ? "" : "opacity-50 cursor-not-allowed"}`}
                        data-state={completedSections["personal-info"] ? "completed" : ""}
                      >
                        <div className="flex items-center">
                          {completedSections["personal-info"] && (
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          )}
                          Personal Info
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="skills" 
                        className={`flex-1 ${accessibleTabs["skills"] ? "" : "opacity-50 cursor-not-allowed"}`}
                        data-state={completedSections["skills"] ? "completed" : ""}
                        disabled={!accessibleTabs["skills"]}
                      >
                        <div className="flex items-center">
                          {completedSections["skills"] && (
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          )}
                          Skills
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="experience" 
                        className={`flex-1 ${accessibleTabs["experience"] ? "" : "opacity-50 cursor-not-allowed"}`}
                        data-state={completedSections["experience"] ? "completed" : ""}
                        disabled={!accessibleTabs["experience"]}
                      >
                        <div className="flex items-center">
                          {completedSections["experience"] && (
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          )}
                          Experience
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="education" 
                        className={`flex-1 ${accessibleTabs["education"] ? "" : "opacity-50 cursor-not-allowed"}`}
                        data-state={completedSections["education"] ? "completed" : ""}
                        disabled={!accessibleTabs["education"]}
                      >
                        <div className="flex items-center">
                          {completedSections["education"] && (
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          )}
                          Education
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="projects" 
                        className={`flex-1 ${accessibleTabs["projects"] ? "" : "opacity-50 cursor-not-allowed"}`}
                        data-state={completedSections["projects"] ? "completed" : ""}
                        disabled={!accessibleTabs["projects"]}
                      >
                        <div className="flex items-center">
                          {completedSections["projects"] && (
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          )}
                          Projects
                        </div>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal-info" className="space-y-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formState.personalInfo.fullName}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title">Professional Title</Label>
                          <Input
                            id="title"
                            name="title"
                            placeholder="Enter your job title"
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
                            placeholder="Enter your email address"
                            value={formState.personalInfo.email}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formState.personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2 relative">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <Input
                              id="location"
                              name="location"
                              placeholder="Type to search for a location"
                              value={formState.personalInfo.location}
                              onChange={handlePersonalInfoChange}
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
                          <Input
                            id="linkedin"
                            name="linkedin"
                            placeholder="Enter your LinkedIn profile URL"
                            value={formState.personalInfo.linkedin}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (optional)</Label>
                          <Input
                            id="website"
                            name="website"
                            placeholder="Enter your website URL"
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
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <div></div> {/* Spacer for alignment */}
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={handleSkipSection}
                          >
                            Skip
                          </Button>
                          <Button
                            onClick={handleNextSection}
                          >
                            Next: Skills
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
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
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("personal-info")}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={handleSkipSection}
                          >
                            Skip
                          </Button>
                          <Button
                            onClick={handleNextSection}
                          >
                            Next: Experience
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
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
                                placeholder="Enter your job title"
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`exp-company-${index}`}>Company</Label>
                              <Input
                                id={`exp-company-${index}`}
                                placeholder="Enter your employer"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 relative">
                              <Label htmlFor={`exp-location-${index}`}>Location (optional)</Label>
                              <div className="relative">
                                <Input
                                  id={`exp-location-${index}`}
                                  placeholder="Type to search for a location"
                                  value={exp.location}
                                  onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                  autoComplete="off"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-4">
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`exp-from-${index}`}>Start Date</Label>
                                <Input
                                  id={`exp-from-${index}`}
                                  placeholder="Enter start date (e.g., Aug 2018)"
                                  value={exp.from}
                                  onChange={(e) => handleExperienceChange(index, 'from', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`exp-to-${index}`}>End Date</Label>
                                <Input
                                  id={`exp-to-${index}`}
                                  placeholder="Enter end date (or 'Present')"
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
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("skills")}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={handleSkipSection}
                          >
                            Skip
                          </Button>
                          <Button
                            onClick={handleNextSection}
                          >
                            Next: Education
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                                placeholder="Enter your degree or certificate name"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                              <Input
                                id={`edu-institution-${index}`}
                                placeholder="Enter your school or institution name"
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 relative">
                              <Label htmlFor={`edu-location-${index}`}>Location (optional)</Label>
                              <div className="relative">
                                <Input
                                  id={`edu-location-${index}`}
                                  placeholder="Type to search for a location"
                                  value={edu.location}
                                  onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                                  autoComplete="off"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-4">
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`edu-from-${index}`}>Start Date</Label>
                                <Input
                                  id={`edu-from-${index}`}
                                  placeholder="Enter start date (e.g., Sep 2014)"
                                  value={edu.from}
                                  onChange={(e) => handleEducationChange(index, 'from', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 flex-1">
                                <Label htmlFor={`edu-to-${index}`}>End Date</Label>
                                <Input
                                  id={`edu-to-${index}`}
                                  placeholder="Enter end date (e.g., May 2018)"
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
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("experience")}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={handleSkipSection}
                          >
                            Skip
                          </Button>
                          <Button
                            onClick={handleNextSection}
                          >
                            Next: Projects
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                                placeholder="Enter your project name"
                                value={proj.title}
                                onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`proj-tech-${index}`}>Technologies Used</Label>
                              <Input
                                id={`proj-tech-${index}`}
                                placeholder="Enter technologies used (comma-separated)"
                                value={proj.technologies}
                                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`proj-link-${index}`}>Project Link (optional)</Label>
                              <Input
                                id={`proj-link-${index}`}
                                placeholder="Add your project URL (e.g., GitHub, website)"
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
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("education")}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button
                            variant="default"
                            onClick={() => {
                              validateSection("projects");
                              // Mark section as completed
                              setCompletedSections(prev => ({
                                ...prev,
                                "projects": true
                              }));
                              // Preview the resume
                              setPreviewMode(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete Resume
                            <CheckCircle className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-4">
                  {!previewMode && (
                    <div className="flex gap-2">
                      {/* Back to Form button when in preview mode */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Calculate which section to go to based on which sections are completed
                          let sectionToGoTo = "personal-info";
                          if (completedSections["personal-info"]) {
                            if (completedSections["skills"]) {
                              if (completedSections["experience"]) {
                                if (completedSections["education"]) {
                                  sectionToGoTo = "projects";
                                } else {
                                  sectionToGoTo = "education";
                                }
                              } else {
                                sectionToGoTo = "experience";
                              }
                            } else {
                              sectionToGoTo = "skills";
                            }
                          }
                          
                          // If all sections are complete, go to the least completed one
                          if (
                            completedSections["personal-info"] && 
                            completedSections["skills"] && 
                            completedSections["experience"] &&
                            completedSections["education"] &&
                            completedSections["projects"]
                          ) {
                            // All complete, go to personal info
                            sectionToGoTo = "personal-info";
                          }
                          
                          setActiveTab(sectionToGoTo);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                        {Object.values(completedSections).every(Boolean) ? 
                          "Review All Sections" : 
                          "Continue Editing"
                        }
                      </Button>
                      <Button 
                        onClick={() => setPreviewMode(true)}
                        variant="default"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Preview Resume
                      </Button>
                    </div>
                  )}
                  
                  {previewMode && (
                    <Button
                      variant="outline"
                      onClick={() => setPreviewMode(false)}
                    >
                      Back to Editor
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleDownload} 
                    disabled={isDownloading}
                    variant="default"
                    className={`${!previewMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;