import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Search, Compass, Settings, LogOut, CreditCard, Loader2, Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { title: '控制台', url: '/dashboard', icon: LayoutDashboard },
  { title: 'GEO 分析', url: '/dashboard/geo-analysis', icon: Search },
  { title: '归因诊断', url: '/dashboard/diagnosis', icon: Stethoscope },
  { title: '关键词发现', url: '/dashboard/keywords', icon: Compass },
];

const settingsNavItems = [
  { title: '个人设置', url: '/dashboard/settings', icon: Settings },
  { title: '套餐账单', url: '/dashboard/billing', icon: CreditCard },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === 'collapsed';

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  const getTierLabel = (tier: string | undefined) => {
    switch (tier) {
      case 'free': return '免费版';
      case 'pro': return '专业版';
      case 'enterprise': return '企业版';
      default: return '免费版';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg whitespace-nowrap">智脑时代 GEO</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>主菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>设置</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Credits Display */}
        {!isCollapsed && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">剩余积分</span>
              {profileLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="font-semibold text-primary">
                  {profile?.credits_balance ?? 0}
                </span>
              )}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || '用户'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getTierLabel(profile?.tier_level)}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "mt-3 w-full text-muted-foreground hover:text-foreground",
            isCollapsed && "px-0"
          )}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">退出登录</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
