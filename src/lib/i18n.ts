export type Locale = "es" | "en";

export const translations = {
  es: {
    // Toolbar
    editMode: "vim edit",
    viewMode: "cat view",
    edit: "Editar",
    save: "Guardar",
    saveJson: "Guardar JSON",
    saving: "Guardando...",
    harvardDocx: "Harvard .docx",
    harvardPdf: "Harvard .pdf",

    // Loading
    loading: "cargando_cv",

    // Sections
    aboutMe: "Sobre mí",
    experience: "Experiencia Profesional",
    education: "Educación",
    skills: "Habilidades",
    training: "Formación Complementaria",
    languages: "Idiomas",
    portfolio: "Portafolio",

    // Skills sub-categories
    programmingLanguages: "Lenguajes de Programación",
    frameworks: "Frameworks",
    databases: "Bases de Datos",
    tools: "Herramientas",
    other: "Otros",

    // Placeholders
    position: "Posición",
    company: "Empresa",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    location: "Ubicación",
    description: "Descripción",
    institution: "Institución",
    degree: "Título",
    yearEnd: "Año finalización",
    course: "Curso",
    date: "Fecha",
    name: "Nombre",
    level: "Nivel",
    value: "Valor",
    language: "Idioma",
    proficiency: "Nivel",
    addPoint: "Añadir punto",
    addExperience: "Añadir experiencia",
    addEducation: "Añadir educación",
    addTraining: "Añadir formación",
    addProject: "Añadir proyecto",
    project: "Proyecto",
    projectDescription: "Descripción del proyecto",
    technologies: "Tecnologías",
    thumbnail: "Miniatura (URL)",
    githubUrl: "URL GitHub",
    liveUrl: "URL Demo",

    // Messages
    cvSaved: "CV actualizado correctamente",
    saved: "Guardado",
    error: "Error",
    cvLoadError: "No se pudo cargar el CV",
    cvSaveError: "No se pudo guardar el CV",
    wordDownloaded: "CV Word (Harvard) descargado",
    downloaded: "Descargado",
    wordExportError: "No se pudo exportar a Word",
    pdfOpening: "Abriendo vista para imprimir como PDF",
    pdfExportError: "No se pudo exportar a PDF",
    imageUpdated: "Foto de perfil actualizada",
    imageUpdateError: "No se pudo subir la imagen",
    imageTypeError: "El archivo debe ser una imagen",
    imageUpdatedTitle: "Imagen actualizada",
    present: "Actualidad",
    lastModified: "última modificación",

    // Footer
    footerPath: "~/cv/curriculum.json",
  },
  en: {
    // Toolbar
    editMode: "vim edit",
    viewMode: "cat view",
    edit: "Edit",
    save: "Save",
    saveJson: "Save JSON",
    saving: "Saving...",
    harvardDocx: "Harvard .docx",
    harvardPdf: "Harvard .pdf",

    // Loading
    loading: "loading_cv",

    // Sections
    aboutMe: "About Me",
    experience: "Professional Experience",
    education: "Education",
    skills: "Skills",
    training: "Professional Development",
    languages: "Languages",
    portfolio: "Portfolio",

    // Skills sub-categories
    programmingLanguages: "Programming Languages",
    frameworks: "Frameworks",
    databases: "Databases",
    tools: "Tools",
    other: "Other",

    // Placeholders
    position: "Position",
    company: "Company",
    startDate: "Start date",
    endDate: "End date",
    location: "Location",
    description: "Description",
    institution: "Institution",
    degree: "Degree",
    yearEnd: "Completion year",
    course: "Course",
    date: "Date",
    name: "Name",
    level: "Level",
    value: "Value",
    language: "Language",
    proficiency: "Proficiency",
    addPoint: "Add point",
    addExperience: "Add experience",
    addEducation: "Add education",
    addTraining: "Add training",
    addProject: "Add project",
    project: "Project",
    projectDescription: "Project description",
    technologies: "Technologies",
    thumbnail: "Thumbnail (URL)",
    githubUrl: "GitHub URL",
    liveUrl: "Demo URL",

    // Messages
    cvSaved: "CV updated successfully",
    saved: "Saved",
    error: "Error",
    cvLoadError: "Could not load CV",
    cvSaveError: "Could not save CV",
    wordDownloaded: "CV Word (Harvard) downloaded",
    downloaded: "Downloaded",
    wordExportError: "Could not export to Word",
    pdfOpening: "Opening view to print as PDF",
    pdfExportError: "Could not export to PDF",
    imageUpdated: "Profile photo updated",
    imageUpdateError: "Could not upload image",
    imageTypeError: "File must be an image",
    imageUpdatedTitle: "Image updated",
    present: "Present",
    lastModified: "last modified",

    // Footer
    footerPath: "~/cv/curriculum.json",
  },
} as const;

export type TranslationKey = keyof typeof translations.es;
