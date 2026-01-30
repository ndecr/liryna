import { createElement } from "react";
import { createRoot } from "react-dom/client";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from "recharts";
import html2canvas from "html2canvas";
import { IBudgetDashboard } from "../types/budget.types.ts";

const PIE_COLORS = ["#ff6b47", "#ff9800", "#e65100", "#c62828"];
const REVENUS_COLORS = ["#2e7d32", "#4caf50", "#66bb6a", "#81c784"];

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

/**
 * Label typé correctement pour Recharts (name & percent sont optionnels)
 */
const pieLabel = ({ name, percent }: PieLabelRenderProps): string => {
  if (!name || percent === undefined) return "";
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

const waitForRender = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 1000);
      });
    });
  });

const captureElement = async (element: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
  });
  return canvas.toDataURL("image/png");
};

const renderChartToContainer = (
  container: HTMLElement,
  chartElement: React.ReactElement,
): ReturnType<typeof createRoot> => {
  const wrapper = document.createElement("div");
  wrapper.style.width = "500px";
  wrapper.style.padding = "10px";
  wrapper.style.background = "#ffffff";
  container.appendChild(wrapper);

  const root = createRoot(wrapper);
  root.render(chartElement);
  return root;
};

export const renderBudgetChartsToImages = async (
  dashboard: IBudgetDashboard,
): Promise<BudgetChartImages> => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "600px";
  container.style.background = "#ffffff";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const roots: ReturnType<typeof createRoot>[] = [];
  const result: BudgetChartImages = {
    chargesChart: null,
    revenusChart: null,
    barChart: null,
  };

  try {
    // --- DATA PREP ---
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
    ).map(([name, value]) => ({
      name,
      montant: value,
    }));

    // --- CHARGES PIE ---
    if (chargesData.length > 0) {
      const chargesPie = createElement(
        PieChart,
        { width: 480, height: 300 },
        createElement(
          Pie,
          {
            data: chargesData,
            cx: 240,
            cy: 140,
            outerRadius: 100,
            innerRadius: 50,
            dataKey: "value",
            label: pieLabel,
            labelLine: false,
          },
          chargesData.map((_, index) =>
            createElement(Cell, {
              key: `charges-cell-${index}`,
              fill: PIE_COLORS[index % PIE_COLORS.length],
            }),
          ),
        ),
        createElement(Tooltip),
      );
      roots.push(renderChartToContainer(container, chargesPie));
    }

    // --- REVENUS PIE ---
    if (revenusData.length > 0) {
      const revenusPie = createElement(
        PieChart,
        { width: 480, height: 300 },
        createElement(
          Pie,
          {
            data: revenusData,
            cx: 240,
            cy: 140,
            outerRadius: 100,
            innerRadius: 50,
            dataKey: "value",
            label: pieLabel,
            labelLine: false,
          },
          revenusData.map((_, index) =>
            createElement(Cell, {
              key: `revenus-cell-${index}`,
              fill: REVENUS_COLORS[index % REVENUS_COLORS.length],
            }),
          ),
        ),
        createElement(Tooltip),
      );
      roots.push(renderChartToContainer(container, revenusPie));
    }

    // --- BAR CHART ---
    if (barData.length > 0) {
      const barChart = createElement(
        BarChart,
        {
          width: 500,
          height: 300,
          data: barData,
          margin: { top: 10, right: 30, left: 20, bottom: 40 },
        },
        createElement(XAxis, {
          dataKey: "name",
          tick: { fontSize: 11 },
          angle: -20,
          textAnchor: "end",
          height: 60,
        }),
        createElement(YAxis, { tick: { fontSize: 11 } }),
        createElement(Tooltip),
        createElement(Legend),
        createElement(Bar, {
          dataKey: "montant",
          name: "Montant",
          fill: "#ff6b47",
          radius: [4, 4, 0, 0],
        }),
      );
      roots.push(renderChartToContainer(container, barChart));
    }

    // --- RENDER WAIT ---
    await waitForRender();

    // --- CAPTURE ---
    const chartElements = container.children;
    let idx = 0;

    if (chargesData.length > 0 && chartElements[idx]) {
      result.chargesChart = await captureElement(
        chartElements[idx] as HTMLElement,
      );
      idx++;
    }

    if (revenusData.length > 0 && chartElements[idx]) {
      result.revenusChart = await captureElement(
        chartElements[idx] as HTMLElement,
      );
      idx++;
    }

    if (barData.length > 0 && chartElements[idx]) {
      result.barChart = await captureElement(chartElements[idx] as HTMLElement);
    }
  } finally {
    // --- CLEANUP ---
    roots.forEach((root) => root.unmount());
    document.body.removeChild(container);
  }

  return result;
};
