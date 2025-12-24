import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  FileSearch, 
  Pencil, 
  Eye, 
  Copy, 
  Download, 
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface DiagnosisReportCardProps {
  jobId: string;
  diagReport: string | null | undefined;
  isAnalysisComplete: boolean;
}

export function DiagnosisReportCard({ jobId, diagReport, isAnalysisComplete }: DiagnosisReportCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync report content when diagReport changes
  useEffect(() => {
    const processed = (diagReport || '')
      .replace(/\\n/g, '\n')
      .replace(/\\#/g, '#');
    setReportContent(processed);
    setHasChanges(false);
  }, [diagReport]);

  const handleEditToggle = () => {
    if (isEditing && hasChanges) {
      // Ask before discarding changes
      if (!confirm('您有未保存的更改，确定要退出编辑吗？')) {
        return;
      }
      // Reset content
      const processed = (diagReport || '')
        .replace(/\\n/g, '\n')
        .replace(/\\#/g, '#');
      setReportContent(processed);
      setHasChanges(false);
    }
    setIsEditing(!isEditing);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      toast.success('报告已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEO_Diagnosis_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('报告已下载');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('scan_results')
      .update({ diag_attribution_report: reportContent })
      .eq('job_id', jobId);

    if (error) {
      toast.error('保存失败: ' + error.message);
    } else {
      toast.success('报告已保存');
      setIsEditing(false);
      setHasChanges(false);
    }
    setIsSaving(false);
  };

  const handleContentChange = (value: string) => {
    setReportContent(value);
    setHasChanges(value !== (diagReport || '').replace(/\\n/g, '\n').replace(/\\#/g, '#'));
  };

  return (
    <Card className="border border-border/50 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-indigo-400" />
            <span className="text-indigo-400">深度诊断报告</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {isAnalysisComplete && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                分析完成
              </Badge>
            )}
            
            <Badge variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              DeepSeek-R1
            </Badge>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-700">
          <TooltipProvider>
            {/* Edit/Preview Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditToggle}
                  className={`h-8 px-2 ${isEditing ? 'bg-indigo-500/20 text-indigo-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {isEditing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEditing ? '切换到预览模式' : '切换到编辑模式'}
              </TooltipContent>
            </Tooltip>

            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  disabled={!reportContent}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>复制报告内容</TooltipContent>
            </Tooltip>

            {/* Download */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  disabled={!reportContent}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>下载为 Markdown 文件</TooltipContent>
            </Tooltip>

            {/* Save */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={`h-8 px-2 ${hasChanges ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20' : 'text-muted-foreground'}`}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasChanges ? '保存更改' : '无更改需要保存'}
              </TooltipContent>
            </Tooltip>

            {/* Unsaved indicator */}
            {hasChanges && (
              <span className="text-xs text-amber-400 ml-2">• 有未保存的更改</span>
            )}
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          /* Edit Mode */
          <Textarea
            value={reportContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[400px] font-mono text-sm bg-slate-800/80 border-slate-600 text-slate-200 resize-none focus:border-indigo-500 focus:ring-indigo-500/20"
            placeholder="在此编辑诊断报告..."
          />
        ) : (
          /* View Mode */
          <ScrollArea className="h-[400px] rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
            <div className="prose prose-sm max-w-none prose-invert prose-headings:text-indigo-400 prose-headings:font-semibold prose-h2:text-lg prose-h3:text-base prose-p:text-slate-300 prose-strong:text-slate-100 prose-li:text-slate-300 prose-li:marker:text-indigo-400 prose-code:text-purple-400 prose-code:bg-slate-700/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              {reportContent ? (
                <ReactMarkdown>{reportContent}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">暂无诊断报告</p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
