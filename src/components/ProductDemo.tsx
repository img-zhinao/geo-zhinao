import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, FileSearch, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";

const ProductDemo = () => {
  const features = [
    {
      icon: FileSearch,
      title: "AI 搜索诊断",
      description: "一键分析品牌在 DeepSeek、豆包、Kimi 等平台的可见度",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: BarChart3,
      title: "竞品对比分析",
      description: "可视化对比竞争对手的 AI 搜索表现",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: TrendingUp,
      title: "趋势追踪",
      description: "实时监测品牌可见度变化，把握优化时机",
      gradient: "from-orange-500/20 to-amber-500/20",
    },
    {
      icon: Target,
      title: "策略模拟",
      description: "智能预测优化策略效果，科学决策",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
  ];

  return (
    <section className="py-20 bg-background" id="product-demo">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            强大的 GEO 分析平台
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从诊断到优化，全方位提升品牌在 AI 搜索中的竞争力
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-border overflow-hidden"
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard preview placeholder */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted/50 to-muted shadow-2xl">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  数据驱动的决策平台
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  直观的仪表盘，实时展示品牌 AI 可见度评分、情感分析、竞品对比等核心指标
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" asChild className="group">
            <Link to="/login">
              立即创建账号，获取专属报告
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;
