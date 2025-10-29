'use client'

import { useEffect, useRef } from 'react'

interface ChartData {
  time: string
  open: number
  high: number
  low: number
  close: number
}

interface TradingChartProps {
  data: ChartData[]
  entryPrice?: number
  exitPrice?: number
  entryTime?: string
  exitTime?: string
  profitTarget?: number
  stopLoss?: number
  direction?: 'LONG' | 'SHORT'
}

export default function TradingChart({
  data,
  entryPrice,
  exitPrice,
  entryTime,
  exitTime,
  profitTarget,
  stopLoss,
  direction = 'LONG'
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    let chart: any = null

    const loadChart = async () => {
      try {
        const { createChart, ColorType } = await import('lightweight-charts')

        chart = createChart(chartContainerRef.current!, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#64748b',
          },
          width: chartContainerRef.current!.clientWidth,
          height: 400,
          grid: {
            vertLines: { color: '#e2e8f0' },
            horzLines: { color: '#e2e8f0' },
          },
          rightPriceScale: {
            borderColor: '#cbd5e1',
          },
          timeScale: {
            borderColor: '#cbd5e1',
            timeVisible: true,
          },
        })

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })

        // Verileri ekle
        candlestickSeries.setData(data)

        // Markers ekle
        const markers: any[] = []

        if (entryPrice && entryTime) {
          markers.push({
            time: entryTime,
            position: direction === 'LONG' ? 'belowBar' : 'aboveBar',
            color: direction === 'LONG' ? '#22c55e' : '#ef4444',
            shape: 'arrowUp',
            text: `Entry $${entryPrice}`,
          })
        }

        if (exitPrice && exitTime) {
          const isProfit = direction === 'LONG' 
            ? exitPrice > (entryPrice || 0)
            : exitPrice < (entryPrice || 0)
          
          markers.push({
            time: exitTime,
            position: direction === 'LONG' ? 'aboveBar' : 'belowBar',
            color: isProfit ? '#22c55e' : '#ef4444',
            shape: 'arrowDown',
            text: `Exit $${exitPrice}`,
          })
        }

        if (markers.length > 0) {
          candlestickSeries.setMarkers(markers)
        }

        // Price lines ekle
        if (profitTarget) {
          candlestickSeries.createPriceLine({
            price: profitTarget,
            color: '#22c55e',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'Target',
          })
        }

        if (stopLoss) {
          candlestickSeries.createPriceLine({
            price: stopLoss,
            color: '#ef4444',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'SL',
          })
        }

        if (entryPrice) {
          candlestickSeries.createPriceLine({
            price: entryPrice,
            color: '#3b82f6',
            lineWidth: 2,
            lineStyle: 0,
            axisLabelVisible: true,
            title: 'Entry',
          })
        }

        // Responsive
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            })
          }
        }

        window.addEventListener('resize', handleResize)

        chart.timeScale().fitContent()

      } catch (error) {
        console.error('Chart yükleme hatası:', error)
      }
    }

    loadChart()

    // Cleanup
    return () => {
      if (chart) {
        chart.remove()
      }
    }
  }, [data, entryPrice, exitPrice, entryTime, exitTime, profitTarget, stopLoss, direction])

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" />
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        {entryPrice && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-600"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Entry: ${entryPrice.toFixed(2)}
            </span>
          </div>
        )}
        {profitTarget && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-600 border-t-2 border-dashed border-green-600"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Target: ${profitTarget.toFixed(2)}
            </span>
          </div>
        )}
        {stopLoss && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-600 border-t-2 border-dashed border-red-600"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Stop Loss: ${stopLoss.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
