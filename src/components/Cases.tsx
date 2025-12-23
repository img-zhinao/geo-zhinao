import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MousePointer, Phone } from "lucide-react";

const cases = [
  {
    industry: "消费电子",
    company: "某头部手机品牌",
    scenario: "\"2025拍照最好的手机\"",
    metrics: [
      { label: "品牌提及率", before: "12%", after: "48%", icon: TrendingUp },
      { label: "官网跳转量", increase: "+210%", icon: MousePointer }
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    industry: "新能源汽车",
    company: "某新能源车企",
    scenario: "\"纯电车冬季续航怎么选\"",
    metrics: [
      { label: "答案占位率", after: "63%", icon: TrendingUp },
      { label: "潜在客户留资", increase: "+185%", icon: Users }
    ],
    color: "from-green-500 to-green-600"
  },
  {
    industry: "B2B制造业",
    company: "某工业机器人企业",
    scenario: "\"制造业自动化生产线解决方案\"",
    metrics: [
      { label: "品牌推荐率", before: "8%", after: "35%", icon: TrendingUp },
      { label: "商务咨询线索", increase: "+150%", icon: Phone }
    ],
    color: "from-purple-500 to-purple-600"
  },
  {
    industry: "本地生活服务",
    company: "某连锁餐饮品牌",
    scenario: "\"北京朝阳区性价比高的火锅\"",
    metrics: [
      { label: "门店推荐率", after: "52%", icon: TrendingUp },
      { label: "到店核销率", increase: "+90%", icon: Users }
    ],
    color: "from-orange-500 to-orange-600"
  }
];

const Cases = () => {
  return (
    <section id="cases" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            行业成功案例
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            覆盖30+垂直行业，助力2000+企业实现AI搜索增长
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((caseItem, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${caseItem.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {caseItem.industry}
                  </span>
                </div>
                <CardTitle className="text-xl">{caseItem.company}</CardTitle>
                <p className="text-muted-foreground">
                  优化场景：<span className="text-foreground font-medium">{caseItem.scenario}</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {caseItem.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <metric.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                      </div>
                      {metric.before && metric.after ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground line-through">{metric.before}</span>
                          <span className="text-primary">→</span>
                          <span className="text-2xl font-bold text-primary">{metric.after}</span>
                        </div>
                      ) : metric.increase ? (
                        <span className="text-2xl font-bold text-primary">{metric.increase}</span>
                      ) : (
                        <span className="text-2xl font-bold text-primary">{metric.after}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cases;
