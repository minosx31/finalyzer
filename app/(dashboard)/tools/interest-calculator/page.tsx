"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  year: number;
  balance: number;
  principal: number;
}

const formatAxis = (tick: any) => {
  const value = Number(tick);
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

const InterestCalcPage = () => {
  const [principal, setPrincipal] = useState<number | string>(10000);
  const [rate, setRate] = useState<number | string>(7);
  const [duration, setDuration] = useState<number | string>(10);
  const [monthlyContribution, setMonthlyContribution] = useState<number | string>(500);
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("12");

  const { chartData, finalBalance, totalInterest, totalPrincipal } = useMemo(() => {
    const p = Number(principal) || 0;
    const r = (Number(rate) || 0) / 100;
    const dur = Number(duration) || 0;
    const m = Number(monthlyContribution) || 0;
    const n = Number(compoundingFrequency);

    let currentBalance = p;
    let cumulativePrincipal = p;
    const data: ChartData[] = [{ year: 0, balance: p, principal: p }];

    for (let year = 1; year <= dur; year++) {
      let yearlyContribution = 0;
      for (let month = 1; month <= 12; month++) {
        currentBalance += m;
        yearlyContribution += m;
      }
      
      currentBalance = currentBalance * (1 + r / n) ** n;
      cumulativePrincipal += yearlyContribution;
      data.push({ year, balance: parseFloat(currentBalance.toFixed(2)), principal: cumulativePrincipal });
    }

    const finalBalanceValue = data[data.length - 1]?.balance ?? 0;
    const totalPrincipalValue = data[data.length - 1]?.principal ?? 0;
    const totalInterestValue = finalBalanceValue - totalPrincipalValue;

    return { chartData: data, finalBalance: finalBalanceValue, totalInterest: totalInterestValue, totalPrincipal: totalPrincipalValue };
  }, [principal, rate, duration, monthlyContribution, compoundingFrequency]);

  return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          <Card className="border-none drop-shadow-md">
              <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl line-clamp-1">
                    Compound Interest Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Inputs Column */}
                  <div className="col-span-1 flex flex-col gap-y-6">
                    <div>
                      <Label htmlFor="principal">Initial Principal ($)</Label>
                      <NumericFormat
                        id="principal"
                        value={principal}
                        thousandSeparator={true}
                        prefix={"$"}
                        customInput={Input}
                        onValueChange={(values) => setPrincipal(Number(values.floatValue))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (Years)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly-contribution">Monthly Contribution ($)</Label>
                      <NumericFormat
                        id="monthly-contribution"
                        value={monthlyContribution}
                        thousandSeparator={true}
                        prefix={"$"}
                        customInput={Input}
                        onValueChange={(values) => setMonthlyContribution(Number(values.floatValue))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="compounding">Compounding Frequency</Label>
                      <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                        <SelectTrigger id="compounding" className="mt-1">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Annually</SelectItem>
                          <SelectItem value="2">Semi-Annually</SelectItem>
                          <SelectItem value="4">Quarterly</SelectItem>
                          <SelectItem value="12">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results and Chart Column */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Final Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(finalBalance)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Principal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(totalPrincipal)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(totalInterest)}</div>
                        </CardContent>
                      </Card>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                        <YAxis 
                          tickFormatter={formatAxis}
                          domain={['dataMin', 'dataMax']}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Total Balance" />
                        <Line type="monotone" dataKey="principal" stroke="#82ca9d" name="Total Principal" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-xl line-clamp-1 mb-4">
                    Annual Breakdown
                  </CardTitle>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Year</TableHead>
                          <TableHead className="text-right">Total Principal</TableHead>
                          <TableHead className="text-right">Total Interest</TableHead>
                          <TableHead className="text-right">End Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.map((data) => (
                          <TableRow key={data.year}>
                            <TableCell>{data.year}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.principal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.balance - data.principal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
          </Card>
      </div>
  )
}

export default InterestCalcPage;