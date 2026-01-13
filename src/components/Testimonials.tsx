import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      content: "使用智脑时代的GEO服务后，我们品牌在DeepSeek的推荐频率提升了3倍，转化率明显改善。",
      author: "张经理",
      role: "市场总监",
      company: "某头部电商品牌",
      avatar: "张",
      rating: 5,
    },
    {
      content: "诊断报告非常专业，清晰指出了我们内容在AI搜索中的短板，优化建议很有针对性。",
      author: "李总",
      role: "创始人",
      company: "新锐美妆品牌",
      avatar: "李",
      rating: 5,
    },
    {
      content: "策略模拟功能很实用，让我们在执行前就能预判效果，节省了大量试错成本。",
      author: "王总监",
      role: "数字营销负责人",
      company: "知名快消企业",
      avatar: "王",
      rating: 5,
    },
    {
      content: "全链路服务从诊断到落地执行，团队专业度高，沟通效率也很好，值得推荐。",
      author: "陈经理",
      role: "品牌运营",
      company: "科技创业公司",
      avatar: "陈",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/30" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            客户真实评价
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            听听合作品牌怎么说
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
