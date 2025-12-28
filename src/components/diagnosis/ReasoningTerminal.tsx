import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Brain, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReasoningTerminalProps {
  reasoningTrace: string | null;
  isStreaming?: boolean;
}

export function ReasoningTerminal({ reasoningTrace, isStreaming = false }: ReasoningTerminalProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 流式显示效果
  useEffect(() => {
    if (!reasoningTrace) {
      setDisplayedText('');
      return;
    }

    if (isStreaming) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= reasoningTrace.length) {
          setDisplayedText(reasoningTrace.slice(0, index));
          index += 3; // 每次显示3个字符
        } else {
          clearInterval(interval);
        }
      }, 10);

      return () => clearInterval(interval);
    } else {
      setDisplayedText(reasoningTrace);
    }
  }, [reasoningTrace, isStreaming]);

  // 光标闪烁效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedText]);

  if (!reasoningTrace) return null;

  // 解析思维链，添加语法高亮
  const formatReasoningText = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => {
        // 标题行 (以 ## 或 ### 开头)
        if (line.startsWith('###')) {
          return (
            <div key={idx} className="text-cyan-400 font-bold mt-4 mb-2">
              {line.replace(/^#+\s*/, '')}
            </div>
          );
        }
        if (line.startsWith('##')) {
          return (
            <div key={idx} className="text-emerald-400 font-bold text-lg mt-4 mb-2">
              {line.replace(/^#+\s*/, '')}
            </div>
          );
        }
        if (line.startsWith('#')) {
          return (
            <div key={idx} className="text-yellow-400 font-bold text-xl mt-4 mb-2">
              {line.replace(/^#+\s*/, '')}
            </div>
          );
        }

        // 列表项
        if (line.match(/^[-*]\s/)) {
          return (
            <div key={idx} className="flex gap-2 ml-4">
              <span className="text-emerald-500">▸</span>
              <span className="text-green-300/90">{line.replace(/^[-*]\s/, '')}</span>
            </div>
          );
        }

        // 数字列表
        if (line.match(/^\d+\.\s/)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <div key={idx} className="flex gap-2 ml-4">
                <span className="text-amber-500 font-mono">{match[1]}.</span>
                <span className="text-green-300/90">{match[2]}</span>
              </div>
            );
          }
        }

        // 关键词高亮
        const highlightKeywords = (str: string) => {
          const keywords = ['因此', '所以', '结论', '分析', '发现', '建议', '问题', '原因', '解决'];
          let result = str;
          keywords.forEach((keyword) => {
            result = result.replace(
              new RegExp(keyword, 'g'),
              `<span class="text-yellow-400 font-semibold">${keyword}</span>`
            );
          });
          return result;
        };

        // 普通行
        if (line.trim()) {
          return (
            <div 
              key={idx} 
              className="text-green-400/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(line) }}
            />
          );
        }

        // 空行
        return <div key={idx} className="h-2" />;
      });
  };

  return (
    <Card className="bg-[#0a0f0a] border-emerald-500/30 overflow-hidden">
      <CardHeader className="pb-2 border-b border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Terminal className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-emerald-400 font-mono text-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                R1 思维链终端
              </CardTitle>
              <p className="text-xs text-emerald-600 font-mono">
                DeepSeek-R1 Reasoning Trace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs gap-1"
            >
              <Cpu className="h-3 w-3" />
              REASONING
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-0">
          {/* 终端窗口装饰 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0d120d] border-b border-emerald-500/10">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-xs text-emerald-600 ml-4 font-mono">
              deepseek-r1@geo-analysis ~ reasoning
            </span>
          </div>

          <ScrollArea className="h-[400px]">
            <div 
              ref={scrollRef}
              className="p-4 font-mono text-sm space-y-1 bg-gradient-to-b from-[#0a0f0a] to-[#0d1510]"
              style={{
                textShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              {/* 启动信息 */}
              <div className="text-emerald-600 mb-4">
                <span className="text-emerald-500">$</span> initializing reasoning engine...
              </div>
              <div className="text-emerald-700 mb-4 text-xs">
                ═══════════════════════════════════════════════════════
              </div>

              {/* 思维链内容 */}
              {formatReasoningText(displayedText)}

              {/* 闪烁光标 */}
              {(isStreaming || displayedText.length < (reasoningTrace?.length || 0)) && (
                <span 
                  className={`inline-block w-2 h-4 bg-emerald-500 ml-1 ${
                    cursorVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transition: 'opacity 0.1s' }}
                />
              )}
            </div>
          </ScrollArea>

          {/* 底部状态栏 */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d120d] border-t border-emerald-500/10 text-xs font-mono text-emerald-600">
            <span>
              {displayedText.length} / {reasoningTrace?.length || 0} chars
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isStreaming ? 'STREAMING' : 'COMPLETE'}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
