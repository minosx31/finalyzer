"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CreditCardIcon,
  LineChartIcon,
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const { data: summaryData, isLoading: isSummaryLoading } = useGetSummary();
  const { data: transactions, isLoading: isTransactionsLoading } = useGetTransactions({ limit: 5 });

  if (isSummaryLoading || isTransactionsLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  if (!summaryData) {
    return <div className="p-6">Failed to load dashboard data.</div>;
  }

  // --- Data Processing ---

  // 1. Net Worth: Assets (positive balance) - Debts (negative balance)
  // Note: In some systems debts are positive numbers in a 'liability' account. 
  // Here we assume standard signed transactions sum up to balance.
  // If a credit card has a negative balance of -500, that is a debt of 500.
  // If a bank account has 1000, that is an asset.
  
  const accounts = summaryData.accounts || [];
  
  // Split accounts into assets and debts based on balance sign or type if we had strict types
  // For now, let's treat any negative balance as 'Debt' contribution and positive as 'Asset'
  const assetAccounts = accounts.filter(a => a.balance >= 0);
  const debtAccounts = accounts.filter(a => a.balance < 0);

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalDebts = Math.abs(debtAccounts.reduce((sum, a) => sum + a.balance, 0));
  const netWorth = totalAssets - totalDebts;

  // 2. Spending Data (Categories)
  const spendingData = summaryData.categories.map((c, index) => ({
    name: c.name,
    value: c.value, 
    color: [`#FF8042`, `#00C49F`, `#FFBB28`, `#0088FE`, `#FF5733`, `#551A8B`][index % 6]
  }));

  // 3. Cash Flow (Income vs Expenses per day/period - aggregated to months if we had long range)
  // The summary endpoint returns 'days'. If the period is 30 days, showing daily bars is fine.
  // We can map 'days' to the chart format.
  const cashFlowData = summaryData.days.map(d => ({
    date: format(d.date, "MMM dd"),
    income: d.income,
    expenses: Math.abs(d.expenses), // expenses are usually returned as negative or positive depending on API, let's assume valid magnitudes
  }));

  // 4. Net Worth Trend
  // We don't have historical balance snapshots. 
  // Approximation: Cumulative cashflow added to an initial base? 
  // For now, let's just plot 'Active Days' cumulative remaining change ?? 
  // OR simply hide this if we can't compute it accurately.
  // Let's use the 'active days' income - expenses accumulation to show a 'Trend' relative to start of period.
  let cumulative = 0;
  const netWorthTrendData = summaryData.days.map(d => {
    cumulative += (d.income + d.expenses); // expenses are negative
    return {
        date: format(d.date, "MMM dd"),
        change: cumulative
    }
  });


  // 5. Credit Cards
  // Filter accounts that are explicitly type 'credit' or have negative balance if type missing
  const creditCards = accounts.filter(a => a.type === 'credit' || (a.balance < 0 && !a.type));

  // 6. Goals
  const goals = summaryData.goals || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto pt-8">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial health at a glance.
          </p>
        </div>

        {/* Financial Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Worth Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <WalletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Total Assets - Total Debts
              </div>
            </CardContent>
          </Card>

          {/* Monthly Cashflow Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Cashflow</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">{formatCurrency(summaryData.remainingAmount)}</div>
                <Badge className={summaryData.remainingAmount > 0 ? "bg-green-500" : "bg-red-500"} variant="outline">
                   {summaryData.remainingChange}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Income - Expenses (Last 30 days)
              </div>
            </CardContent>
          </Card>

          {/* Total Assets Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <PiggyBankIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Across {assetAccounts.length} accounts
              </div>
            </CardContent>
          </Card>

          {/* Total Debts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debts</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">{formatCurrency(totalDebts)}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Outstanding balances
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs for different charts */}
            <Tabs defaultValue="cash-flow" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                <TabsTrigger value="spending">Spending</TabsTrigger>
                <TabsTrigger value="trend">Trend</TabsTrigger>
              </TabsList>
              
              {/* Cash Flow Chart */}
              <TabsContent value="cash-flow">
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={cashFlowData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#4caf50" />
                        <Bar dataKey="expenses" name="Expenses" fill="#ff9800" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Spending Chart */}
              <TabsContent value="spending">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-center justify-between">
                    <div className="w-full md:w-1/2">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={spendingData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {spendingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 grid grid-cols-1 gap-2">
                       {spendingData.length === 0 && <div className="text-center text-muted-foreground">No spending data for this period</div>}
                      {spendingData.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="h-3 w-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                          <span>{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trend Chart (Proxy for Net Worth Trend) */}
               <TabsContent value="trend">
                <Card>
                  <CardHeader>
                    <CardTitle>Cumulative Cash Flow (Period)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={netWorthTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                         <defs>
                          <linearGradient id="colorChange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area
                          type="monotone"
                          dataKey="change"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorChange)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions?.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.amount > 0 ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.payee}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(transaction.date, "MMM dd, yyyy")} • {transaction.category || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.amount > 0 ? "text-green-500" : ""
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                   {(!transactions || transactions.length === 0) && (
                      <div className="text-center text-muted-foreground py-4">No recent transactions</div>
                   )}
                </div>
                <div className="mt-4 flex justify-center">
                  <Link href="/transactions" className="text-sm text-blue-500 hover:underline flex items-center">
                    View All Transactions
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary and Goals */}
          <div className="space-y-4">
            {/* Credit Cards Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Cards & Debts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditCards.map((card) => {
                     // Calculate utilization if limit exists
                     const limit = card.creditLimit;
                     const balance = Math.abs(card.balance); // Debt amount
                     const utilization = limit ? Math.round((balance / limit) * 100) : 0;
                     
                     return (
                    <div key={card.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">{card.name}</div>
                        <div>{formatCurrency(balance)}</div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        {card.dueDate && <div>Due: {card.dueDate}th</div>}
                        {limit && <div>Limit: {formatCurrency(limit)}</div>}
                      </div>
                      {limit && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Utilization</span>
                          <span className={utilization > 30 ? "text-yellow-500" : "text-green-500"}>
                            {utilization}%
                          </span>
                        </div>
                        <Progress value={utilization} 
                          className={`h-1 ${
                            utilization > 30 ? "bg-yellow-200" : "bg-green-200"
                          }`} 
                        />
                      </div>
                      )}
                    </div>
                  )})}
                   {creditCards.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">No credit accounts found</div>
                   )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                    return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">{goal.name}</div>
                        <div>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress}% complete</span>
                          {goal.deadline && (
                            <span>Due: {format(goal.deadline, "MMM dd, yyyy")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                  {goals.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">No goals set</div>
                   )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
