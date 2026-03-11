import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { portfolioService } from "@/services/portfolioService";
import { walletService } from "@/services/walletService";
import { queryKeys } from "@/lib/queryKeys";
import type { Holding, InvestmentSplit } from "@/types";
import { TrendingUp, TrendingDown, IndianRupee, Percent, ArrowUpRight, ArrowDownRight, Award, Wallet, BarChart3, Landmark, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const getHoldingLabel = (h: unknown): string => {
  if (!h) return "—";
  if (typeof h === "string") return h;
  const obj = h as Record<string, unknown>;
  return String(obj.symbol ?? obj.name ?? "—");
};

const ALLOCATION_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#a855f7"];
const SIP_LUMPSUM_COLORS = ["#8b5cf6", "#06b6d4"];

const Dashboard = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: portfolioService.getDashboard,
  });

  const { data: allocation = [], isLoading: loadingAllocation } = useQuery({
    queryKey: queryKeys.allocation,
    queryFn: portfolioService.getAllocation,
  });

  const { data: growth = [], isLoading: loadingGrowth } = useQuery({
    queryKey: queryKeys.growth,
    queryFn: portfolioService.getGrowth,
  });

  const { data: holdings = [] } = useQuery({
    queryKey: queryKeys.holdings,
    queryFn: portfolioService.getHoldings,
  });

  const { data: walletBalance } = useQuery({
    queryKey: queryKeys.walletBalance,
    queryFn: walletService.getBalance,
  });

  const { data: investmentSplit } = useQuery<InvestmentSplit>({
    queryKey: queryKeys.investmentSplit,
    queryFn: portfolioService.getInvestmentSplit,
  });

  const loading = loadingSummary || loadingAllocation || loadingGrowth;

  // Compute stock vs MF split
  const stocksValue = holdings
    .filter((h: Holding) => !h.assetType || h.assetType === "STOCK")
    .reduce((s: number, h: Holding) => s + Number(h.totalValue), 0);
  const mfValue = holdings
    .filter((h: Holding) => h.assetType === "MF")
    .reduce((s: number, h: Holding) => s + Number(h.totalValue), 0);
  const cashBalance = walletBalance ?? 0;
  const totalPortfolioValue = stocksValue + mfValue + cashBalance;

  // Build asset-type allocation for pie chart
  const assetAllocation = [
    { name: "Stocks", value: stocksValue, color: ALLOCATION_COLORS[0] },
    { name: "Mutual Funds", value: mfValue, color: ALLOCATION_COLORS[1] },
    { name: "Cash", value: cashBalance, color: ALLOCATION_COLORS[2] },
  ].filter((a) => a.value > 0);

  // Build SIP vs Lumpsum data for pie chart
  const sipLumpsumData = investmentSplit
    ? [
        { name: "SIP", value: Number(investmentSplit.sipAmount), color: SIP_LUMPSUM_COLORS[0] },
        { name: "Lumpsum", value: Number(investmentSplit.lumpsumAmount), color: SIP_LUMPSUM_COLORS[1] },
      ].filter((d) => d.value > 0)
    : [];

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  const isProfit = summary.totalPL >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <div className="flex items-center gap-2">
          {(summary.activeSipCount ?? 0) > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              {summary.activeSipCount} SIPs · {formatCurrency(summary.monthlySipTotal ?? 0)}/mo
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            <Award className="h-3 w-3" /> XIRR: {summary.xirr}%
          </Badge>
        </div>
      </div>

      {/* Row 1: Portfolio Composition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Portfolio</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalPortfolioValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-indigo-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stocks Value</p>
              <p className="text-lg font-bold text-indigo-500">{formatCurrency(stocksValue)}</p>
              {totalPortfolioValue > 0 && <p className="text-[10px] text-muted-foreground">{((stocksValue / totalPortfolioValue) * 100).toFixed(1)}% of portfolio</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-emerald-500">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mutual Funds</p>
              <p className="text-lg font-bold text-emerald-500">{formatCurrency(mfValue)}</p>
              {totalPortfolioValue > 0 && <p className="text-[10px] text-muted-foreground">{((mfValue / totalPortfolioValue) * 100).toFixed(1)}% of portfolio</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-amber-500">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cash Balance</p>
              <p className="text-lg font-bold text-amber-500">{formatCurrency(cashBalance)}</p>
              {totalPortfolioValue > 0 && <p className="text-[10px] text-muted-foreground">{((cashBalance / totalPortfolioValue) * 100).toFixed(1)}% of portfolio</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Investment Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(summary.totalInvested)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${isProfit ? "text-profit" : "text-loss"}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className={`text-lg font-bold ${isProfit ? "text-profit" : "text-loss"}`}>{formatCurrency(summary.currentValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${isProfit ? "text-profit" : "text-loss"}`}>
              {isProfit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit / Loss</p>
              <p className={`text-lg font-bold ${isProfit ? "text-profit" : "text-loss"}`}>{(isProfit ? "+" : "") + formatCurrency(summary.totalPL)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${isProfit ? "text-profit" : "text-loss"}`}>
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Return %</p>
              <p className={`text-lg font-bold ${isProfit ? "text-profit" : "text-loss"}`}>{summary.returnPercent.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="h-5 w-5 text-profit" />
            <div>
              <p className="text-xs text-muted-foreground">Top Gainer</p>
              <p className="font-semibold text-profit">{getHoldingLabel(summary.topGainer)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingDown className="h-5 w-5 text-loss" />
            <div>
              <p className="text-xs text-muted-foreground">Top Loser</p>
              <p className="font-semibold text-loss">{getHoldingLabel(summary.topLoser)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Largest Holding</p>
              <p className="font-semibold text-primary">{getHoldingLabel(summary.largestHolding)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Asset Allocation + SIP vs Lumpsum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset Allocation Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {assetAllocation.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No assets yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={assetAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                      {assetAllocation.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {assetAllocation.map((a) => (
                    <div key={a.name} className="flex items-center gap-1 text-xs">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.name}: {formatCurrency(a.value)}
                      {totalPortfolioValue > 0 && (
                        <span className="text-muted-foreground">({((a.value / totalPortfolioValue) * 100).toFixed(1)}%)</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SIP vs Lumpsum Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">SIP vs Lumpsum (Mutual Funds)</CardTitle>
          </CardHeader>
          <CardContent>
            {sipLumpsumData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No mutual fund investments yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sipLumpsumData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                      {sipLumpsumData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {sipLumpsumData.map((d) => {
                    const total = sipLumpsumData.reduce((s, x) => s + x.value, 0);
                    return (
                      <div key={d.name} className="flex items-center gap-1 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}: {formatCurrency(d.value)}
                        {total > 0 && (
                          <span className="text-muted-foreground">({((d.value / total) * 100).toFixed(1)}%)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Portfolio Growth + Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Portfolio Growth Line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "K"} className="text-muted-foreground" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="totalValue" name="Value" stroke="hsl(175, 77%, 32%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="totalInvested" name="Invested" stroke="hsl(240, 5%, 64%)" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Allocation Pie */}
        {allocation.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                    {allocation.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toFixed(1) + "%"} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {allocation.map((a) => (
                  <div key={a.name} className="flex items-center gap-1 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                    {a.name} ({Number(a.value).toFixed(1)}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">No holdings to show sector data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
