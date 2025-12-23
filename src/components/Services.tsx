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

const services = [
  {
    icon: Search,
    title: "AI 生态位诊断",
    description: "战略起点的深度扫描",
    details: [
      "品牌提及与情感极性分析",
      "核心竞品占位分析",
      "高价值问题库挖掘",
      "答案质量与机会评估"
    ]
  },
  {
    icon: Target,
    title: "战略蓝图规划",
    description: "精准锚定的顶层设计",
    details: [
      "锁定20-30个战略级问题",
      "品牌声音定义",
      "内容工程规划",
      "KPI目标设定"
    ]
  },
  {
    icon: FileText,
    title: "核心答案工程",
    description: "抢占话语权的内容弹药",
    details: [
      "深度科普内容创作",
      "品牌故事自然融入",
      "AI友好格式优化",
      "多模态内容适配"
    ]
  },
  {
    icon: Globe,
    title: "多平台答案优化",
    description: "精准覆盖主流AI阵地",
    details: [
      "DeepSeek、豆包、Kimi等",
      "GEMINI、OpenAI等",
      "多平台同步优化",
      "实时内容更新"
    ]
  },
  {
    icon: Shield,
    title: "舆情监测与公关",
    description: "AI时代的品牌声誉守护",
    details: [
      "7×24小时全天候监测",
      "负面提及实时预警",
      "负面内容归因分析",
      "危机快速响应"
    ]
  },
  {
    icon: BarChart3,
    title: "效果追踪与迭代",
    description: "数据驱动的增长闭环",
    details: [
      "核心指标定期汇报",
      "转化线索追踪",
      "ROI分析",
      "策略迭代优化"
    ]
  },
  {
    icon: Cpu,
    title: "技术引擎支撑",
    description: "AI友好的底层架构优化",
    details: [
      "RAG架构适配",
      "多模态内容处理",
      "信源权威度强化",
      "实时数据同步"
    ]
  },
  {
    icon: Settings,
    title: "行业定制方案",
    description: "适配不同场景的精准突破",
    details: [
      "消费电子行业",
      "新能源汽车行业",
      "B2B制造业",
      "本地生活服务"
    ]
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            全链路 GEO 服务体系
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从诊断到迭代，八步打造品牌AI搜索增长闭环
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
                    第{index + 1}步
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
