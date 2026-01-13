import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const QuickTry = () => {
  const [brandName, setBrandName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim()) {
      navigate(`/login?brand=${encodeURIComponent(brandName.trim())}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">30秒快速体验</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            免费体验 AI 搜索诊断
          </h2>
          <p className="text-muted-foreground mb-8">
            输入您的品牌名称，立即查看品牌在各大AI平台的可见度表现
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
            <Input
              type="text"
              placeholder="输入您的品牌名称..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="flex-1 h-12 text-base"
            />
            <Button type="submit" size="lg" className="h-12 px-8">
              立即体验
            </Button>
          </form>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>已有 <span className="font-semibold text-foreground">2,847</span> 个品牌完成诊断</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickTry;
