import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Coins, ArrowRight, Copy, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import wechatQRCode from "@/assets/wechat-payment-qrcode.jpg";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TopUpDialog({ open, onOpenChange, onSuccess }: TopUpDialogProps) {
  const [amount, setAmount] = useState<string>("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const credits = parseInt(amount) || 0;
  const userEmail = profile?.email || user?.email || "";

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleSubmitRequest = async () => {
    if (!user || credits <= 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("top_up_requests").insert({
        user_id: user.id,
        amount_cny: credits,
        credits_requested: credits,
        status: "pending",
        notes: `用户邮箱: ${userEmail}`,
      });

      if (error) throw error;

      toast({
        title: "充值请求已提交",
        description: "请完成扫码支付后等待客服确认入账。",
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting top-up request:", error);
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
    toast({
      title: "已复制",
      description: "邮箱已复制到剪贴板",
    });
  };

  const handleCopyWechat = () => {
    navigator.clipboard.writeText("智脑时代客服");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "已复制",
      description: "微信号已复制到剪贴板",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            充值积分
          </DialogTitle>
          <DialogDescription>
            1 积分 = 1 元人民币，积分永不过期
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount">充值金额 (CNY)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入充值金额"
              className="text-lg font-semibold"
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  variant={parseInt(amount) === qa ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(qa.toString())}
                  className="flex-1 min-w-[60px]"
                >
                  ¥{qa}
                </Button>
              ))}
            </div>
          </div>

          {/* Credits Preview */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-muted-foreground">将获得积分</span>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">{credits}</span>
              <span className="text-muted-foreground">积分</span>
            </div>
          </div>

          <Separator />

          {/* WeChat Payment Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-1">微信扫码支付</h4>
              <p className="text-sm text-muted-foreground">
                收款方：深圳智脑时代科技有限公司
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-3 bg-background rounded-xl border shadow-sm">
                <img
                  src={wechatQRCode}
                  alt="微信支付二维码"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>

            {/* User Email Identification */}
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertDescription className="space-y-2">
                <p className="font-medium text-foreground">
                  请在微信转账时备注您的账号邮箱：
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-1.5 bg-background rounded border text-sm font-mono truncate">
                    {userEmail || "未设置邮箱"}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyEmail}
                    disabled={!userEmail}
                    className="shrink-0"
                  >
                    {emailCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  这将帮助客服快速识别您的账号并为您入账
                </p>
              </AlertDescription>
            </Alert>

            {/* Instructions */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                扫码支付后，请点击下方按钮提交充值请求
              </p>
              <p className="text-sm text-muted-foreground">
                客服将在 1 个工作日内为您入账
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitRequest}
              disabled={credits <= 0 || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "提交中..." : `我已支付 ¥${credits}，提交充值请求`}
            </Button>

            <Separator />

            {/* Contact Customer Service */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">添加客服微信咨询</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyWechat}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    复制微信号
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
