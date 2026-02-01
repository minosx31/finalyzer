"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CreditCardIcon,
  DollarSignIcon,
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

// Mock data - in real app, this would come from your API
const netWorthData = [
  { month: "Jan", assets: 20000, debts: 15000 },
  { month: "Feb", assets: 21000, debts: 14500 },
  { month: "Mar", assets: 22000, debts: 14000 },
  { month: "Apr", assets: 23000, debts: 13500 },
  { month: "May", assets: 24000, debts: 13000 },
  { month: "Jun", assets: 26000, debts: 12500 },
  { month: "Jul", assets: 27000, debts: 12000 },
];

const spendingData = [
  { name: "Housing", value: 1500, color: "#FF8042" },
  { name: "Food", value: 800, color: "#00C49F" },
  { name: "Transport", value: 400, color: "#FFBB28" },
  { name: "Utilities", value: 300, color: "#0088FE" },
  { name: "Entertainment", value: 250, color: "#FF5733" },
  { name: "Others", value: 450, color: "#551A8B" },
];

const incomeVsExpensesData = [
  { month: "Jan", income: 5000, expenses: 3700 },
  { month: "Feb", income: 5000, expenses: 3800 },
  { month: "Mar", income: 5000, expenses: 3300 },
  { month: "Apr", income: 5200, expenses: 3600 },
  { month: "May", income: 5200, expenses: 3500 },
  { month: "Jun", income: 5500, expenses: 3900 },
  { month: "Jul", income: 5500, expenses: 3800 },
];

const accountsData = [
  { 
    name: "Main Checking", 
    balance: 5650.23,
    institution: "Chase",
    trend: "up",
  },
  { 
    name: "Savings", 
    balance: 15750.50,
    institution: "Ally Bank",
    trend: "up",
  },
  { 
    name: "Investment", 
    balance: 45320.75,
    institution: "Vanguard",
    trend: "up",
  },
];

const creditCardsData = [
  { 
    name: "Chase Sapphire", 
    balance: 1250.37,
    limit: 10000,
    dueDate: "Aug 25, 2025",
    utilization: 12.5,
  },
  { 
    name: "Amex Gold", 
    balance: 2730.15,
    limit: 15000,
    dueDate: "Aug 20, 2025",
    utilization: 18.2,
  },
];

const goalsData = [
  {
    name: "Emergency Fund",
    current: 10000,
    target: 25000,
    progress: 40,
    timeLeft: "5 months",
  },
  {
    name: "Vacation",
    current: 3500,
    target: 5000,
    progress: 70,
    timeLeft: "2 months",
  },
  {
    name: "New Car",
    current: 12000,
    target: 35000,
    progress: 34,
    timeLeft: "10 months",
  },
];

const transactionsData = [
  {
    id: 1,
    name: "Grocery Store",
    amount: -120.50,
    date: "Aug 16, 2025",
    category: "Food",
    account: "Chase Checking",
  },
  {
    id: 2,
    name: "Salary Deposit",
    amount: 2750.00,
    date: "Aug 15, 2025",
    category: "Income",
    account: "Chase Checking",
  },
  {
    id: 3,
    name: "Electricity Bill",
    amount: -85.32,
    date: "Aug 14, 2025",
    category: "Utilities",
    account: "Chase Checking",
  },
  {
    id: 4,
    name: "Restaurant",
    amount: -67.80,
    date: "Aug 13, 2025",
    category: "Dining",
    account: "Amex Gold",
  },
  {
    id: 5,
    name: "Gas Station",
    amount: -45.23,
    date: "Aug 12, 2025",
    category: "Transportation",
    account: "Chase Sapphire",
  },
];

