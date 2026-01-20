import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Search, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "2000+", label: t('hero.stats.enterprises') },
    { value: "30+", label: t('hero.stats.industries') },
    { value: "10+", label: t('hero.stats.platforms') },
    { value: "3x", label: t('hero.stats.speedUp') },
  ];

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
            <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            {t('hero.title')}
            <span className="text-primary">{t('hero.titleHighlight')}</span>
            {t('hero.titleEnd')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in">
            <Button size="lg" asChild className="group">
              <Link to="/login">
                <Sparkles className="mr-2 w-4 h-4" />
                {t('hero.cta.primary')}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#services">{t('hero.cta.secondary')}</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-16 animate-fade-in">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{t('hero.trust.freeCredits')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{t('hero.trust.noPayment')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{t('hero.trust.quickStart')}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in">
            {stats.map((stat, index) => (
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
