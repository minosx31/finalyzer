"use client"

import SummaryDetailCard from "@/components/dashboard/summary-detail-card";
import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, CreditCardIcon, LineChartIcon, PiggyBankIcon, WalletIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const today = format(new Date(), 'PPP')

  const transactionsQuery = useGetTransactions({ limit: 6 })
  const transactions = transactionsQuery.data || []

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

  return (
    <div className="max-w-screen-2xl mx-auto w-full p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Your finance information at a glance. Last updated: <span className="font-bold">{today}</span>
          </p>
        </div>

        {/* Main Content */}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Balance Card */}
          <SummaryDetailCard
            title="Balance"
            icon={WalletIcon}
            data={80000}
          />
          {/* Monthly Cashflow Card */}
          <SummaryDetailCard
            title="Monthly Cashflow"
            icon={LineChartIcon}
            data={8000}
          />
          {/* Income Card */}
          <SummaryDetailCard
            title="Income"
            icon={PiggyBankIcon}
            data={8000}
          />
          {/* Expenses Card */}
          <SummaryDetailCard
            title="Expenses"
            icon={CreditCardIcon}
            data={8000}
          />
          {/* Financial Health (At the side -- KIV) */}
       
          {/* Credit Cards (KIV) */}
          {/* Financial Goals (KIV) */}
        </div>
        
        {/* Charts (Tabs for the 4 cards above) - Occupy whole width */}
        <div className="w-full">
          <Tabs defaultValue="balance">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
              <TabsTrigger value="spending">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="balance">
              <Card>
                <CardHeader>
                  <CardTitle>Balance Trend</CardTitle>
                </CardHeader>
                <CardContent>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cash-flow">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spending">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Transactions */}
        <div className="">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
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
                          <div className="font-medium">{transaction.notes}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(transaction.date, "dd MMMM, yyyy")} • {transaction.category}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.amount > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Link href="/manage/transactions" className="text-sm text-blue-500 hover:underline flex items-center">
                    View all transactions
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
          </Card>
        </div>

      </div>
      {/* <header className="flex items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-baseline gap-x-2">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                An overview of your financial status.
              </p>
            </div>
          </div>
        </header> */}
        {/* <DataGrid />
        <DataCharts /> */}
    </div>
  );
}
