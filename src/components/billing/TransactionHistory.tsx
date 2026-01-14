import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, History, ArrowDownCircle, ArrowUpCircle, Gift, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  reference_type: string | null;
  description: string | null;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const getTransactionIcon = (type: string, amount: number) => {
  if (type === "top_up" || type === "refund" || amount > 0) {
    return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
  }
  if (type === "monthly_grant") {
    return <Gift className="h-4 w-4 text-primary" />;
  }
  return <ArrowUpCircle className="h-4 w-4 text-orange-500" />;
};

const getTransactionLabel = (type: string, refType: string | null) => {
  switch (type) {
    case "top_up":
      return { label: "充值", variant: "default" as const };
    case "deduction":
      if (refType === "monitoring") return { label: "监测消耗", variant: "secondary" as const };
      if (refType === "diagnosis") return { label: "诊断消耗", variant: "secondary" as const };
      if (refType === "simulation") return { label: "模拟消耗", variant: "secondary" as const };
      return { label: "消耗", variant: "secondary" as const };
    case "refund":
      return { label: "退款", variant: "outline" as const };
    case "monthly_grant":
      return { label: "月度赠送", variant: "default" as const };
    default:
      return { label: type, variant: "secondary" as const };
  }
};

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            交易记录
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          交易记录
        </CardTitle>
        <CardDescription>
          您的积分变动历史
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCcw className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无交易记录</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="text-right">变动</TableHead>
                  <TableHead className="text-right">余额</TableHead>
                  <TableHead>详情</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const { label, variant } = getTransactionLabel(
                    tx.transaction_type,
                    tx.reference_type
                  );
                  const isPositive = tx.amount > 0;

                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(tx.created_at), "MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.transaction_type, tx.amount)}
                          <Badge variant={variant}>{label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={isPositive ? "text-green-500" : "text-orange-500"}>
                          {isPositive ? "+" : ""}
                          {tx.amount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {tx.balance_after}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {tx.description || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
