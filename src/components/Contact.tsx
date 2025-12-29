import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "请输入您的姓名" })
    .max(100, { message: "姓名不能超过100个字符" }),
  company: z
    .string()
    .trim()
    .min(1, { message: "请输入公司名称" })
    .max(200, { message: "公司名称不能超过200个字符" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "请输入联系电话" })
    .max(50, { message: "电话号码不能超过50个字符" })
    .regex(/^[\d\s\-+()]+$/, { message: "请输入有效的电话号码" }),
  message: z
    .string()
    .max(2000, { message: "咨询内容不能超过2000个字符" })
    .optional()
    .or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        name: data.name.trim(),
        company: data.company.trim(),
        phone: data.phone.trim(),
        message: data.message?.trim() || null,
      });

      if (error) {
        console.error("Error submitting contact form:", error);
        toast({
          title: "提交失败",
          description: "请稍后重试或直接拨打电话联系我们",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "提交成功",
        description: "感谢您的咨询，我们会在24小时内与您联系！",
      });
      form.reset();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "提交失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>姓名</FormLabel>
                          <FormControl>
                            <Input placeholder="您的姓名" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>公司</FormLabel>
                          <FormControl>
                            <Input placeholder="公司名称" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>联系电话</FormLabel>
                        <FormControl>
                          <Input placeholder="您的联系电话" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>咨询内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="请简要描述您的需求..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        提交咨询
                      </>
                    )}
                  </Button>
                </form>
              </Form>
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
