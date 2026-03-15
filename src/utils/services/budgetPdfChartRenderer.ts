import { IBudgetDashboard } from "../types/budget.types.ts";

const PIE_COLORS = ["#ff6b47", "#ff9800", "#e65100", "#c62828"];
const REVENUS_COLORS = ["#2e7d32", "#4caf50", "#66bb6a", "#81c784"];
const BAR_COLOR = "#ff6b47";

interface ChartEntry {
  name: string;
  value: number;
}

interface BarEntry {
  name: string;
  montant: number;
}

export interface BudgetChartImages {
  chargesChart: string | null;
  revenusChart: string | null;
  barChart: string | null;
}

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const drawDonutChart = (
  canvas: HTMLCanvasElement,
  data: ChartEntry[],
  colors: string[],
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return;

  const cx = width / 2;
  const cy = height * 0.47;
  const outerRadius = Math.min(cx, cy) * 0.62;
  const innerRadius = outerRadius * 0.5;

  // Slices
  let startAngle = -Math.PI / 2;
  data.forEach((entry, i) => {
    const sliceAngle = (entry.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerRadius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += sliceAngle;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Labels
  const fontSize = Math.round(height * 0.042);
  ctx.font = `bold ${fontSize}px sans-serif`;
  startAngle = -Math.PI / 2;

  data.forEach((entry, i) => {
    const sliceAngle = (entry.value / total) * 2 * Math.PI;
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = outerRadius * 1.28;
    const lx = cx + Math.cos(midAngle) * labelRadius;
    const ly = cy + Math.sin(midAngle) * labelRadius;
    const percent = ((entry.value / total) * 100).toFixed(0);

    ctx.fillStyle = colors[i % colors.length];
    ctx.textAlign = lx >= cx ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${entry.name} ${percent}%`, lx, ly);

    startAngle += sliceAngle;
  });
};

const drawBarChart = (
  canvas: HTMLCanvasElement,
  data: BarEntry[],
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const pad = { top: 30, right: 30, bottom: 80, left: 80 };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (data.length === 0) return;

  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map((d) => d.montant), 1);
  const slotW = chartW / data.length;
  const barW = Math.min(slotW * 0.6, 60);
  const fontSize = Math.round(height * 0.038);

  // Grid lines + Y axis labels
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "#6b7280";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i++) {
    const val = (maxVal * i) / 4;
    const y = pad.top + chartH - (val / maxVal) * chartH;

    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.fillText(`${Math.round(val)}€`, pad.left - 6, y);
  }

  // Bars + X labels
  data.forEach((entry, i) => {
    const barH = Math.max((entry.montant / maxVal) * chartH, 1);
    const x = pad.left + i * slotW + (slotW - barW) / 2;
    const y = pad.top + chartH - barH;

    // Bar with rounded top corners
    const r = 3;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = BAR_COLOR;
    ctx.fill();

    // X label rotated
    ctx.save();
    ctx.fillStyle = "#374151";
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.translate(x + barW / 2, pad.top + chartH + 12);
    ctx.rotate(-Math.PI / 5);
    ctx.fillText(entry.name, 0, 0);
    ctx.restore();
  });
};

export const renderBudgetChartsToImages = async (
  dashboard: IBudgetDashboard,
): Promise<BudgetChartImages> => {
  const result: BudgetChartImages = {
    chargesChart: null,
    revenusChart: null,
    barChart: null,
  };

  // --- DATA ---
  const chargesData: ChartEntry[] = [
    { name: "Charges fixes", value: dashboard.totaux.chargesFixes },
    { name: "Charges variables", value: dashboard.totaux.chargesVariables },
    { name: "Dettes", value: dashboard.totaux.totalMensualitesDettes },
  ].filter((d) => d.value > 0);

  const revenusSource =
    dashboard.budget.nombrePersonnes >= 2 &&
    dashboard.details.revenusParEntree &&
    Object.keys(dashboard.details.revenusParEntree).length > 1
      ? dashboard.details.revenusParEntree
      : dashboard.details.revenusParCategorie;

  const revenusData: ChartEntry[] = Object.entries(revenusSource)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const barData: BarEntry[] = Object.entries(
    dashboard.details.chargesFixesParCategorie,
  ).map(([name, value]) => ({ name, montant: value }));

  // --- DRAW ---
  if (chargesData.length > 0) {
    const canvas = createCanvas(960, 560);
    drawDonutChart(canvas, chargesData, PIE_COLORS);
    result.chargesChart = canvas.toDataURL("image/png");
  }

  if (revenusData.length > 0) {
    const canvas = createCanvas(960, 560);
    drawDonutChart(canvas, revenusData, REVENUS_COLORS);
    result.revenusChart = canvas.toDataURL("image/png");
  }

  if (barData.length > 0) {
    const canvas = createCanvas(1000, 560);
    drawBarChart(canvas, barData);
    result.barChart = canvas.toDataURL("image/png");
  }

  return result;
};
