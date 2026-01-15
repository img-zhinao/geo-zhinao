import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Rocket, Sparkles, Zap, Coins, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { callN8nWebhook } from '@/lib/webhook';
import { useCreditsBalance, CREDIT_COSTS, calculateCreditCost, hasEnoughCredits } from '@/hooks/useCredits';
import { InsufficientCreditsDialog } from '@/components/billing/InsufficientCreditsDialog';

const formSchema = z.object({
  brandName: z.string()
    .min(1, '请输入品牌名称')
    .max(200, '品牌名称不能超过200个字符'),
  searchQuery: z.string()
    .min(1, '请输入搜索问题')
    .max(500, '搜索问题不能超过500个字符'),
  competitors: z.string()
    .max(1000, '竞品品牌不能超过1000个字符')
    .optional(),
  model: z.string().default('DeepSeek-V3'),
});

type FormData = z.infer<typeof formSchema>;

const models = [
  { value: 'DeepSeek-V3', label: 'DeepSeek-V3', icon: '🧠' },
  { value: 'Doubao-Pro', label: 'Doubao-Pro', icon: '🤖' },
  { value: 'OpenAI', label: 'OpenAI', icon: '⚡' },
];

interface NewScanFormProps {
  onJobSubmitted?: (jobId: string, brandName: string, searchQuery: string) => void;
}

export function NewScanForm({ onJobSubmitted }: NewScanFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = useCreditsBalance();

  // Calculate cost for 1 model
  const creditCost = calculateCreditCost('monitoring', 1);
  const canAfford = hasEnoughCredits(balance, 'monitoring', 1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      searchQuery: '',
      competitors: '',
      model: 'DeepSeek-V3',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: '请先登录',
        description: '您需要登录才能创建分析任务',
        variant: 'destructive',
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: '积分不足',
        description: `本次操作需要 ${creditCost} 积分，当前余额 ${balance} 积分`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse competitors from comma-separated string to array
      const competitorsArray = data.competitors
        ? data.competitors.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : null;

      const { data: insertedJob, error } = await supabase.from('scan_jobs').insert({
        user_id: user.id,
        brand_name: data.brandName,
        search_query: data.searchQuery,
        competitors: competitorsArray,
        selected_models: [data.model],
        status: 'queued',
      }).select().single();

      if (error) throw error;

      // 调用 N8N Webhook 触发监控分析（传入完整参数）
      const webhookResult = await callN8nWebhook('monitoring', {
        job_id: insertedJob.id,
        user_id: user.id,
        brand_name: data.brandName,
        search_query: data.searchQuery,
        competitors: JSON.stringify(competitorsArray),
        selected_models: JSON.stringify([data.model]),
      });

      if (!webhookResult.success) {
        // Check if it's an insufficient credits error
        if (webhookResult.error === 'insufficient_credits') {
          toast({
            title: '积分不足',
            description: `需要 ${creditCost} 积分，当前余额不足`,
            variant: 'destructive',
          });
          // Delete the created job since it can't proceed
          await supabase.from('scan_jobs').delete().eq('id', insertedJob.id);
          return;
        }
        console.warn('N8N webhook 调用失败:', webhookResult.error);
      }

      toast({
        title: '分析任务已创建',
        description: `正在启动 AI 分析引擎... (消耗 ${creditCost} 积分)`,
      });

      form.reset();
      queryClient.invalidateQueries({ queryKey: ['scan-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetchBalance();

      // Notify parent about the new job
      if (onJobSubmitted && insertedJob) {
        onJobSubmitted(insertedJob.id, data.brandName, data.searchQuery);
      }
    } catch (error) {
      console.error('Error creating scan job:', error);
      toast({
        title: '创建失败',
        description: '无法创建分析任务，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-card/40 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_hsl(var(--primary)/0.15)]">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">启动 GEO 分析</CardTitle>
            <CardDescription>分析您的品牌在 AI 生成内容中的可见度</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">品牌名称</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="例如：小肥羊" 
                        className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">AI 模型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
                          <SelectValue placeholder="选择模型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                        {models.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            <span className="flex items-center gap-2">
                              <span>{model.icon}</span>
                              <span>{model.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90">搜索问题</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="例如：深圳最好吃的火锅店是哪家？" 
                      className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground/70">
                    输入用户可能向 AI 提问的问题
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90">竞品品牌（可选）</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="例如：海底捞, 呷哺呷哺, 捞王"
                      className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 min-h-[80px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground/70">
                    用逗号分隔多个竞品品牌
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credit Cost Info */}
            {!balanceLoading && (
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>本次扫描消耗：<span className="font-medium text-foreground">{creditCost} 积分</span></span>
                </div>
                <span>余额：<span className={`font-medium ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{balance} 积分</span></span>
              </div>
            )}

            {/* Insufficient Credits Alert */}
            {!balanceLoading && !canAfford && (
              <Alert 
                variant="destructive" 
                className="cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => setShowCreditsDialog(true)}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>积分不足</AlertTitle>
                <AlertDescription>
                  本次操作需要 {creditCost} 积分，当前余额 {balance} 积分。<span className="underline">点击充值</span>
                </AlertDescription>
              </Alert>
            )}

            <InsufficientCreditsDialog
              open={showCreditsDialog}
              onOpenChange={setShowCreditsDialog}
              requiredCredits={creditCost}
              currentBalance={balance}
              operationType="AI 可见性监测"
            />

            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting || !canAfford || balanceLoading}
              className="w-full relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Zap className="h-5 w-5 animate-pulse" />
                    正在启动分析...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    运行分析
                  </>
                )}
              </span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
