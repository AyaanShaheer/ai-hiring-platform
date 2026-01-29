import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FormStep from '../../components/resume-builder/FormStep';
import SkillInput from '../../components/resume-builder/SkillInput';
import ExperienceForm from '../../components/resume-builder/ExperienceForm';
import EducationForm from '../../components/resume-builder/EducationForm';
import { ArrowLeft, Plus } from 'lucide-react';
import { resumeBuilderService } from '../../services/resumeBuilderService';
import type {
    ResumeCreate,
    PersonalInfo,
    WorkExperience,
    Education,
    Skills,
    Language,
    Certification,
    Project,
    CountryCode,
} from '../../types/resume';
import { getCountryFlag } from '../../utils/resumeHelpers';

const CreateResumePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = parseInt(searchParams.get('template') || '1');

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        full_name: '',
        email: '',
        phone: '',
        location: { city: '', country: '' },
        linkedin: '',
        website: '',
    });

    const [targetJobTitle, setTargetJobTitle] = useState('');
    const [targetIndustry, setTargetIndustry] = useState('');
    const [targetCountry, setTargetCountry] = useState<CountryCode>('US');

    const [workExperience, setWorkExperience] = useState<WorkExperience[]>([{
        title: '',
        company: '',
        location: '',
        duration: '',
        start_date: '',
        end_date: null,
        is_current: false,
        responsibilities: [],
        achievements: [],
    }]);

    const [education, setEducation] = useState<Education[]>([{
        degree: '',
        institution: '',
        location: '',
        year: '',
    }]);

    const [skills, setSkills] = useState<Skills>({
        technical: [],
        soft: [],
        tools: [],
    });

    const [languages, setLanguages] = useState<Language[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [professionalSummary, setProfessionalSummary] = useState('');

    const countries: { value: CountryCode; label: string }[] = [
        { value: 'US', label: 'United States' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'NL', label: 'Netherlands' },
        { value: 'EUROPASS', label: 'Europass' },
    ];

    // Validation for each step
    const canProceedStep1 = personalInfo.full_name && personalInfo.email && personalInfo.location.city;
    const canProceedStep2 = targetJobTitle && targetIndustry;
    const canProceedStep3 = workExperience.length > 0 && workExperience[0].title && workExperience[0].company;
    const canProceedStep4 = education.length > 0 && education[0].degree && education[0].institution;
    const canProceedStep5 = skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0;

    const handleNext = () => {
        if (currentStep < 7) setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        const resumeData: ResumeCreate = {
            template_id: templateId,
            personal_info: personalInfo,
            target_job_title: targetJobTitle,
            target_industry: targetIndustry,
            target_country: targetCountry,
            professional_summary: professionalSummary || undefined,
            work_experience: workExperience,
            education: education,
            skills: skills,
            languages: languages.length > 0 ? languages : undefined,
            certifications: certifications.length > 0 ? certifications : undefined,
            projects: projects.length > 0 ? projects : undefined,
        };

        try {
            setIsSubmitting(true);
            const createdResume = await resumeBuilderService.createResume(resumeData);
            navigate(`/resume-builder/${createdResume.id}?tab=preview`);
        } catch (err: any) {
            console.error('Failed to create resume:', err);
            alert(err.response?.data?.detail || 'Failed to create resume');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addExperience = () => {
        setWorkExperience([...workExperience, {
            title: '',
            company: '',
            location: '',
            duration: '',
            start_date: '',
            end_date: null,
            is_current: false,
            responsibilities: [],
            achievements: [],
        }]);
    };

    const removeExperience = (index: number) => {
        setWorkExperience(prev => prev.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        setEducation([...education, {
            degree: '',
            institution: '',
            location: '',
            year: '',
        }]);
    };

    const removeEducation = (index: number) => {
        setEducation(prev => prev.filter((_, i) => i !== index));
    };

    const addLanguage = () => {
        setLanguages([...languages, { language: '', proficiency: 'Professional' }]);
    };

    const addCertification = () => {
        setCertifications([...certifications, { name: '', issuer: '', year: '' }]);
    };

    const addProject = () => {
        setProjects([...projects, { title: '', description: '', technologies: [] }]);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    icon={<ArrowLeft className="w-5 h-5" />}
                    onClick={() => navigate('/resume-builder/templates')}
                    className="mb-6"
                >
                    Back to Templates
                </Button>

                <FormStep
                    currentStep={currentStep}
                    totalSteps={7}
                    title={
                        currentStep === 1 ? 'Personal Information' :
                            currentStep === 2 ? 'Target Position' :
                                currentStep === 3 ? 'Work Experience' :
                                    currentStep === 4 ? 'Education' :
                                        currentStep === 5 ? 'Skills' :
                                            currentStep === 6 ? 'Additional Information' :
                                                'Review & Create'
                    }
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    canGoNext={
                        currentStep === 1 ? canProceedStep1 :
                            currentStep === 2 ? canProceedStep2 :
                                currentStep === 3 ? canProceedStep3 :
                                    currentStep === 4 ? canProceedStep4 :
                                        currentStep === 5 ? canProceedStep5 :
                                            true
                    }
                >
                    <Card>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <Input
                                    label="Full Name"
                                    value={personalInfo.full_name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={personalInfo.email}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                        placeholder="john@example.com"
                                        required
                                    />
                                    <Input
                                        label="Phone"
                                        type="tel"
                                        value={personalInfo.phone}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="City"
                                        value={personalInfo.location.city}
                                        onChange={(e) => setPersonalInfo({
                                            ...personalInfo,
                                            location: { ...personalInfo.location, city: e.target.value }
                                        })}
                                        placeholder="New York"
                                        required
                                    />
                                    <Input
                                        label="Country"
                                        value={personalInfo.location.country}
                                        onChange={(e) => setPersonalInfo({
                                            ...personalInfo,
                                            location: { ...personalInfo.location, country: e.target.value }
                                        })}
                                        placeholder="USA"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="LinkedIn (Optional)"
                                        value={personalInfo.linkedin || ''}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/johndoe"
                                    />
                                    <Input
                                        label="Website (Optional)"
                                        value={personalInfo.website || ''}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                                        placeholder="https://johndoe.com"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Target Position */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <Input
                                    label="Target Job Title"
                                    value={targetJobTitle}
                                    onChange={(e) => setTargetJobTitle(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer"
                                    required
                                />
                                <Input
                                    label="Target Industry"
                                    value={targetIndustry}
                                    onChange={(e) => setTargetIndustry(e.target.value)}
                                    placeholder="e.g., Technology, Finance, Healthcare"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-dark-200 mb-2">
                                        Target Country
                                    </label>
                                    <select
                                        value={targetCountry}
                                        onChange={(e) => setTargetCountry(e.target.value as CountryCode)}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                    >
                                        {countries.map(c => (
                                            <option key={c.value} value={c.value}>
                                                {getCountryFlag(c.value)} {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-200 mb-2">
                                        Professional Summary (Optional)
                                    </label>
                                    <textarea
                                        value={professionalSummary}
                                        onChange={(e) => setProfessionalSummary(e.target.value)}
                                        placeholder="Brief overview of your professional background..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Work Experience */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                {workExperience.map((exp, index) => (
                                    <ExperienceForm
                                        key={index}
                                        experience={exp}
                                        onChange={(updated) => {
                                            const newExp = [...workExperience];
                                            newExp[index] = updated;
                                            setWorkExperience(newExp);
                                        }}
                                        onRemove={() => removeExperience(index)}
                                        canRemove={workExperience.length > 1}
                                    />
                                ))}
                                <Button
                                    variant="secondary"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={addExperience}
                                    className="w-full"
                                >
                                    Add Another Position
                                </Button>
                            </div>
                        )}

                        {/* Step 4: Education */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                {education.map((edu, index) => (
                                    <EducationForm
                                        key={index}
                                        education={edu}
                                        onChange={(updated) => {
                                            const newEdu = [...education];
                                            newEdu[index] = updated;
                                            setEducation(newEdu);
                                        }}
                                        onRemove={() => removeEducation(index)}
                                        canRemove={education.length > 1}
                                    />
                                ))}
                                <Button
                                    variant="secondary"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={addEducation}
                                    className="w-full"
                                >
                                    Add Education
                                </Button>
                            </div>
                        )}

                        {/* Step 5: Skills */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <SkillInput
                                    label="Technical Skills"
                                    value={skills.technical}
                                    onChange={(updated) => setSkills({ ...skills, technical: updated })}
                                    placeholder="e.g., Python, React, AWS"
                                />
                                <SkillInput
                                    label="Soft Skills"
                                    value={skills.soft}
                                    onChange={(updated) => setSkills({ ...skills, soft: updated })}
                                    placeholder="e.g., Leadership, Communication"
                                />
                                <SkillInput
                                    label="Tools & Software"
                                    value={skills.tools}
                                    onChange={(updated) => setSkills({ ...skills, tools: updated })}
                                    placeholder="e.g., Git, Jira, Docker"
                                />
                            </div>
                        )}

                        {/* Step 6: Additional Information */}
                        {currentStep === 6 && (
                            <div className="space-y-6">
                                {/* Languages */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-dark-200">Languages</label>
                                        <Button variant="ghost" size="sm" onClick={addLanguage} icon={<Plus className="w-4 h-4" />}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {languages.map((lang, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={lang.language}
                                                    onChange={(e) => {
                                                        const updated = [...languages];
                                                        updated[index].language = e.target.value;
                                                        setLanguages(updated);
                                                    }}
                                                    placeholder="Language name"
                                                />
                                                <select
                                                    value={lang.proficiency}
                                                    onChange={(e) => {
                                                        const updated = [...languages];
                                                        updated[index].proficiency = e.target.value as any;
                                                        setLanguages(updated);
                                                    }}
                                                    className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-50"
                                                >
                                                    <option>Native</option>
                                                    <option>Fluent</option>
                                                    <option>Professional</option>
                                                    <option>Basic</option>
                                                </select>
                                                <button
                                                    onClick={() => setLanguages(prev => prev.filter((_, i) => i !== index))}
                                                    className="text-red-400 px-3"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-dark-200">Certifications</label>
                                        <Button variant="ghost" size="sm" onClick={addCertification} icon={<Plus className="w-4 h-4" />}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {certifications.map((cert, index) => (
                                            <div key={index} className="grid grid-cols-3 gap-2">
                                                <Input
                                                    value={cert.name}
                                                    onChange={(e) => {
                                                        const updated = [...certifications];
                                                        updated[index].name = e.target.value;
                                                        setCertifications(updated);
                                                    }}
                                                    placeholder="Certification name"
                                                />
                                                <Input
                                                    value={cert.issuer}
                                                    onChange={(e) => {
                                                        const updated = [...certifications];
                                                        updated[index].issuer = e.target.value;
                                                        setCertifications(updated);
                                                    }}
                                                    placeholder="Issuer"
                                                />
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={cert.year}
                                                        onChange={(e) => {
                                                            const updated = [...certifications];
                                                            updated[index].year = e.target.value;
                                                            setCertifications(updated);
                                                        }}
                                                        placeholder="Year"
                                                    />
                                                    <button
                                                        onClick={() => setCertifications(prev => prev.filter((_, i) => i !== index))}
                                                        className="text-red-400 px-3"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Projects */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-dark-200">Projects</label>
                                        <Button variant="ghost" size="sm" onClick={addProject} icon={<Plus className="w-4 h-4" />}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {projects.map((proj, index) => (
                                            <Card key={index} className="relative">
                                                <button
                                                    onClick={() => setProjects(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute top-3 right-3 text-red-400"
                                                >
                                                    ✕
                                                </button>
                                                <div className="space-y-2 pr-8">
                                                    <Input
                                                        value={proj.title}
                                                        onChange={(e) => {
                                                            const updated = [...projects];
                                                            updated[index].title = e.target.value;
                                                            setProjects(updated);
                                                        }}
                                                        placeholder="Project title"
                                                    />
                                                    <textarea
                                                        value={proj.description}
                                                        onChange={(e) => {
                                                            const updated = [...projects];
                                                            updated[index].description = e.target.value;
                                                            setProjects(updated);
                                                        }}
                                                        placeholder="Project description"
                                                        rows={2}
                                                        className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-50 text-sm"
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 7: Review */}
                        {currentStep === 7 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-dark-50 mb-2">Personal Information</h3>
                                    <p className="text-dark-300">{personalInfo.full_name} • {personalInfo.email}</p>
                                    <p className="text-dark-400 text-sm">{personalInfo.location.city}, {personalInfo.location.country}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-dark-50 mb-2">Target Position</h3>
                                    <p className="text-dark-300">{targetJobTitle} in {targetIndustry}</p>
                                    <p className="text-dark-400 text-sm">{getCountryFlag(targetCountry)} {targetCountry}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-dark-50 mb-2">Work Experience</h3>
                                    <p className="text-dark-400">{workExperience.length} position{workExperience.length > 1 ? 's' : ''}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-dark-50 mb-2">Education</h3>
                                    <p className="text-dark-400">{education.length} entr{education.length > 1 ? 'ies' : 'y'}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-dark-50 mb-2">Skills</h3>
                                    <p className="text-dark-400">
                                        {skills.technical.length + skills.soft.length + skills.tools.length} total skills
                                    </p>
                                </div>
                                <p className="text-sm text-dark-500 italic">
                                    Click "Create Resume" to save. PDF will be generated in the background.
                                </p>
                            </div>
                        )}
                    </Card>
                </FormStep>
            </div>
        </DashboardLayout>
    );
};

export default CreateResumePage;
