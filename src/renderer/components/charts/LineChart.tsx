import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface LineChartProps {
  title?: string
  xData: string[]
  series: { name: string; data: number[]; color?: string }[]
  height?: number
  yAxisName?: string
  smooth?: boolean
}

function LineChart({ title, xData, series, height = 300, yAxisName, smooth = true }: LineChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 14 } } : undefined,
    tooltip: { trigger: 'axis' },
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    grid: { top: title ? 40 : 20, right: 20, bottom: series.length > 1 ? 40 : 20, left: 50 },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value', name: yAxisName },
    series: series.map((s) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth,
      itemStyle: s.color ? { color: s.color } : undefined,
      areaStyle: { opacity: 0.1 },
    })),
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default LineChart
