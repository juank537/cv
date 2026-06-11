"use client";

import { useState, useEffect, useCallback } from "react";
import { CVData, PersonalInfo, WorkExperience, Education, Training, SkillEntry, Skills, Language, Project } from "@/lib/cv-types";
import { translations, Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  FileDown,
  Pencil,
  Save,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Code2,
  Languages as LanguagesIcon,
  Award,
  ChevronRight,
  Camera,
  User,
  FolderGit2,
  ExternalLink,
  Image,
} from "lucide-react";

const t = (locale: Locale, key: keyof typeof translations.es) => translations[locale][key];

export default function CVPage() {
  const [cv, setCv] = useState<CVData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [locale, setLocale] = useState<Locale>("es");
  const { toast } = useToast();

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      const res = await fetch("/api/cv");
      const data = await res.json();
      setCv(data);
    } catch {
      toast({ title: t(locale, "error"), description: t(locale, "cvLoadError"), variant: "destructive" });
    }
  };

  const saveCV = useCallback(async () => {
    if (!cv) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cv),
      });
      if (res.ok) {
        toast({ title: t(locale, "saved"), description: t(locale, "cvSaved") });
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: t(locale, "error"), description: t(locale, "cvSaveError"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [cv, locale, toast]);

  const exportWord = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export/word?locale=${locale}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CV_Juan_Carlos_Aliaga_Harvard.docx";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t(locale, "downloaded"), description: t(locale, "wordDownloaded") });
    } catch {
      toast({ title: t(locale, "error"), description: t(locale, "wordExportError"), variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: cv, locale }),
      });
      if (!res.ok) throw new Error();
      const html = await res.text();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
      }
      toast({ title: "PDF", description: t(locale, "pdfOpening") });
    } catch {
      toast({ title: t(locale, "error"), description: t(locale, "pdfExportError"), variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Update helpers
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    if (!cv) return;
    setCv({ ...cv, personal_info: { ...cv.personal_info, [field]: value } });
  };

  const updateSummary = (value: string) => {
    if (!cv) return;
    setCv({ ...cv, summary: value });
  };

  const updateWorkExp = (index: number, field: keyof WorkExperience, value: string | boolean | string[]) => {
    if (!cv) return;
    const updated = [...cv.work_experience];
    updated[index] = { ...updated[index], [field]: value };
    setCv({ ...cv, work_experience: updated });
  };

  const updateWorkDesc = (expIndex: number, descIndex: number, value: string) => {
    if (!cv) return;
    const updated = [...cv.work_experience];
    const descs = [...updated[expIndex].descriptions];
    descs[descIndex] = value;
    updated[expIndex] = { ...updated[expIndex], descriptions: descs };
    setCv({ ...cv, work_experience: updated });
  };

  const addWorkDesc = (expIndex: number) => {
    if (!cv) return;
    const updated = [...cv.work_experience];
    updated[expIndex] = { ...updated[expIndex], descriptions: [...updated[expIndex].descriptions, ""] };
    setCv({ ...cv, work_experience: updated });
  };

  const removeWorkDesc = (expIndex: number, descIndex: number) => {
    if (!cv) return;
    const updated = [...cv.work_experience];
    const descs = updated[expIndex].descriptions.filter((_, i) => i !== descIndex);
    updated[expIndex] = { ...updated[expIndex], descriptions: descs };
    setCv({ ...cv, work_experience: updated });
  };

  const addWorkExperience = () => {
    if (!cv) return;
    const newExp: WorkExperience = { id: Date.now().toString(), company: "", position: "", location: "", start_date: "", end_date: "", is_current: false, descriptions: [""] };
    setCv({ ...cv, work_experience: [...cv.work_experience, newExp] });
  };

  const removeWorkExperience = (index: number) => {
    if (!cv) return;
    setCv({ ...cv, work_experience: cv.work_experience.filter((_, i) => i !== index) });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (!cv) return;
    const updated = [...cv.education];
    updated[index] = { ...updated[index], [field]: value };
    setCv({ ...cv, education: updated });
  };

  const addEducation = () => {
    if (!cv) return;
    const newEdu: Education = { id: Date.now().toString(), institution: "", degree: "", location: "", start_date: "", end_date: "", description: "" };
    setCv({ ...cv, education: [...cv.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!cv) return;
    setCv({ ...cv, education: cv.education.filter((_, i) => i !== index) });
  };

  const updateTraining = (index: number, field: keyof Training, value: string) => {
    if (!cv) return;
    const updated = [...cv.complementary_training];
    updated[index] = { ...updated[index], [field]: value };
    setCv({ ...cv, complementary_training: updated });
  };

  const addTraining = () => {
    if (!cv) return;
    const newTrain: Training = { id: Date.now().toString(), course: "", institution: "", date: "" };
    setCv({ ...cv, complementary_training: [...cv.complementary_training, newTrain] });
  };

  const removeTraining = (index: number) => {
    if (!cv) return;
    setCv({ ...cv, complementary_training: cv.complementary_training.filter((_, i) => i !== index) });
  };

  const updateSkill = (category: keyof Skills, index: number, field: string, value: string) => {
    if (!cv) return;
    const updated = { ...cv.skills };
    if (category === "programming_languages" || category === "frameworks") {
      const arr = [...(updated[category] as SkillEntry[])];
      arr[index] = { ...arr[index], [field]: value };
      (updated[category] as SkillEntry[]) = arr;
    } else if (category === "databases" || category === "tools" || category === "other") {
      const arr = [...(updated[category] as string[])];
      arr[index] = value;
      (updated[category] as string[]) = arr;
    }
    setCv({ ...cv, skills: updated });
  };

  const addSkillEntry = (category: keyof Skills) => {
    if (!cv) return;
    const updated = { ...cv.skills };
    if (category === "programming_languages" || category === "frameworks") {
      (updated[category] as SkillEntry[]) = [...(updated[category] as SkillEntry[]), { name: "", level: "" }];
    } else {
      (updated[category] as string[]) = [...(updated[category] as string[]), ""];
    }
    setCv({ ...cv, skills: updated });
  };

  const removeSkillEntry = (category: keyof Skills, index: number) => {
    if (!cv) return;
    const updated = { ...cv.skills };
    if (category === "programming_languages" || category === "frameworks") {
      (updated[category] as SkillEntry[]) = (updated[category] as SkillEntry[]).filter((_, i) => i !== index);
    } else {
      (updated[category] as string[]) = (updated[category] as string[]).filter((_, i) => i !== index);
    }
    setCv({ ...cv, skills: updated });
  };

  const updateLanguageEntry = (index: number, field: keyof Language, value: string) => {
    if (!cv) return;
    const updated = [...cv.languages];
    updated[index] = { ...updated[index], [field]: value };
    setCv({ ...cv, languages: updated });
  };

  const addLanguage = () => {
    if (!cv) return;
    setCv({ ...cv, languages: [...cv.languages, { language: "", proficiency: "" }] });
  };

  const removeLanguage = (index: number) => {
    if (!cv) return;
    setCv({ ...cv, languages: cv.languages.filter((_, i) => i !== index) });
  };

  // Project helpers
  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    if (!cv) return;
    const updated = [...cv.projects];
    updated[index] = { ...updated[index], [field]: value };
    setCv({ ...cv, projects: updated });
  };

  const updateProjectTech = (projIndex: number, techIndex: number, value: string) => {
    if (!cv) return;
    const updated = [...cv.projects];
    const techs = [...updated[projIndex].technologies];
    techs[techIndex] = value;
    updated[projIndex] = { ...updated[projIndex], technologies: techs };
    setCv({ ...cv, projects: updated });
  };

  const addProjectTech = (projIndex: number) => {
    if (!cv) return;
    const updated = [...cv.projects];
    updated[projIndex] = { ...updated[projIndex], technologies: [...updated[projIndex].technologies, ""] };
    setCv({ ...cv, projects: updated });
  };

  const removeProjectTech = (projIndex: number, techIndex: number) => {
    if (!cv) return;
    const updated = [...cv.projects];
    updated[projIndex] = { ...updated[projIndex], technologies: updated[projIndex].technologies.filter((_, i) => i !== techIndex) };
    setCv({ ...cv, projects: updated });
  };

  const addProject = () => {
    if (!cv) return;
    const newProj: Project = { id: Date.now().toString(), name: "", description: "", description_en: "", technologies: [""], github_url: "", live_url: "", thumbnail: "" };
    setCv({ ...cv, projects: [...cv.projects, newProj] });
  };

  const removeProject = (index: number) => {
    if (!cv) return;
    setCv({ ...cv, projects: cv.projects.filter((_, i) => i !== index) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t(locale, "error"), description: t(locale, "imageTypeError"), variant: "destructive" });
      return;
    }
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/cv/upload-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const timestamp = Date.now();
      setCv({ ...cv, personal_info: { ...cv.personal_info, profile_image: `${data.path}?t=${timestamp}` } });
      toast({ title: t(locale, "imageUpdatedTitle"), description: t(locale, "imageUpdated") });
    } catch {
      toast({ title: t(locale, "error"), description: t(locale, "imageUpdateError"), variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Helper to get locale-aware content
  const getSummary = () => locale === "en" && cv?.summary_en ? cv.summary_en : cv?.summary || "";
  const getTitle = () => locale === "en" && cv?.personal_info.title_en ? cv.personal_info.title_en : cv?.personal_info.title || "";
  const getProjectDesc = (p: Project) => locale === "en" && p.description_en ? p.description_en : p.description;

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-muted-foreground">
          <span className="text-primary">$</span> {t(locale, "loading")}<span className="cursor-blink"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary font-semibold">~/cv</span>
            <span className="text-muted-foreground/50">$</span>
            <span className="text-foreground">{isEditing ? t(locale, "editMode") : t(locale, "viewMode")}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocale(locale === "es" ? "en" : "es")}
              className="gap-1.5 text-xs font-mono"
            >
              <LanguagesIcon className="h-3.5 w-3.5" />
              {locale === "es" ? "EN" : "ES"}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-1.5 text-xs"
            >
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {isEditing ? t(locale, "save") : t(locale, "edit")}
            </Button>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={saveCV} disabled={isSaving} className="gap-1.5 text-xs">
                <Save className="h-3.5 w-3.5" />
                {isSaving ? t(locale, "saving") : t(locale, "saveJson")}
              </Button>
            )}
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={exportWord} disabled={isExporting} className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              {t(locale, "harvardDocx")}
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExporting} className="gap-1.5 text-xs">
              <FileDown className="h-3.5 w-3.5" />
              {t(locale, "harvardPdf")}
            </Button>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start gap-6">
            <div className="relative shrink-0">
              {cv.personal_info.profile_image ? (
                <img src={cv.personal_info.profile_image} alt={cv.personal_info.full_name} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                  <User className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploadingImage} />
                  <Camera className="h-6 w-6 text-white" />
                </label>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {isEditing ? (
                <Input value={cv.personal_info.full_name} onChange={(e) => updatePersonalInfo("full_name", e.target.value)} className="text-3xl font-bold border-dashed h-auto py-1 bg-transparent" style={{ fontSize: "1.875rem" }} />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">{cv.personal_info.full_name}</h1>
              )}
              {isEditing ? (
                <div className="space-y-1">
                  <Input value={cv.personal_info.title} onChange={(e) => updatePersonalInfo("title", e.target.value)} className="text-lg text-muted-foreground border-dashed bg-transparent" placeholder="Título (ES)" />
                  <Input value={cv.personal_info.title_en || ""} onChange={(e) => updatePersonalInfo("title_en", e.target.value)} className="text-sm text-muted-foreground border-dashed bg-transparent" placeholder="Title (EN)" />
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">{getTitle()}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {cv.personal_info.email && <ContactItem icon={<Mail className="h-3.5 w-3.5" />} href={`mailto:${cv.personal_info.email}`} editing={isEditing} value={cv.personal_info.email} onChange={(v) => updatePersonalInfo("email", v)} />}
            {cv.personal_info.phone && <ContactItem icon={<Phone className="h-3.5 w-3.5" />} editing={isEditing} value={cv.personal_info.phone} onChange={(v) => updatePersonalInfo("phone", v)} />}
            {cv.personal_info.address && <ContactItem icon={<MapPin className="h-3.5 w-3.5" />} editing={isEditing} value={cv.personal_info.address} onChange={(v) => updatePersonalInfo("address", v)} />}
            {cv.personal_info.linkedin && <ContactItem icon={<Linkedin className="h-3.5 w-3.5" />} href={cv.personal_info.linkedin} editing={isEditing} value={cv.personal_info.linkedin} onChange={(v) => updatePersonalInfo("linkedin", v)} label="LinkedIn" />}
            {cv.personal_info.github && <ContactItem icon={<Github className="h-3.5 w-3.5" />} href={cv.personal_info.github} editing={isEditing} value={cv.personal_info.github} onChange={(v) => updatePersonalInfo("github", v)} label="GitHub" />}
            {cv.personal_info.website && <ContactItem icon={<Globe className="h-3.5 w-3.5" />} href={cv.personal_info.website} editing={isEditing} value={cv.personal_info.website} onChange={(v) => updatePersonalInfo("website", v)} />}
          </div>
        </header>

        {/* Summary */}
        <CvSection title={t(locale, "aboutMe")} icon={<Code2 className="h-4 w-4" />}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea value={cv.summary} onChange={(e) => updateSummary(e.target.value)} className="min-h-[100px] border-dashed text-sm leading-relaxed" placeholder="Resumen (ES)" />
              <Textarea value={cv.summary_en || ""} onChange={(e) => setCv({ ...cv, summary_en: e.target.value })} className="min-h-[80px] border-dashed text-sm leading-relaxed border-blue-200" placeholder="Summary (EN)" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90">{getSummary()}</p>
          )}
        </CvSection>

        {/* Work Experience */}
        <CvSection title={t(locale, "experience")} icon={<Briefcase className="h-4 w-4" />}>
          <div className="space-y-6">
            {cv.work_experience.map((exp, i) => (
              <div key={exp.id} className="relative pl-4 border-l-2 border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={exp.position} onChange={(e) => updateWorkExp(i, "position", e.target.value)} className="font-semibold border-dashed" placeholder={t(locale, "position")} />
                        <Input value={exp.company} onChange={(e) => updateWorkExp(i, "company", e.target.value)} className="text-muted-foreground border-dashed" placeholder={t(locale, "company")} />
                        <div className="flex gap-2">
                          <Input value={exp.start_date} onChange={(e) => updateWorkExp(i, "start_date", e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "startDate")} />
                          <Input value={exp.end_date} onChange={(e) => updateWorkExp(i, "end_date", e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "endDate")} />
                          <Input value={exp.location} onChange={(e) => updateWorkExp(i, "location", e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "location")} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground">{exp.position}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{exp.start_date} — {exp.is_current ? t(locale, "present") : exp.end_date}</p>
                      </>
                    )}
                  </div>
                  {isEditing && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => removeWorkExperience(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.descriptions.map((desc, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground/85">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                      {isEditing ? (
                        <div className="flex-1 flex gap-1">
                          <Input value={desc} onChange={(e) => updateWorkDesc(i, j, e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "description")} />
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive/70 hover:text-destructive" onClick={() => removeWorkDesc(i, j)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      ) : <span>{desc}</span>}
                    </li>
                  ))}
                  {isEditing && <li><Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7" onClick={() => addWorkDesc(i)}><Plus className="h-3 w-3" /> {t(locale, "addPoint")}</Button></li>}
                </ul>
              </div>
            ))}
            {isEditing && <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addWorkExperience}><Plus className="h-3.5 w-3.5" /> {t(locale, "addExperience")}</Button>}
          </div>
        </CvSection>

        {/* Education */}
        <CvSection title={t(locale, "education")} icon={<GraduationCap className="h-4 w-4" />}>
          <div className="space-y-4">
            {cv.education.map((edu, i) => (
              <div key={edu.id} className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="font-semibold border-dashed" placeholder={t(locale, "degree")} />
                      <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} className="text-muted-foreground border-dashed" placeholder={t(locale, "institution")} />
                      <div className="flex gap-2">
                        <Input value={edu.end_date} onChange={(e) => updateEducation(i, "end_date", e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "yearEnd")} />
                        <Input value={edu.location} onChange={(e) => updateEducation(i, "location", e.target.value)} className="border-dashed text-sm" placeholder={t(locale, "location")} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>
                      <p className="text-xs text-muted-foreground/70">{edu.end_date}</p>
                    </>
                  )}
                </div>
                {isEditing && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => removeEducation(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            ))}
            {isEditing && <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addEducation}><Plus className="h-3.5 w-3.5" /> {t(locale, "addEducation")}</Button>}
          </div>
        </CvSection>

        {/* Skills */}
        <CvSection title={t(locale, "skills")} icon={<Code2 className="h-4 w-4" />}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t(locale, "programmingLanguages")}</p>
              <div className="flex flex-wrap gap-2">
                {cv.skills.programming_languages.map((skill, i) => isEditing ? (
                  <div key={i} className="flex items-center gap-1">
                    <Input value={skill.name} onChange={(e) => updateSkill("programming_languages", i, "name", e.target.value)} className="w-24 h-7 text-xs border-dashed" placeholder={t(locale, "name")} />
                    <Input value={skill.level} onChange={(e) => updateSkill("programming_languages", i, "level", e.target.value)} className="w-20 h-7 text-xs border-dashed" placeholder={t(locale, "level")} />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeSkillEntry("programming_languages", i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ) : <Badge key={i} variant="secondary" className="font-normal text-xs">{skill.name} <span className="ml-1 text-muted-foreground">({skill.level})</span></Badge>)}
                {isEditing && <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addSkillEntry("programming_languages")}><Plus className="h-3 w-3" /></Button>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t(locale, "frameworks")}</p>
              <div className="flex flex-wrap gap-2">
                {cv.skills.frameworks.map((skill, i) => isEditing ? (
                  <div key={i} className="flex items-center gap-1">
                    <Input value={skill.name} onChange={(e) => updateSkill("frameworks", i, "name", e.target.value)} className="w-24 h-7 text-xs border-dashed" placeholder={t(locale, "name")} />
                    <Input value={skill.level} onChange={(e) => updateSkill("frameworks", i, "level", e.target.value)} className="w-20 h-7 text-xs border-dashed" placeholder={t(locale, "level")} />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeSkillEntry("frameworks", i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ) : <Badge key={i} variant="secondary" className="font-normal text-xs">{skill.name} <span className="ml-1 text-muted-foreground">({skill.level})</span></Badge>)}
                {isEditing && <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addSkillEntry("frameworks")}><Plus className="h-3 w-3" /></Button>}
              </div>
            </div>
            {([["databases", t(locale, "databases")], ["tools", t(locale, "tools")], ["other", t(locale, "other")]] as [keyof Skills, string][]).map(([cat, label]) => (
              <div key={cat}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {(cv.skills[cat] as string[]).map((item, i) => isEditing ? (
                    <div key={i} className="flex items-center gap-1">
                      <Input value={item} onChange={(e) => updateSkill(cat, i, "", e.target.value)} className="w-28 h-7 text-xs border-dashed" />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeSkillEntry(cat, i)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ) : <Badge key={i} variant="outline" className="font-normal text-xs">{item}</Badge>)}
                  {isEditing && <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addSkillEntry(cat)}><Plus className="h-3 w-3" /></Button>}
                </div>
              </div>
            ))}
          </div>
        </CvSection>

        {/* Portfolio */}
        <CvSection title={t(locale, "portfolio")} icon={<FolderGit2 className="h-4 w-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cv.projects.map((proj, i) => (
              <div key={proj.id} className="group relative border border-border rounded-lg overflow-hidden bg-card hover:border-foreground/20 transition-colors">
                {/* Thumbnail */}
                <div className="aspect-video bg-muted/50 relative overflow-hidden">
                  {proj.thumbnail ? (
                    <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Overlay links */}
                  {!isEditing && (proj.github_url || proj.live_url) && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {proj.github_url && (
                        <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-foreground/80 transition-colors">
                          <Github className="h-6 w-6" />
                        </a>
                      )}
                      {proj.live_url && (
                        <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-foreground/80 transition-colors">
                          <ExternalLink className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={proj.name} onChange={(e) => updateProject(i, "name", e.target.value)} className="font-semibold border-dashed text-sm" placeholder={t(locale, "project")} />
                      <Textarea value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} className="border-dashed text-xs min-h-[60px]" placeholder={`${t(locale, "projectDescription")} (ES)`} />
                      <Textarea value={proj.description_en || ""} onChange={(e) => updateProject(i, "description_en", e.target.value)} className="border-dashed text-xs min-h-[50px] border-blue-200" placeholder={`${t(locale, "projectDescription")} (EN)`} />
                      <Input value={proj.thumbnail} onChange={(e) => updateProject(i, "thumbnail", e.target.value)} className="border-dashed text-xs" placeholder={t(locale, "thumbnail")} />
                      <Input value={proj.github_url} onChange={(e) => updateProject(i, "github_url", e.target.value)} className="border-dashed text-xs" placeholder={t(locale, "githubUrl")} />
                      <Input value={proj.live_url} onChange={(e) => updateProject(i, "live_url", e.target.value)} className="border-dashed text-xs" placeholder={t(locale, "liveUrl")} />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t(locale, "technologies")}:</p>
                        {proj.technologies.map((tech, j) => (
                          <div key={j} className="flex items-center gap-1">
                            <Input value={tech} onChange={(e) => updateProjectTech(i, j, e.target.value)} className="h-6 text-xs border-dashed flex-1" />
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/70 hover:text-destructive" onClick={() => removeProjectTech(i, j)}><Trash2 className="h-2.5 w-2.5" /></Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="h-5 text-xs gap-0.5" onClick={() => addProjectTech(i)}><Plus className="h-2.5 w-2.5" /></Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-sm text-foreground mb-1">{proj.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{getProjectDesc(proj)}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.filter(t => t).map((tech, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] font-normal px-1.5 py-0">{tech}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 text-destructive/70 hover:text-destructive" onClick={() => removeProject(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isEditing && <Button variant="outline" size="sm" className="gap-1.5 text-xs mt-4" onClick={addProject}><Plus className="h-3.5 w-3.5" /> {t(locale, "addProject")}</Button>}
        </CvSection>

        {/* Training */}
        {cv.complementary_training.length > 0 && (
          <CvSection title={t(locale, "training")} icon={<Award className="h-4 w-4" />}>
            <div className="space-y-3">
              {cv.complementary_training.map((train, i) => (
                <div key={train.id} className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={train.course} onChange={(e) => updateTraining(i, "course", e.target.value)} className="font-semibold border-dashed text-sm" placeholder={t(locale, "course")} />
                        <div className="flex gap-2">
                          <Input value={train.institution} onChange={(e) => updateTraining(i, "institution", e.target.value)} className="text-muted-foreground border-dashed text-sm" placeholder={t(locale, "institution")} />
                          <Input value={train.date} onChange={(e) => updateTraining(i, "date", e.target.value)} className="border-dashed text-sm w-32" placeholder={t(locale, "date")} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-sm">{train.course}</h3>
                        <p className="text-xs text-muted-foreground">{train.institution} — {train.date}</p>
                      </>
                    )}
                  </div>
                  {isEditing && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => removeTraining(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              ))}
              {isEditing && <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addTraining}><Plus className="h-3.5 w-3.5" /> {t(locale, "addTraining")}</Button>}
            </div>
          </CvSection>
        )}

        {/* Languages */}
        <CvSection title={t(locale, "languages")} icon={<LanguagesIcon className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-4">
            {cv.languages.map((lang, i) => isEditing ? (
              <div key={i} className="flex items-center gap-1">
                <Input value={lang.language} onChange={(e) => updateLanguageEntry(i, "language", e.target.value)} className="w-24 h-7 text-xs border-dashed" placeholder={t(locale, "language")} />
                <Input value={lang.proficiency} onChange={(e) => updateLanguageEntry(i, "proficiency", e.target.value)} className="w-28 h-7 text-xs border-dashed" placeholder={t(locale, "proficiency")} />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeLanguage(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{lang.language}</span>
                <span className="text-muted-foreground">— {lang.proficiency}</span>
              </div>
            ))}
            {isEditing && <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addLanguage}><Plus className="h-3 w-3" /></Button>}
          </div>
        </CvSection>

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-border text-center text-xs text-muted-foreground/50">
          <p>{t(locale, "footerPath")} <span className="text-muted-foreground/30">|</span> {t(locale, "lastModified")}: {new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}</p>
        </footer>
      </main>
    </div>
  );
}

function CvSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground/60">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-wider section-marker">{title}</h2>
      </div>
      <Separator className="mb-4" />
      {children}
    </section>
  );
}

function ContactItem({ icon, href, editing, value, onChange, label }: { icon: React.ReactNode; href?: string; editing: boolean; value: string; onChange: (v: string) => void; label?: string }) {
  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        {icon}
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs border-dashed max-w-[200px]" placeholder={label || "Valor"} />
      </div>
    );
  }
  const displayText = label || value;
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline text-foreground/80">{displayText}</a>
      ) : (
        <span className="text-foreground/80">{displayText}</span>
      )}
    </div>
  );
}
