import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MousePointer, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const Cases = () => {
  const { t } = useTranslation();

  const cases = [
    {
      industry: t('cases.items.electronics.industry'),
      company: t('cases.items.electronics.company'),
      scenario: t('cases.items.electronics.scenario'),
      metrics: [
        { label: t('cases.metrics.mentionRate'), before: "12%", after: "48%", icon: TrendingUp },
        { label: t('cases.metrics.websiteTraffic'), increase: "+210%", icon: MousePointer }
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      industry: t('cases.items.automotive.industry'),
      company: t('cases.items.automotive.company'),
      scenario: t('cases.items.automotive.scenario'),
      metrics: [
        { label: t('cases.metrics.answerRate'), after: "63%", icon: TrendingUp },
        { label: t('cases.metrics.leads'), increase: "+185%", icon: Users }
      ],
      color: "from-green-500 to-green-600"
    },
    {
      industry: t('cases.items.manufacturing.industry'),
      company: t('cases.items.manufacturing.company'),
      scenario: t('cases.items.manufacturing.scenario'),
      metrics: [
        { label: t('cases.metrics.recommendRate'), before: "8%", after: "35%", icon: TrendingUp },
        { label: t('cases.metrics.inquiries'), increase: "+150%", icon: Phone }
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      industry: t('cases.items.localServices.industry'),
      company: t('cases.items.localServices.company'),
      scenario: t('cases.items.localServices.scenario'),
      metrics: [
        { label: t('cases.metrics.storeRecommend'), after: "52%", icon: TrendingUp },
        { label: t('cases.metrics.visitRate'), increase: "+90%", icon: Users }
      ],
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="cases" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('cases.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('cases.subtitle')}
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
                  {t('cases.optimizationScenario')}：<span className="text-foreground font-medium">{caseItem.scenario}</span>
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
