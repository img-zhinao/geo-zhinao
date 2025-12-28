import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface IndustryPathologyProps {
  industry: string | null;
  missingPillars: string[];
}

// 行业特有缺失支柱映射
const INDUSTRY_PILLAR_MAP: Record<string, { common: string[]; description: string }> = {
  法律: {
    common: ['stats_injection', 'citation_link', 'authority_quotation'],
    description: '法律行业通常缺乏数据统计支撑和权威引用',
  },
  医疗: {
    common: ['citation_link', 'stats_injection', 'structured_data'],
    description: '医疗行业需要强化学术引用和临床数据',
  },
  金融: {
    common: ['stats_injection', 'freshness', 'authority_quotation'],
    description: '金融行业需要最新数据和权威机构背书',
  },
  教育: {
    common: ['structured_data', 'citation_link', 'technical_terms'],
    description: '教育行业缺乏结构化课程数据和学术引用',
  },
  科技: {
    common: ['freshness', 'technical_terms', 'structured_data'],
    description: '科技行业需要持续更新技术术语和产品架构',
  },
  电商: {
    common: ['stats_injection', 'freshness', 'structured_data'],
    description: '电商行业需要销量数据和实时价格信息',
  },
  房产: {
    common: ['stats_injection', 'freshness', 'authority_quotation'],
    description: '房产行业需要市场数据和政策权威引用',
  },
};

// 支柱名称映射
const PILLAR_LABELS: Record<string, string> = {
  stats_injection: '统计注入',
  citation_link: '引用链接',
  authority_quotation: '权威语录',
  structured_data: '结构化数据',
  technical_terms: '技术术语',
  freshness: '时效性',
  content_depth: '内容深度',
};

// 支柱颜色映射
const PILLAR_COLORS: Record<string, string> = {
  stats_injection: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  citation_link: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  authority_quotation: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  structured_data: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
  technical_terms: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  freshness: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  content_depth: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
};

export function IndustryPathology({ industry, missingPillars }: IndustryPathologyProps) {
  if (!industry) return null;

  const industryInfo = INDUSTRY_PILLAR_MAP[industry];
  
  // 找出行业特有的缺失支柱（同时在常见缺失和实际缺失中）
  const industrySpecificMissing = missingPillars.filter(
    (pillar) => industryInfo?.common.includes(pillar)
  );

  // 其他缺失支柱
  const otherMissing = missingPillars.filter(
    (pillar) => !industryInfo?.common.includes(pillar)
  );

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                行业病理分析
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {industry}
                </Badge>
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 行业特征描述 */}
        {industryInfo && (
          <p className="text-sm text-muted-foreground">
            {industryInfo.description}
          </p>
        )}

        {/* 行业特有缺失 */}
        {industrySpecificMissing.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              行业典型缺失支柱
            </div>
            <div className="flex flex-wrap gap-2">
              {industrySpecificMissing.map((pillar) => (
                <Badge
                  key={pillar}
                  variant="outline"
                  className={`${PILLAR_COLORS[pillar] || 'bg-muted text-muted-foreground'} px-3 py-1 gap-1`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {PILLAR_LABELS[pillar] || pillar}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 其他缺失 */}
        {otherMissing.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            <div className="text-sm text-muted-foreground">其他缺失支柱</div>
            <div className="flex flex-wrap gap-2">
              {otherMissing.map((pillar) => (
                <Badge
                  key={pillar}
                  variant="outline"
                  className="bg-muted/50 text-muted-foreground border-border/50 px-3 py-1"
                >
                  {PILLAR_LABELS[pillar] || pillar}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 无缺失时显示 */}
        {missingPillars.length === 0 && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">GEO 支柱完整，无明显缺失</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
