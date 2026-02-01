import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatCurrency } from "@/lib/utils";

interface SummaryDetailCardProps {
  title: string;
  icon: LucideIcon
  data: number;
}

export default function SummaryDetailCard({
  title,
  icon,
  data
}: SummaryDetailCardProps
) {
  const Icon = icon;
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold">{formatCurrency(data)}</div>
          {/* Add a badge here but we need to show green/red depending on past performance */}
        </div>
      </CardContent>
    </Card>
  )
}
