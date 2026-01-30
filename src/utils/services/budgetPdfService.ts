import jsPDF from "jspdf";
import { IBudgetDashboard } from "../types/budget.types.ts";
import { renderBudgetChartsToImages } from "./budgetPdfChartRenderer.ts";

// PDF colors
const COLORS = {
  accent: [255, 107, 71] as const,       // #ff6b47
  textPrimary: [44, 62, 80] as const,     // #2c3e50
  textSecondary: [90, 108, 125] as const, // #5a6c7d
  cardBg: [248, 249, 250] as const,       // #f8f9fa
  white: [255, 255, 255] as const,
  green: [46, 125, 50] as const,          // #2e7d32
  red: [198, 40, 40] as const,            // #c62828
  orange: [243, 156, 18] as const,        // #f39c12
  border: [222, 226, 230] as const,       // #dee2e6
};

type RGB = readonly [number, number, number];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value).replace(/[\u202f\u00a0]/g, " ");

const formatDate = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
};

const setColor = (doc: jsPDF, color: RGB): void => {
  doc.setTextColor(color[0], color[1], color[2]);
};

const drawAccentBar = (doc: jsPDF): void => {
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 0, PAGE_WIDTH, 4, "F");
};

const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number): void => {
  setColor(doc, COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text("Liryna", MARGIN, PAGE_HEIGHT - 8);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
};

const drawCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  valueColor: RGB = COLORS.textPrimary
): void => {
  // Card background
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(x, y, width, height, 3, 3, "F");

  // Card border
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 3, 3, "S");

  // Label
  setColor(doc, COLORS.textSecondary);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(label, x + width / 2, y + 10, { align: "center" });

  // Value
  setColor(doc, valueColor);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + width / 2, y + 20, { align: "center" });
};

const getRecommandationColor = (level: string): RGB => {
  switch (level) {
    case "success":
      return COLORS.green;
    case "warning":
      return COLORS.orange;
    case "danger":
      return COLORS.red;
    default:
      return COLORS.textSecondary;
  }
};

const getRecommandationBgColor = (level: string): RGB => {
  switch (level) {
    case "success":
      return [232, 245, 233] as const;
    case "warning":
      return [255, 243, 224] as const;
    case "danger":
      return [255, 235, 238] as const;
    default:
      return COLORS.cardBg;
  }
};

