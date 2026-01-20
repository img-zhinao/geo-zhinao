import { Zap, Link2, BarChart2, Building, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

const advantageIcons = [Zap, Link2, BarChart2, Building, Eye];

const Advantages = () => {
  const { t } = useTranslation();

  const advantages = [
    {
      icon: Zap,
      title: t('advantages.items.technology.title'),
      description: t('advantages.items.technology.description')
    },
    {
      icon: Link2,
      title: t('advantages.items.fullChain.title'),
      description: t('advantages.items.fullChain.description')
    },
    {
      icon: BarChart2,
      title: t('advantages.items.dataDriven.title'),
      description: t('advantages.items.dataDriven.description')
    },
    {
      icon: Building,
      title: t('advantages.items.industry.title'),
      description: t('advantages.items.industry.description')
    },
    {
      icon: Eye,
      title: t('advantages.items.transparent.title'),
      description: t('advantages.items.transparent.description')
    }
  ];

  return (
    <section id="advantages" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('advantages.title')}
          </h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            {t('advantages.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.slice(0, 3).map((advantage, index) => (
            <div 
              key={index} 
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
                <advantage.icon className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
              <p className="opacity-80">{advantage.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-3xl mx-auto">
          {advantages.slice(3).map((advantage, index) => (
            <div 
              key={index} 
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
                <advantage.icon className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
              <p className="opacity-80">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
