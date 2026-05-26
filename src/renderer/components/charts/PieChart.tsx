import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface PieChartProps {
  title?: string
  data: { name: string; value: number; color?: string }[]
  height?: number
  radius?: [string, string]
  showLegend?: boolean
}

function PieChart({ title, data, height = 300, radius = ['40%', '70%'], showLegend = true }: PieChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 14 } } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: showLegend ? { bottom: 0, type: 'scroll' } : undefined,
    series: [
      {
        type: 'pie',
        radius,
        center: ['50%', showLegend && title ? '45%' : '50%'],
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: d.color ? { color: d.color } : undefined,
        })),
        label: { show: true, formatter: '{b}: {d}%' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default PieChart
