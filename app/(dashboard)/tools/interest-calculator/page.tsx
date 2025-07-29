"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InterestCalcPage = () => {
  return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          <Card className="border-none drop-shadow-md">
              <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl line-clamp-1">
                    Interest Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                This page is under development...
              </CardContent>
          </Card>
      </div>
  )
}

export default InterestCalcPage