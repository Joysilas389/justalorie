import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';

export default function LiveHeartRateChart({ dataPoints, height = 280 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use last 60 data points as rolling window
  const visible = dataPoints.slice(-60);

  const options = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 800 },
      },
    },
    colors: ['#dc3545'],
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? '#333' : '#eee',
      strokeDashArray: 2,
    },
    xaxis: {
      categories: visible.map(d => {
        const t = new Date(d.time);
        return `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
      }),
      labels: {
        show: true,
        style: { colors: isDark ? '#aaa' : '#666', fontSize: '9px' },
        rotate: 0,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: Math.max(30, Math.min(...visible.map(d => d.bpm)) - 10),
      max: Math.max(...visible.map(d => d.bpm)) + 10,
      labels: { style: { colors: isDark ? '#aaa' : '#666', fontSize: '11px' } },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `${val} BPM` },
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    annotations: {
      yaxis: [
        {
          y: 100,
          borderColor: '#fd7e14',
          strokeDashArray: 4,
          label: {
            text: 'Elevated',
            style: { color: '#fd7e14', background: 'transparent', fontSize: '10px' },
            position: 'right',
          },
        },
      ],
    },
  }), [visible, isDark]);

  const series = [{ name: 'Heart Rate', data: visible.map(d => d.bpm) }];

  if (visible.length < 2) {
    return (
      <div className="text-center text-body-secondary py-4">
        <div className="spinner-border spinner-border-sm text-danger me-2"></div>
        Waiting for heart rate data...
      </div>
    );
  }

  return (
    <div className="chart-responsive">
      <Chart options={options} series={series} type="area" height={height} />
    </div>
  );
}
