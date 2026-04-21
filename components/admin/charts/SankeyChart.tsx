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
  const nodeCount = data.nodes.length;
  const dense = nodeCount > 10;
  const computedHeight = Math.max(height, dense ? 220 + nodeCount * 14 : height);

  return (
    <div style={{ height: computedHeight, overflowX: 'auto' }}>
      <div style={{ height: computedHeight, minWidth: dense ? Math.max(900, nodeCount * 70) : '100%' }}>
        <ResponsiveSankey
          data={data}
          margin={{ top: 90, right: 40, bottom: 24, left: 40 }}
          align="justify"
          colors={COLORS}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={14}
          nodeSpacing={12}
          nodeBorderWidth={0}
          nodeBorderRadius={2}
          linkOpacity={0.45}
          linkHoverOthersOpacity={0.08}
          linkContract={2}
          enableLinkGradient
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={6}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
          theme={{
            labels: { text: { fontSize: 10, fontWeight: 500 } },
            tooltip: { container: { fontSize: 12 } },
          }}
        />
      </div>
    </div>
  );
}
