import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Stethoscope, FlaskConical, Sparkles } from "lucide-react";

const pricingItems = [
  {
    name: "AI 可见性监测",
    description: "扫描品牌在主流 AI 平台的可见性",
    cost: 2,
    unit: "每个模型",
    icon: Scan,
    color: "text-blue-500",
  },
  {
    name: "归因诊断分析",
    description: "深度分析品牌排名的根本原因",
    cost: 5,
    unit: "每次诊断",
    icon: Stethoscope,
    color: "text-purple-500",
  },
  {
    name: "策略模拟预测",
    description: "模拟优化策略对排名的影响",
    cost: 3,
    unit: "每次模拟",
    icon: FlaskConical,
    color: "text-green-500",
  },
];

export function PricingInfo() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          积分消耗说明
        </CardTitle>
        <CardDescription>了解各功能的积分消耗情况</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {pricingItems.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <Badge variant="secondary" className="font-mono">
                  {item.cost} 积分
                </Badge>
              </div>
              <h4 className="font-semibold mb-1">{item.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <p className="text-xs text-muted-foreground">{item.unit}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
