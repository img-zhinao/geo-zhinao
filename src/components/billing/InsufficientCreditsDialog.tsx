import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Coins, CreditCard, Sparkles } from "lucide-react";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits: number;
  currentBalance: number;
  operationType: string;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  requiredCredits,
  currentBalance,
  operationType,
}: InsufficientCreditsDialogProps) {
  const navigate = useNavigate();
  const shortfall = requiredCredits - currentBalance;

  const handleTopUp = () => {
    onOpenChange(false);
    navigate("/dashboard/billing");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Coins className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            积分余额不足
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              执行「{operationType}」需要 <span className="font-semibold text-foreground">{requiredCredits} 积分</span>，
              当前余额仅剩 <span className="font-semibold text-destructive">{currentBalance} 积分</span>。
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted/50">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm">
                还需充值 <span className="font-bold text-primary">{shortfall} 积分</span> 即可使用
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              充值比例：1 积分 = 1 元人民币，支持微信扫码支付
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleTopUp}
            className="w-full gap-2"
          >
            <CreditCard className="h-4 w-4" />
            立即充值
          </AlertDialogAction>
          <AlertDialogCancel className="w-full mt-0">
            稍后再说
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
