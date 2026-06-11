import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CVData } from "@/lib/cv-types";
import { translations, Locale } from "@/lib/i18n";

const CV_PATH = path.join(process.cwd(), "data", "cv.json");
const t = (locale: Locale, key: keyof typeof translations.es) => translations[locale][key];

export async function GET() {
  try {
    const data = fs.readFileSync(CV_PATH, "utf-8");
    const cv: CVData = JSON.parse(data);
    const html = generateHarvardPDF(cv, "es");
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Error generating PDF" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { cvData: CVData; locale?: string };
    const locale = (body.locale || "es") as Locale;
    const html = generateHarvardPDF(body.cvData, locale);
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Error generating PDF" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateHarvardPDF(cv: CVData, locale: Locale): string {
  const { personal_info, work_experience, education, complementary_training, skills, languages, projects } = cv;
  const summary = locale === "en" && cv.summary_en ? cv.summary_en : cv.summary;

  let profileImageHtml = "";
  if (personal_info.profile_image) {
    try {
      const imagePath = path.join(process.cwd(), "public", personal_info.profile_image.replace(/^\//, "").split("?")[0]);
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString("base64");
        const ext = path.extname(imagePath).toLowerCase().replace(".", "");
        const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
        profileImageHtml = `<img src="data:image/${mime};base64,${base64}" alt="${escapeHtml(personal_info.full_name)}" class="profile-photo" />`;
      }
    } catch { /* skip */ }
  }

  const workHtml = work_experience.map((exp) => {
    const dateRange = `${exp.start_date} – ${exp.is_current ? t(locale, "present") : exp.end_date}`;
    const bullets = exp.descriptions.map((d) => `<li>${escapeHtml(d)}</li>`).join("");
    return `<div class="entry"><div class="entry-header"><span class="entry-title">${escapeHtml(exp.position)}</span><span class="entry-date">${escapeHtml(dateRange)}</span></div><div class="entry-subtitle">${escapeHtml(exp.company)}${exp.location ? `, ${escapeHtml(exp.location)}` : ""}</div><ul class="entry-list">${bullets}</ul></div>`;
  }).join("");

  const eduHtml = education.map((edu) => `<div class="entry"><div class="entry-header"><span class="entry-title">${escapeHtml(edu.degree)}</span><span class="entry-date">${escapeHtml(edu.end_date)}</span></div><div class="entry-subtitle">${escapeHtml(edu.institution)}${edu.location ? `, ${escapeHtml(edu.location)}` : ""}</div></div>`).join("");

  const trainHtml = complementary_training.map((tr) => `<div class="entry"><div class="entry-header"><span class="entry-title">${escapeHtml(tr.course)}</span><span class="entry-date">${escapeHtml(tr.date)}</span></div><div class="entry-subtitle">${escapeHtml(tr.institution)}</div></div>`).join("");

  const projHtml = projects.map((p) => {
    const desc = locale === "en" && p.description_en ? p.description_en : p.description;
    const techs = p.technologies.filter(x => x).map(x => escapeHtml(x)).join(", ");
    return `<div class="entry"><div class="entry-header"><span class="entry-title">${escapeHtml(p.name)}</span></div><p class="entry-desc">${escapeHtml(desc)}</p>${techs ? `<p class="entry-tech">${locale === "en" ? "Technologies" : "Tecnologías"}: ${techs}</p>` : ""}</div>`;
  }).join("");

  const progLangs = skills.programming_languages.map((s) => `${escapeHtml(s.name)} (${escapeHtml(s.level)})`).join(", ");
  const frameworks = skills.frameworks.map((s) => `${escapeHtml(s.name)} (${escapeHtml(s.level)})`).join(", ");
  const langText = languages.map((l) => `${escapeHtml(l.language)}: ${escapeHtml(l.proficiency)}`).join(" | ");

  const contactParts: string[] = [];
  if (personal_info.email) contactParts.push(`<a href="mailto:${escapeHtml(personal_info.email)}">${escapeHtml(personal_info.email)}</a>`);
  if (personal_info.phone) contactParts.push(escapeHtml(personal_info.phone));
  if (personal_info.address) contactParts.push(escapeHtml(personal_info.address));
  if (personal_info.linkedin) contactParts.push(`<a href="${escapeHtml(personal_info.linkedin)}">LinkedIn</a>`);
  if (personal_info.github) contactParts.push(`<a href="${escapeHtml(personal_info.github)}">GitHub</a>`);

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <title>CV - ${escapeHtml(personal_info.full_name)}</title>
  <style>
    @page { size: A4; margin: 1in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Times New Roman", "Noto Serif SC", serif; font-size: 11pt; line-height: 1.4; color: #1a1a1a; max-width: 6.5in; margin: 0 auto; padding: 0; }
    h1.name { font-size: 18pt; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4pt; text-align: left; }
    .contact-line { text-align: left; font-size: 10pt; color: #333; margin-bottom: 8pt; }
    .contact-line a { color: #333; text-decoration: none; }
    .contact-line a:hover { text-decoration: underline; }
    .divider { border: none; border-top: 1.5px solid #1a1a1a; margin: 8pt 0 12pt 0; }
    h2 { font-size: 12pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1px solid #ccc; padding-bottom: 3pt; }
    .entry { margin-bottom: 10pt; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: 700; font-size: 11pt; }
    .entry-date { font-style: italic; font-size: 10pt; color: #444; white-space: nowrap; }
    .entry-subtitle { font-style: italic; font-size: 10.5pt; color: #333; margin-bottom: 3pt; }
    .entry-desc { font-size: 10.5pt; margin-bottom: 2pt; }
    .entry-tech { font-size: 9.5pt; color: #555; font-style: italic; }
    .entry-list { margin-left: 18pt; font-size: 10.5pt; }
    .entry-list li { margin-bottom: 2pt; }
    .skill-row { margin-bottom: 3pt; font-size: 10.5pt; }
    .skill-label { font-weight: 700; }
    .summary-text { font-size: 10.5pt; text-align: justify; margin-bottom: 4pt; }
    .lang-text { font-size: 10.5pt; }
    .header-section { display: flex; align-items: center; gap: 16pt; margin-bottom: 4pt; }
    .profile-photo { width: 72pt; height: 72pt; border-radius: 50%; object-fit: cover; }
    .header-text { flex: 1; }
  </style>
</head>
<body>
  <div class="header-section">
    ${profileImageHtml}
    <div class="header-text">
      <h1 class="name">${escapeHtml(personal_info.full_name)}</h1>
      <div class="contact-line">${contactParts.join(" &nbsp;|&nbsp; ")}</div>
    </div>
  </div>
  <hr class="divider" />

  <h2>${locale === "en" ? "Professional Summary" : "Resumen Profesional"}</h2>
  <p class="summary-text">${escapeHtml(summary)}</p>

  <h2>${t(locale, "education")}</h2>
  ${eduHtml}

  <h2>${t(locale, "experience")}</h2>
  ${workHtml}

  ${projects.length > 0 ? `<h2>${t(locale, "portfolio")}</h2>${projHtml}` : ""}

  <h2>${t(locale, "skills")}</h2>
  <div class="skill-row"><span class="skill-label">${t(locale, "programmingLanguages")}:</span> ${progLangs}</div>
  <div class="skill-row"><span class="skill-label">${t(locale, "frameworks")}:</span> ${frameworks}</div>
  <div class="skill-row"><span class="skill-label">${t(locale, "databases")}:</span> ${escapeHtml(skills.databases.join(", "))}</div>
  <div class="skill-row"><span class="skill-label">${t(locale, "tools")}:</span> ${escapeHtml(skills.tools.join(", "))}</div>
  <div class="skill-row"><span class="skill-label">${t(locale, "other")}:</span> ${escapeHtml(skills.other.join(", "))}</div>

  ${complementary_training.length > 0 ? `<h2>${t(locale, "training")}</h2>${trainHtml}` : ""}

  <h2>${t(locale, "languages")}</h2>
  <p class="lang-text">${langText}</p>
</body>
</html>`;
}