// Utility function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardPage() {
  // Calculate total assets, debts, and net worth
  const totalAssets = accountsData.reduce((sum, account) => sum + account.balance, 0);
  const totalDebts = creditCardsData.reduce((sum, card) => sum + card.balance, 0);
  const netWorth = totalAssets - totalDebts;
  
  // Calculate monthly cashflow
  const latestMonth = incomeVsExpensesData[incomeVsExpensesData.length - 1];
  const monthlyCashflow = latestMonth.income - latestMonth.expenses;
  
  return (
    <div className="p-6 max-w-[1600px] mx-auto pt-8">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial health at a glance. Last updated: August 18, 2025
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
                <Badge className="bg-green-500" variant="outline">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  5.2%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Since last month
              </div>
            </CardContent>
          </Card>

          {/* Monthly Cashflow Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cashflow</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">{formatCurrency(monthlyCashflow)}</div>
                <Badge className={monthlyCashflow > 0 ? "bg-green-500" : "bg-red-500"} variant="outline">
                  {monthlyCashflow > 0 ? (
                    <>
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      12.8%
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                      8.3%
                    </>
                  )}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Positive flow is good
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
                <Badge className="bg-green-500" variant="outline">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  3.8%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Across {accountsData.length} accounts
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
                <Badge className="bg-green-500" variant="outline">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  2.1%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Credit card debt
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs for different charts */}
            <Tabs defaultValue="net-worth" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
                <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                <TabsTrigger value="spending">Spending</TabsTrigger>
              </TabsList>
              
              {/* Net Worth Chart */}
              <TabsContent value="net-worth">
                <Card>
                  <CardHeader>
                    <CardTitle>Net Worth Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={netWorthData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDebts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff5252" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area
                          type="monotone"
                          dataKey="assets"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorAssets)"
                        />
                        <Area
                          type="monotone"
                          dataKey="debts"
                          stroke="#ff5252"
                          fillOpacity={1}
                          fill="url(#colorDebts)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-[#8884d8] mr-1"></div>
                        <span>Assets</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-[#ff5252] mr-1"></div>
                        <span>Debts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Cash Flow Chart */}
              <TabsContent value="cash-flow">
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={incomeVsExpensesData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#4caf50" />
                        <Bar dataKey="expenses" name="Expenses" fill="#ff9800" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">Savings Rate: 23%</div>
                      <Badge className="bg-green-500">Healthy</Badge>
                    </div>
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
            </Tabs>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionsData.map((transaction) => (
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
                          <div className="font-medium">{transaction.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.date} • {transaction.category}
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
                </div>
                <div className="mt-4 flex justify-center">
                  <a href="#" className="text-sm text-blue-500 hover:underline flex items-center">
                    View All Transactions
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary and Goals */}
          <div className="space-y-4">
            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative h-36 w-36">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="stroke-current text-muted-foreground/20"
                        strokeWidth="10"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="stroke-current text-green-500"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - 78 / 100)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">78</span>
                      <span className="text-xs">out of 100</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Badge className="bg-green-500 mb-2">Good</Badge>
                    <p className="text-sm text-muted-foreground">
                      Your financial health is looking good. A few improvements could bring you to excellent.
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Savings Rate</div>
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="font-normal">
                        <TrendingUpIcon className="h-3 w-3 mr-1 text-green-500" />
                        23%
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Debt-to-Income</div>
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="font-normal">
                        <TrendingDownIcon className="h-3 w-3 mr-1 text-green-500" />
                        18%
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Credit Utilization</div>
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="font-normal">
                        <TrendingDownIcon className="h-3 w-3 mr-1 text-yellow-500" />
                        24%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Cards Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditCardsData.map((card) => (
                    <div key={card.name} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">{card.name}</div>
                        <div>{formatCurrency(card.balance)}</div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>Due: {card.dueDate}</div>
                        <div>Limit: {formatCurrency(card.limit)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Utilization</span>
                          <span className={card.utilization > 30 ? "text-yellow-500" : "text-green-500"}>
                            {card.utilization}%
                          </span>
                        </div>
                        <Progress value={card.utilization} 
                          className={`h-1 ${
                            card.utilization > 30 ? "bg-yellow-200" : "bg-green-200"
                          }`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <a href="#" className="text-sm text-blue-500 hover:underline flex items-center">
                    Manage Credit Cards
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </a>
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
                  {goalsData.map((goal) => (
                    <div key={goal.name} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">{goal.name}</div>
                        <div>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={goal.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{goal.progress}% complete</span>
                          <span>{goal.timeLeft} remaining</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <a href="#" className="text-sm text-blue-500 hover:underline flex items-center">
                    View All Goals
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