export const generateBudgetPdf = async (dashboard: IBudgetDashboard): Promise<void> => {
  // Render charts first
  const chartImages = await renderBudgetChartsToImages(dashboard);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===== PAGE 1 =====
  drawAccentBar(doc);

  let y = 16;

  // Title
  setColor(doc, COLORS.textPrimary);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Tableau de bord Budget", MARGIN, y);
  y += 8;

  // Subtitle with date
  setColor(doc, COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Export du ${formatDate()}`, MARGIN, y);
  y += 4;

  // Nombre de personnes
  doc.text(`Foyer : ${dashboard.budget.nombrePersonnes} personne${dashboard.budget.nombrePersonnes > 1 ? "s" : ""}`, MARGIN, y);
  y += 12;

  // ---- Summary Cards ----
  const cardWidth = (CONTENT_WIDTH - 9) / 4; // 3 gaps of 3mm
  const cardHeight = 26;

  drawCard(doc, MARGIN, y, cardWidth, cardHeight, "Revenus", formatCurrency(dashboard.totaux.revenus), COLORS.green);
  drawCard(doc, MARGIN + cardWidth + 3, y, cardWidth, cardHeight, "Charges fixes", formatCurrency(dashboard.totaux.chargesFixes), COLORS.accent);
  drawCard(doc, MARGIN + (cardWidth + 3) * 2, y, cardWidth, cardHeight, "Charges variables", formatCurrency(dashboard.totaux.chargesVariables), COLORS.orange);
  drawCard(doc, MARGIN + (cardWidth + 3) * 3, y, cardWidth, cardHeight, "Dettes", formatCurrency(dashboard.totaux.totalMensualitesDettes), COLORS.red);

  y += cardHeight + 10;

  // ---- Reste a vivre ----
  const ravColor = dashboard.totaux.resteAVivre >= 0 ? COLORS.green : COLORS.red;
  const ravBg = dashboard.totaux.resteAVivre >= 0
    ? ([232, 245, 233] as const)
    : ([255, 235, 238] as const);

  doc.setFillColor(ravBg[0], ravBg[1], ravBg[2]);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 3, 3, "F");

  // Left accent bar
  doc.setFillColor(ravColor[0], ravColor[1], ravColor[2]);
  doc.rect(MARGIN, y, 3, 30, "F");

  setColor(doc, COLORS.textSecondary);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RESTE A VIVRE", MARGIN + 10, y + 10);

  setColor(doc, ravColor);
  doc.setFontSize(18);
  doc.text(formatCurrency(dashboard.totaux.resteAVivre), CONTENT_WIDTH + MARGIN - 5, y + 12, { align: "right" });

  setColor(doc, COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${formatCurrency(dashboard.totaux.resteAVivreParPersonne)} / personne (${dashboard.budget.nombrePersonnes} pers.)`,
    MARGIN + 10,
    y + 22
  );

  y += 38;

  // ---- Indicateurs ----
  setColor(doc, COLORS.textPrimary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Indicateurs", MARGIN, y);
  y += 7;

  const indicWidth = (CONTENT_WIDTH - 3) / 2;
  const indicHeight = 26;

  const endettementColor = dashboard.indicateurs.tauxEndettement > 33 ? COLORS.red : COLORS.green;
  const ratioColor = dashboard.indicateurs.ratioChargesRevenus > 80 ? COLORS.red : COLORS.green;

  drawCard(doc, MARGIN, y, indicWidth, indicHeight, "Taux d'endettement", `${dashboard.indicateurs.tauxEndettement}%`, endettementColor);
  drawCard(doc, MARGIN + indicWidth + 3, y, indicWidth, indicHeight, "Ratio charges/revenus", `${dashboard.indicateurs.ratioChargesRevenus}%`, ratioColor);

  y += indicHeight + 10;

  // ---- Recommandation ----
  if (dashboard.recommandation) {
    const recColor = getRecommandationColor(dashboard.recommandation.level);
    const recBg = getRecommandationBgColor(dashboard.recommandation.level);

    doc.setFillColor(recBg[0], recBg[1], recBg[2]);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 18, 3, 3, "F");

    // Left accent
    doc.setFillColor(recColor[0], recColor[1], recColor[2]);
    doc.rect(MARGIN, y, 3, 18, "F");

    setColor(doc, recColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Split long text
    const lines = doc.splitTextToSize(dashboard.recommandation.message, CONTENT_WIDTH - 15);
    doc.text(lines, MARGIN + 8, y + 8);

    y += 26;
  }

  // ---- Detail charges fixes ----
  const categories = Object.entries(dashboard.details.chargesFixesParCategorie);
  if (categories.length > 0) {
    setColor(doc, COLORS.textPrimary);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detail des charges fixes", MARGIN, y);
    y += 7;

    // Table header
    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 8, MARGIN + CONTENT_WIDTH, y + 8);

    setColor(doc, COLORS.textSecondary);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("CATEGORIE", MARGIN + 3, y + 5.5);
    doc.text("MONTANT", MARGIN + CONTENT_WIDTH - 3, y + 5.5, { align: "right" });
    y += 8;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    categories.forEach(([cat, amount]) => {
      if (y > PAGE_HEIGHT - 25) {
        drawFooter(doc, 1, 2);
        doc.addPage();
        drawAccentBar(doc);
        y = 16;
      }

      // Alternate row bg
      doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
      doc.setLineWidth(0.1);
      doc.line(MARGIN, y + 7, MARGIN + CONTENT_WIDTH, y + 7);

      setColor(doc, COLORS.textPrimary);
      doc.text(cat, MARGIN + 3, y + 5);

      setColor(doc, COLORS.accent);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(amount), MARGIN + CONTENT_WIDTH - 3, y + 5, { align: "right" });
      doc.setFont("helvetica", "normal");

      y += 8;
    });

    // Total row
    doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");

    setColor(doc, COLORS.textPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL", MARGIN + 3, y + 5.5);

    const totalChargesFixes = categories.reduce((sum, [, amount]) => sum + amount, 0);
    setColor(doc, COLORS.accent);
    doc.text(formatCurrency(totalChargesFixes), MARGIN + CONTENT_WIDTH - 3, y + 5.5, { align: "right" });
  }

  drawFooter(doc, 1, 2);

  // ===== PAGE 2 - CHARTS =====
  doc.addPage();
  drawAccentBar(doc);

  y = 16;
  setColor(doc, COLORS.textPrimary);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Graphiques", MARGIN, y);
  y += 10;

  // Pie charts side by side
  const chartWidth = 85;
  const chartHeight = 60;

  if (chartImages.chargesChart) {
    setColor(doc, COLORS.textSecondary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Repartition des charges", MARGIN + chartWidth / 2, y, { align: "center" });
    doc.addImage(chartImages.chargesChart, "PNG", MARGIN, y + 3, chartWidth, chartHeight);
  }

  if (chartImages.revenusChart) {
    const xOffset = MARGIN + chartWidth + 10;
    setColor(doc, COLORS.textSecondary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Repartition des revenus", xOffset + chartWidth / 2, y, { align: "center" });
    doc.addImage(chartImages.revenusChart, "PNG", xOffset, y + 3, chartWidth, chartHeight);
  }

  y += chartHeight + 18;

  // Bar chart full width
  if (chartImages.barChart) {
    setColor(doc, COLORS.textSecondary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Detail des charges fixes par categorie", MARGIN, y);
    y += 3;
    doc.addImage(chartImages.barChart, "PNG", MARGIN, y, CONTENT_WIDTH, 80);
    y += 85;
  }

  // Notes
  if (dashboard.budget.notes) {
    if (y > PAGE_HEIGHT - 40) {
      drawFooter(doc, 2, 2);
      doc.addPage();
      drawAccentBar(doc);
      y = 16;
    }

    setColor(doc, COLORS.textPrimary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Notes", MARGIN, y);
    y += 5;

    setColor(doc, COLORS.textSecondary);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(dashboard.budget.notes, CONTENT_WIDTH);
    doc.text(noteLines, MARGIN, y);
  }

  drawFooter(doc, 2, 2);

  // Save
  doc.save("budget-tableau-de-bord.pdf");
};
