import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Search, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative flex items-center justify-center pt-24 pb-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">全链路 GEO 服务专家</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            让品牌在
            <span className="text-primary"> AI 搜索 </span>
            中脱颖而出
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            从诊断到迭代的品牌 AI 搜索增长方案，覆盖"诊断 - 规划 - 内容 - 布局 - 监测 - 迭代"全链路服务体系
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in">
            <Button size="lg" asChild className="group">
              <Link to="/login">
                <Sparkles className="mr-2 w-4 h-4" />
                免费开始使用
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#services">了解服务流程</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-16 animate-fade-in">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>免费10积分体验</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>无需绑定支付方式</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>30秒完成注册</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in">
            {[
              { value: "2000+", label: "服务企业" },
              { value: "30+", label: "覆盖行业" },
              { value: "10+", label: "主流AI平台" },
              { value: "3x", label: "响应速度提升" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-card shadow-sm border border-border">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating icons */}
        <div className="absolute left-4 top-1/3 hidden lg:block animate-bounce-slow">
          <div className="p-4 bg-card rounded-2xl shadow-lg border border-border">
            <Search className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute right-4 top-1/2 hidden lg:block animate-bounce-slow delay-500">
          <div className="p-4 bg-card rounded-2xl shadow-lg border border-border">
            <TrendingUp className="w-8 h-8 text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
