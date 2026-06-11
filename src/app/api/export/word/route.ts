import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
  ExternalHyperlink,
  ImageRun,
} from "docx";
import { CVData } from "@/lib/cv-types";
import { translations, Locale } from "@/lib/i18n";

const CV_PATH = path.join(process.cwd(), "data", "cv.json");
const t = (locale: Locale, key: keyof typeof translations.es) => translations[locale][key];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "es") as Locale;
    const data = fs.readFileSync(CV_PATH, "utf-8");
    const cv: CVData = JSON.parse(data);
    const doc = createHarvardCV(cv, locale);
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="CV_Juan_Carlos_Aliaga_Harvard.docx"',
      },
    });
  } catch (error) {
    console.error("Word export error:", error);
    return NextResponse.json({ error: "Error generating Word document" }, { status: 500 });
  }
}

function createHarvardCV(cv: CVData, locale: Locale): Document {
  const { personal_info, work_experience, education, complementary_training, skills, languages, projects } = cv;
  const summary = locale === "en" && cv.summary_en ? cv.summary_en : cv.summary;

  const sections: (Paragraph | typeof ImageRun)[] = [];

  // Profile image
  if (personal_info.profile_image) {
    try {
      const imagePath = path.join(process.cwd(), "public", personal_info.profile_image.replace(/^\//, "").split("?")[0]);
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({ data: imageBuffer, transformation: { width: 72, height: 72 }, type: "jpg" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          })
        );
      }
    } catch { /* skip */ }
  }

  // Name
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: personal_info.full_name.toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contact line
  const contactParts: (TextRun | typeof ExternalHyperlink)[] = [];
  if (personal_info.email) contactParts.push(new ExternalHyperlink({ children: [new TextRun({ text: personal_info.email, style: "Hyperlink", font: "Times New Roman", size: 20 })], link: `mailto:${personal_info.email}` }));
  if (personal_info.phone) { if (contactParts.length > 0) contactParts.push(new TextRun({ text: " | ", font: "Times New Roman", size: 20 })); contactParts.push(new TextRun({ text: personal_info.phone, font: "Times New Roman", size: 20 })); }
  if (personal_info.address) { if (contactParts.length > 0) contactParts.push(new TextRun({ text: " | ", font: "Times New Roman", size: 20 })); contactParts.push(new TextRun({ text: personal_info.address, font: "Times New Roman", size: 20 })); }
  if (personal_info.linkedin) { if (contactParts.length > 0) contactParts.push(new TextRun({ text: " | ", font: "Times New Roman", size: 20 })); contactParts.push(new ExternalHyperlink({ children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", font: "Times New Roman", size: 20 })], link: personal_info.linkedin })); }
  if (personal_info.github) { if (contactParts.length > 0) contactParts.push(new TextRun({ text: " | ", font: "Times New Roman", size: 20 })); contactParts.push(new ExternalHyperlink({ children: [new TextRun({ text: "GitHub", style: "Hyperlink", font: "Times New Roman", size: 20 })], link: personal_info.github })); }

  sections.push(new Paragraph({ children: contactParts, alignment: AlignmentType.CENTER, spacing: { after: 300 } }));
  sections.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } }, spacing: { after: 200 } }));

  // Summary
  sections.push(new Paragraph({ text: locale === "en" ? "PROFESSIONAL SUMMARY" : "RESUMEN PROFESIONAL", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: summary, font: "Times New Roman", size: 22 })], spacing: { after: 200 } }));

  // Education
  sections.push(new Paragraph({ text: locale === "en" ? "EDUCATION" : "EDUCACIÓN", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  for (const edu of education) {
    sections.push(new Paragraph({ children: [new TextRun({ text: edu.degree, bold: true, font: "Times New Roman", size: 22 })], spacing: { after: 0 }, tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }] }));
    sections.push(new Paragraph({ children: [new TextRun({ text: edu.institution, italics: true, font: "Times New Roman", size: 22 }), edu.location ? new TextRun({ text: `, ${edu.location}`, italics: true, font: "Times New Roman", size: 22 }) : new TextRun({ text: "" }), new TextRun({ text: `\t${edu.end_date}`, font: "Times New Roman", size: 22 })], tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], spacing: { after: 150 } }));
  }

  // Work Experience
  sections.push(new Paragraph({ text: locale === "en" ? "PROFESSIONAL EXPERIENCE" : "EXPERIENCIA PROFESIONAL", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  for (const exp of work_experience) {
    const dateRange = `${exp.start_date} – ${exp.is_current ? t(locale, "present") : exp.end_date}`;
    sections.push(new Paragraph({ children: [new TextRun({ text: exp.position, bold: true, font: "Times New Roman", size: 22 })], spacing: { after: 0 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: exp.company, italics: true, font: "Times New Roman", size: 22 }), exp.location ? new TextRun({ text: `, ${exp.location}`, italics: true, font: "Times New Roman", size: 22 }) : new TextRun({ text: "" }), new TextRun({ text: `\t${dateRange}`, font: "Times New Roman", size: 22 })], tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], spacing: { after: 50 } }));
    for (const desc of exp.descriptions) { sections.push(new Paragraph({ children: [new TextRun({ text: desc, font: "Times New Roman", size: 22 })], bullet: { level: 0 }, spacing: { after: 30 } })); }
    sections.push(new Paragraph({ spacing: { after: 100 } }));
  }

  // Projects / Portfolio
  if (projects.length > 0) {
    sections.push(new Paragraph({ text: locale === "en" ? "PROJECTS" : "PROYECTOS", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
    for (const proj of projects) {
      const desc = locale === "en" && proj.description_en ? proj.description_en : proj.description;
      sections.push(new Paragraph({ children: [new TextRun({ text: proj.name, bold: true, font: "Times New Roman", size: 22 })], spacing: { after: 0 } }));
      sections.push(new Paragraph({ children: [new TextRun({ text: desc, font: "Times New Roman", size: 22 })], spacing: { after: 20 } }));
      if (proj.technologies.length > 0) {
        sections.push(new Paragraph({ children: [new TextRun({ text: `${locale === "en" ? "Technologies" : "Tecnologías"}: `, italics: true, font: "Times New Roman", size: 20 }), new TextRun({ text: proj.technologies.filter(t => t).join(", "), font: "Times New Roman", size: 20 })], spacing: { after: 20 } }));
      }
      const links: string[] = [];
      if (proj.github_url) links.push(`GitHub: ${proj.github_url}`);
      if (proj.live_url) links.push(`Demo: ${proj.live_url}`);
      if (links.length > 0) {
        sections.push(new Paragraph({ children: [new TextRun({ text: links.join(" | "), font: "Times New Roman", size: 20, color: "0563C1" })], spacing: { after: 80 } }));
      }
      sections.push(new Paragraph({ spacing: { after: 60 } }));
    }
  }

  // Skills
  sections.push(new Paragraph({ text: locale === "en" ? "SKILLS" : "HABILIDADES", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  const progLangs = skills.programming_languages.map((s) => `${s.name} (${s.level})`).join(", ");
  const frameworks = skills.frameworks.map((s) => `${s.name} (${s.level})`).join(", ");
  sections.push(new Paragraph({ children: [new TextRun({ text: `${t(locale, "programmingLanguages")}: `, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: progLangs, font: "Times New Roman", size: 22 })], spacing: { after: 50 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${t(locale, "frameworks")}: `, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: frameworks, font: "Times New Roman", size: 22 })], spacing: { after: 50 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${t(locale, "databases")}: `, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: skills.databases.join(", "), font: "Times New Roman", size: 22 })], spacing: { after: 50 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${t(locale, "tools")}: `, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: skills.tools.join(", "), font: "Times New Roman", size: 22 })], spacing: { after: 50 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: `${t(locale, "other")}: `, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: skills.other.join(", "), font: "Times New Roman", size: 22 })], spacing: { after: 200 } }));

  // Training
  if (complementary_training.length > 0) {
    sections.push(new Paragraph({ text: locale === "en" ? "PROFESSIONAL DEVELOPMENT" : "FORMACIÓN COMPLEMENTARIA", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
    for (const train of complementary_training) {
      sections.push(new Paragraph({ children: [new TextRun({ text: train.course, bold: true, font: "Times New Roman", size: 22 }), new TextRun({ text: `. ${train.institution}`, font: "Times New Roman", size: 22 }), new TextRun({ text: `\t${train.date}`, font: "Times New Roman", size: 22 })], tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }], spacing: { after: 80 } }));
    }
  }

  // Languages
  sections.push(new Paragraph({ text: locale === "en" ? "LANGUAGES" : "IDIOMAS", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  sections.push(new Paragraph({ children: [new TextRun({ text: languages.map((l) => `${l.language}: ${l.proficiency}`).join(" | "), font: "Times New Roman", size: 22 })], spacing: { after: 200 } }));

  return new Document({
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: sections }],
  });
}
