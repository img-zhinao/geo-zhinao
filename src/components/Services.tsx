import { 
  Search, 
  Target, 
  FileText, 
  Globe, 
  Shield, 
  BarChart3,
  Cpu,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const serviceIcons = [Search, Target, FileText, Globe, Shield, BarChart3, Cpu, Settings];

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Search,
      title: t('services.items.diagnosis.title'),
      description: t('services.items.diagnosis.description'),
      details: t('services.items.diagnosis.details', { returnObjects: true }) as string[]
    },
    {
      icon: Target,
      title: t('services.items.strategy.title'),
      description: t('services.items.strategy.description'),
      details: t('services.items.strategy.details', { returnObjects: true }) as string[]
    },
    {
      icon: FileText,
      title: t('services.items.content.title'),
      description: t('services.items.content.description'),
      details: t('services.items.content.details', { returnObjects: true }) as string[]
    },
    {
      icon: Globe,
      title: t('services.items.optimization.title'),
      description: t('services.items.optimization.description'),
      details: t('services.items.optimization.details', { returnObjects: true }) as string[]
    },
    {
      icon: Shield,
      title: t('services.items.monitoring.title'),
      description: t('services.items.monitoring.description'),
      details: t('services.items.monitoring.details', { returnObjects: true }) as string[]
    },
    {
      icon: BarChart3,
      title: t('services.items.tracking.title'),
      description: t('services.items.tracking.description'),
      details: t('services.items.tracking.details', { returnObjects: true }) as string[]
    },
    {
      icon: Cpu,
      title: t('services.items.technology.title'),
      description: t('services.items.technology.description'),
      details: t('services.items.technology.details', { returnObjects: true }) as string[]
    },
    {
      icon: Settings,
      title: t('services.items.custom.title'),
      description: t('services.items.custom.description'),
      details: t('services.items.custom.details', { returnObjects: true }) as string[]
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border bg-card"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    {t('services.step', { number: index + 1 })}
                  </span>
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
