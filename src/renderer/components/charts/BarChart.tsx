import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface BarChartProps {
  title?: string
  xData: string[]
  series: { name: string; data: number[]; color?: string }[]
  height?: number
  yAxisName?: string
  horizontal?: boolean
}

function BarChart({ title, xData, series, height = 300, yAxisName, horizontal = false }: BarChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 14 } } : undefined,
    tooltip: { trigger: 'axis' },
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    grid: { top: title ? 40 : 20, right: 20, bottom: series.length > 1 ? 40 : 20, left: 60 },
    xAxis: horizontal ? { type: 'value', name: yAxisName } : { type: 'category', data: xData },
    yAxis: horizontal ? { type: 'category', data: xData } : { type: 'value', name: yAxisName },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar' as const,
      data: s.data,
      itemStyle: s.color ? { color: s.color } : undefined,
      barMaxWidth: 40,
    })),
  }

  return <ReactECharts option={option} style={{ height }} />
}

export default BarChart
