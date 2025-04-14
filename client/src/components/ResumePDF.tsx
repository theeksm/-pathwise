import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Define resume form state types
interface ResumeFormState {
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

// Define template types
interface TemplateType {
  id: string;
  name: string;
  description: string;
  color: string;
  fontFamily: string;
  headingFont: string;
  headingWeight: string;
  bodyFont: string;
  primaryColor: string;
  secondaryColor: string;
  sectionSpacing: string;
  borderStyle: string;
  layoutType: string;
  titleSize: string;
  subtitleSize: string;
  headingSize: string;
  bodySize: string;
}

// Register fonts for PDF generation
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf',
});

Font.register({
  family: 'Poppins',
  src: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJA.ttf',
  fontWeight: 'normal',
});

Font.register({
  family: 'Poppins',
  src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6V14.ttf',
  fontWeight: 'bold',
});

Font.register({
  family: 'Nunito',
  src: 'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaE.ttf',
});

Font.register({
  family: 'Playfair Display',
  src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf',
});

Font.register({
  family: 'Source Sans Pro',
  src: 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3aP6LSpkA.ttf',
});

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
});

const createPdfStyles = (template: TemplateType) => {
  // Base styles
  return StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: template.bodyFont.split(',')[0].replace(/'/g, ''),
      backgroundColor: '#FFFFFF',
    },
    container: {
      flex: 1,
    },
    header: {
      marginBottom: 20,
      borderBottomWidth: template.id === 'executive' ? 2 : template.id === 'creative' ? 3 : 1,
      borderBottomColor: template.primaryColor,
      borderBottomStyle: 'solid',
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: parseInt(template.titleSize),
      fontWeight: 'bold',
      marginBottom: 5,
      fontFamily: template.headingFont.split(',')[0].replace(/'/g, ''),
      color: template.id === 'executive' ? '#000000' : template.primaryColor,
    },
    headerSubtitle: {
      fontSize: parseInt(template.subtitleSize),
      marginBottom: 10,
      color: '#333333',
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 5,
      fontSize: 10,
    },
    contactItem: {
      marginRight: 15,
      fontSize: 9,
      color: '#555555',
    },
    section: {
      marginBottom: parseInt(template.sectionSpacing),
    },
    sectionTitle: {
      fontSize: parseInt(template.headingSize),
      fontWeight: 'bold',
      marginBottom: 8,
      fontFamily: template.headingFont.split(',')[0].replace(/'/g, ''),
      color: template.primaryColor,
      textTransform: template.id === 'executive' ? 'uppercase' : 'none',
    },
    sectionContent: {
      fontSize: parseInt(template.bodySize),
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    skill: {
      padding: template.id === 'creative' ? 5 : 3,
      marginRight: 5,
      marginBottom: 5,
      fontSize: 9,
      backgroundColor: template.secondaryColor,
      color: template.primaryColor,
      borderRadius: 3,
    },
    experienceItem: {
      marginBottom: 10,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    experienceTitle: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    experienceCompany: {
      fontSize: 11,
      fontWeight: 'normal',
    },
    experienceDate: {
      fontSize: 9,
      color: '#555555',
    },
    experienceLocation: {
      fontSize: 9,
      color: '#555555',
      marginBottom: 5,
    },
    experienceDescription: {
      fontSize: 9,
      lineHeight: 1.4,
    },
    educationItem: {
      marginBottom: 10,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    educationDegree: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    educationInstitution: {
      fontSize: 10,
    },
    educationDate: {
      fontSize: 9,
      color: '#555555',
    },
    educationLocation: {
      fontSize: 9,
      color: '#555555',
      marginBottom: 5,
    },
    educationDescription: {
      fontSize: 9,
      lineHeight: 1.4,
    },
    projectItem: {
      marginBottom: 10,
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    projectTitle: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    projectTech: {
      fontSize: 9,
      color: '#555555',
      marginBottom: 5,
    },
    projectDescription: {
      fontSize: 9,
      lineHeight: 1.4,
    },
    projectLink: {
      fontSize: 8,
      color: template.primaryColor,
      textDecoration: 'underline',
    },
    summary: {
      marginBottom: 15,
      fontSize: 10,
      lineHeight: 1.5,
    },
    bulletPoint: {
      fontSize: 9,
      marginBottom: 2,
      textIndent: -10,
      paddingLeft: 10,
    },
    footer: {
      marginTop: 20,
      textAlign: 'center',
      fontSize: 8,
      color: '#999999',
    },
  });
};

// Main component for Resume PDF Generation
const ResumePDF = ({ formState, template }: { formState: ResumeFormState; template: TemplateType }) => {
  const styles = createPdfStyles(template);
  
  // Split bullet points for job descriptions and project descriptions
  const formatBulletPoints = (text: string) => {
    // Split by new lines or bullet points
    const lines = text.split(/\r?\n|•/).filter(line => line.trim().length > 0);
    return lines;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header with personal info */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {formState.personalInfo.fullName || 'Your Name'}
            </Text>
            
            <Text style={styles.headerSubtitle}>
              {formState.personalInfo.title || 'Professional Title'}
            </Text>
            
            <View style={styles.contactInfo}>
              {formState.personalInfo.email && (
                <Text style={styles.contactItem}>
                  {formState.personalInfo.email}
                </Text>
              )}
              
              {formState.personalInfo.phone && (
                <Text style={styles.contactItem}>
                  {formState.personalInfo.phone}
                </Text>
              )}
              
              {formState.personalInfo.location && (
                <Text style={styles.contactItem}>
                  {formState.personalInfo.location}
                </Text>
              )}
              
              {formState.personalInfo.linkedin && (
                <Text style={styles.contactItem}>
                  {formState.personalInfo.linkedin}
                </Text>
              )}
              
              {formState.personalInfo.website && (
                <Text style={styles.contactItem}>
                  {formState.personalInfo.website}
                </Text>
              )}
            </View>
          </View>

          {/* Summary Section */}
          {formState.personalInfo.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={styles.summary}>{formState.personalInfo.summary}</Text>
            </View>
          )}

          {/* Skills Section */}
          {formState.skills.some(skill => skill.name.trim() !== '') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {formState.skills.map((skill, index) => (
                  skill.name.trim() !== '' && (
                    <Text key={index} style={styles.skill}>
                      {skill.name}
                    </Text>
                  )
                ))}
              </View>
            </View>
          )}

          {/* Based on template type, adjust the order of sections */}
          {template.layoutType === 'education-focused' ? (
            <>
              {/* Education Section - Prioritized for student template */}
              {formState.education.some(edu => edu.institution.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {formState.education.map((edu, index) => (
                    edu.institution.trim() !== '' && (
                      <View key={index} style={styles.educationItem}>
                        <View style={styles.educationHeader}>
                          <Text style={styles.educationDegree}>
                            {edu.degree || 'Degree'}
                          </Text>
                          <Text style={styles.educationDate}>
                            {edu.from}{edu.to ? ` - ${edu.to}` : ' - Present'}
                          </Text>
                        </View>
                        <Text style={styles.educationInstitution}>
                          {edu.institution || 'Institution'}
                        </Text>
                        {edu.location && (
                          <Text style={styles.educationLocation}>
                            {edu.location}
                          </Text>
                        )}
                        {edu.description && (
                          <Text style={styles.educationDescription}>
                            {edu.description}
                          </Text>
                        )}
                      </View>
                    )
                  ))}
                </View>
              )}

              {/* Experience Section */}
              {formState.experience.some(exp => exp.company.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {formState.experience.map((exp, index) => (
                    exp.company.trim() !== '' && (
                      <View key={index} style={styles.experienceItem}>
                        <View style={styles.experienceHeader}>
                          <Text style={styles.experienceTitle}>
                            {exp.title || 'Position'} {exp.company ? `at ${exp.company}` : ''}
                          </Text>
                          <Text style={styles.experienceDate}>
                            {exp.from}{exp.current ? ' - Present' : exp.to ? ` - ${exp.to}` : ''}
                          </Text>
                        </View>
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {exp.location}
                          </Text>
                        )}
                        {exp.description && formatBulletPoints(exp.description).map((point, i) => (
                          <Text key={i} style={styles.bulletPoint}>
                            • {point.trim()}
                          </Text>
                        ))}
                      </View>
                    )
                  ))}
                </View>
              )}
            </>
          ) : template.layoutType === 'skills-focused' ? (
            <>
              {/* Experience Section */}
              {formState.experience.some(exp => exp.company.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {formState.experience.map((exp, index) => (
                    exp.company.trim() !== '' && (
                      <View key={index} style={styles.experienceItem}>
                        <View style={styles.experienceHeader}>
                          <Text style={styles.experienceTitle}>
                            {exp.title || 'Position'} {exp.company ? `at ${exp.company}` : ''}
                          </Text>
                          <Text style={styles.experienceDate}>
                            {exp.from}{exp.current ? ' - Present' : exp.to ? ` - ${exp.to}` : ''}
                          </Text>
                        </View>
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {exp.location}
                          </Text>
                        )}
                        {exp.description && formatBulletPoints(exp.description).map((point, i) => (
                          <Text key={i} style={styles.bulletPoint}>
                            • {point.trim()}
                          </Text>
                        ))}
                      </View>
                    )
                  ))}
                </View>
              )}

              {/* Education Section */}
              {formState.education.some(edu => edu.institution.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {formState.education.map((edu, index) => (
                    edu.institution.trim() !== '' && (
                      <View key={index} style={styles.educationItem}>
                        <View style={styles.educationHeader}>
                          <Text style={styles.educationDegree}>
                            {edu.degree || 'Degree'}
                          </Text>
                          <Text style={styles.educationDate}>
                            {edu.from}{edu.to ? ` - ${edu.to}` : ' - Present'}
                          </Text>
                        </View>
                        <Text style={styles.educationInstitution}>
                          {edu.institution || 'Institution'}
                        </Text>
                        {edu.location && (
                          <Text style={styles.educationLocation}>
                            {edu.location}
                          </Text>
                        )}
                        {edu.description && (
                          <Text style={styles.educationDescription}>
                            {edu.description}
                          </Text>
                        )}
                      </View>
                    )
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Experience Section - Default for most templates */}
              {formState.experience.some(exp => exp.company.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {formState.experience.map((exp, index) => (
                    exp.company.trim() !== '' && (
                      <View key={index} style={styles.experienceItem}>
                        <View style={styles.experienceHeader}>
                          <Text style={styles.experienceTitle}>
                            {exp.title || 'Position'} {exp.company ? `at ${exp.company}` : ''}
                          </Text>
                          <Text style={styles.experienceDate}>
                            {exp.from}{exp.current ? ' - Present' : exp.to ? ` - ${exp.to}` : ''}
                          </Text>
                        </View>
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {exp.location}
                          </Text>
                        )}
                        {exp.description && formatBulletPoints(exp.description).map((point, i) => (
                          <Text key={i} style={styles.bulletPoint}>
                            • {point.trim()}
                          </Text>
                        ))}
                      </View>
                    )
                  ))}
                </View>
              )}

              {/* Education Section */}
              {formState.education.some(edu => edu.institution.trim() !== '') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {formState.education.map((edu, index) => (
                    edu.institution.trim() !== '' && (
                      <View key={index} style={styles.educationItem}>
                        <View style={styles.educationHeader}>
                          <Text style={styles.educationDegree}>
                            {edu.degree || 'Degree'}
                          </Text>
                          <Text style={styles.educationDate}>
                            {edu.from}{edu.to ? ` - ${edu.to}` : ' - Present'}
                          </Text>
                        </View>
                        <Text style={styles.educationInstitution}>
                          {edu.institution || 'Institution'}
                        </Text>
                        {edu.location && (
                          <Text style={styles.educationLocation}>
                            {edu.location}
                          </Text>
                        )}
                        {edu.description && (
                          <Text style={styles.educationDescription}>
                            {edu.description}
                          </Text>
                        )}
                      </View>
                    )
                  ))}
                </View>
              )}
            </>
          )}

          {/* Projects Section - for all templates */}
          {formState.projects.some(proj => proj.title.trim() !== '') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {formState.projects.map((proj, index) => (
                proj.title.trim() !== '' && (
                  <View key={index} style={styles.projectItem}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectTitle}>
                        {proj.title || 'Project Title'}
                      </Text>
                    </View>
                    {proj.technologies && (
                      <Text style={styles.projectTech}>
                        Technologies: {proj.technologies}
                      </Text>
                    )}
                    {proj.description && (
                      <Text style={styles.projectDescription}>
                        {proj.description}
                      </Text>
                    )}
                    {proj.link && (
                      <Text style={styles.projectLink}>
                        {proj.link}
                      </Text>
                    )}
                  </View>
                )
              ))}
            </View>
          )}
          
          {/* Footer with generation note */}
          <Text style={styles.footer}>
            Created with PathWise Resume Builder
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper component that renders a download button for the PDF
export const ResumeDownloadButton = ({ 
  formState, 
  template, 
  isLoading, 
  fileName 
}: { 
  formState: ResumeFormState; 
  template: TemplateType; 
  isLoading: boolean;
  fileName: string;
}) => {
  return (
    <PDFDownloadLink 
      document={<ResumePDF formState={formState} template={template} />}
      fileName={fileName}
      className="w-full"
    >
      {({ loading, error }) => (
        <Button 
          size="lg" 
          disabled={isLoading || loading} 
          className="w-full"
        >
          {(isLoading || loading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Resume PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default ResumePDF;