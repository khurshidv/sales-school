'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import type { SankeyData } from '@/lib/admin/types-v2';

export interface SankeyChartProps {
  data: SankeyData;
  height?: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#a78bfa', '#f472b6'];

/**
 * @nivo/sankey wrapper. Empty-data guard renders a friendly placeholder
 * because Nivo throws if you hand it `nodes: []` while rendering.
 */
export default function SankeyChart({ data, height = 480 }: SankeyChartProps) {
  if (data.nodes.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveSankey
        data={data}
        margin={{ top: 16, right: 140, bottom: 16, left: 60 }}
        align="justify"
        colors={COLORS}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={8}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
      />
    </div>
  );
}
