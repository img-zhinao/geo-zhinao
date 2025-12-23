import { Zap, Link2, BarChart2, Building, Eye } from "lucide-react";

const advantages = [
  {
    icon: Zap,
    title: "技术自研壁垒",
    description: "自主研发AI生态监测引擎、NLP语义分析模型和多平台优化工具，响应速度比行业平均快3倍"
  },
  {
    icon: Link2,
    title: "全链路闭环服务",
    description: "从战略诊断到技术落地，再到效果迭代，\"一站式\" AI搜索增长解决方案"
  },
  {
    icon: BarChart2,
    title: "数据驱动决策",
    description: "基于全网AI平台数据，覆盖10+主流AI模型、百万级行业问题库，避免盲目投入"
  },
  {
    icon: Building,
    title: "行业深耕经验",
    description: "累计服务2000+企业，覆盖30+垂直行业，形成可复用的行业模板库"
  },
  {
    icon: Eye,
    title: "透明化效果呈现",
    description: "专属数据看板实时展示核心指标，每两周输出详细分析报告，服务价值可视化"
  }
];

const Advantages = () => {
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
            核心差异化优势
          </h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            战略 + 内容 + 技术 + 数据 四维驱动，建立长期竞争优势
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
