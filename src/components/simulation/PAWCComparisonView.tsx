import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PAWCComparisonViewProps {
  originalContent: string | null;
  optimizedContent: string | null;
}

// 优化内容渲染器 - 加粗文字用黄色高亮
function OptimizedContentRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        strong: ({ children }) => (
          <span 
            className="inline-block px-1.5 py-0.5 rounded font-bold"
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.25)', // 琥珀色高亮
              color: '#d97706',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
            }}
          >
            {children}
          </span>
        ),
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed text-foreground/90">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-foreground/90">{children}</li>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3 text-foreground">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mb-2 text-foreground">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold mb-2 text-foreground">{children}</h3>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function PAWCComparisonView({ originalContent, optimizedContent }: PAWCComparisonViewProps) {
  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30 overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">PAWC 内容推演对比</CardTitle>
            <CardDescription>原始 AI 回答 vs GEO 优化内容</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* 左侧：原始内容 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">AI 原始回答</span>
              <Badge variant="outline" className="text-xs bg-muted/50">
                BEFORE
              </Badge>
            </div>
            <ScrollArea className="h-[400px] rounded-lg bg-muted/30 border border-border/30">
              <div className="p-4">
                {originalContent ? (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {originalContent}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                    <FileText className="h-12 w-12 opacity-30 mb-2" />
                    <p className="text-sm">暂无原始内容</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：优化内容 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-sm text-emerald-600">GEO 优化内容</span>
              <Badge 
                variant="outline" 
                className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              >
                AFTER
              </Badge>
            </div>
            <ScrollArea 
              className="h-[400px] rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))',
                borderColor: 'rgba(16, 185, 129, 0.2)',
              }}
            >
              <div className="p-4">
                {optimizedContent ? (
                  <div className="text-sm">
                    <OptimizedContentRenderer content={optimizedContent} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                    <Sparkles className="h-12 w-12 opacity-30 mb-2" />
                    <p className="text-sm">暂无优化内容</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-amber-600 flex items-center gap-2">
            <span 
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.25)' }}
            />
            黄色高亮部分表示 AI 检索的注意力权重关键词，建议在内容优化时重点保留
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
