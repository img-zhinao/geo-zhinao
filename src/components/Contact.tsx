import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "提交成功",
      description: "我们会尽快与您联系！",
    });
    setFormData({ name: "", company: "", phone: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: "地址",
      value: "深圳市南山区高新技术产业园粤美特大厦7楼710"
    },
    {
      icon: Phone,
      label: "电话",
      value: "13828710020",
      href: "tel:13828710020"
    },
    {
      icon: Mail,
      label: "邮箱",
      value: "93510890@qq.com",
      href: "mailto:93510890@qq.com"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            获取定制化GEO解决方案
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            立即联系我们，获取免费AI生态位诊断报告
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>免费咨询</CardTitle>
              <CardDescription>填写表单，专业顾问将在24小时内与您联系</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">姓名</label>
                    <Input
                      placeholder="您的姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">公司</label>
                    <Input
                      placeholder="公司名称"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">联系电话</label>
                  <Input
                    placeholder="您的联系电话"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">咨询内容</label>
                  <Textarea
                    placeholder="请简要描述您的需求..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  提交咨询
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">联系方式</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                      {info.href ? (
                        <a 
                          href={info.href} 
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h4 className="font-bold text-foreground mb-3">深圳智脑时代科技有限公司</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                专注于AI搜索生态优化(GEO)服务，帮助品牌在AI时代建立长期、稳定的竞争优势，
                实现从"被AI提及"到"被AI优先推荐"，再到"引导用户转化"的完整增长闭环。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
