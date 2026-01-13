import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Value proposition */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                🚀 免费体验 AI 搜索诊断，提升品牌可见度
              </p>
              <p className="text-xs text-muted-foreground">
                10积分免费体验 · 无需绑卡 · 即刻开始
              </p>
            </div>
            <p className="sm:hidden text-sm font-medium text-foreground">
              🚀 免费体验 AI 搜索诊断
            </p>

            {/* CTA and dismiss */}
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="group">
                <Link to="/login">
                  免费开始
                  <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingCTA;
