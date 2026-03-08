import { api } from "@/lib/api";
import type { MonthlyPL, PortfolioAllocation, TaxSummary } from "@/types";

const SECTOR_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6",
  "#a855f7", "#14b8a6", "#f97316", "#ec4899", "#84cc16",
];

export const analyticsService = {
  getMonthlyPL: async (): Promise<MonthlyPL[]> => {
    const { data } = await api.get<MonthlyPL[]>("/api/analytics/monthly-pl");
    return data;
  },

  getSectorAllocation: async (): Promise<PortfolioAllocation[]> => {
    const { data } = await api.get<{ name: string; value: number; percent?: number }[]>("/api/analytics/sector");
    return data.map((item, i) => ({ ...item, color: SECTOR_COLORS[i % SECTOR_COLORS.length] }));
  },

  getTaxSummary: async (fy?: string): Promise<TaxSummary> => {
    const params = fy ? { fy } : {};
    const { data } = await api.get<TaxSummary>("/api/analytics/tax-summary", { params });
    return data;
  },
};
