export interface PersonalInfo {
  full_name: string;
  title: string;
  title_en: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
  profile_image: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  descriptions: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Training {
  id: string;
  course: string;
  institution: string;
  date: string;
}

export interface SkillEntry {
  name: string;
  level: string;
}

export interface Skills {
  programming_languages: SkillEntry[];
  frameworks: SkillEntry[];
  databases: string[];
  tools: string[];
  other: string[];
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  description_en: string;
  technologies: string[];
  github_url: string;
  live_url: string;
  thumbnail: string;
}

export interface CVData {
  personal_info: PersonalInfo;
  summary: string;
  summary_en: string;
  work_experience: WorkExperience[];
  education: Education[];
  complementary_training: Training[];
  skills: Skills;
  languages: Language[];
  projects: Project[];
}
