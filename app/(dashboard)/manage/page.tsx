"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionsPage from "../transactions/page";
import AccountsPage from "../accounts/page";
import CategoriesPage from "../categories/page";

const ManagePage = () => {
  return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          <Card className="border-none drop-shadow-md">
              <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl line-clamp-1">
                    Manage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transactions">
                    <TransactionsPage />
                  </TabsContent>
                  <TabsContent value="accounts">
                    <AccountsPage />
                  </TabsContent>
                  <TabsContent value="categories">
                    <CategoriesPage />
                  </TabsContent>
                </Tabs>
              </CardContent>
          </Card>
      </div>
  )
}

export default ManagePage