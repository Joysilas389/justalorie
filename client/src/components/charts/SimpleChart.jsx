import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';

export default function SimpleChart({ data, color = '#198754', label = 'Value', type = 'line', height = 260 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = useMemo(() => ({
    chart: {
      type: type === 'bar' ? 'bar' : 'line',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 500 },
    },
    colors: [color],
    stroke: type === 'line' ? { width: 2.5, curve: 'smooth' } : {},
    fill: type === 'line' ? { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } } : {},
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? '#333' : '#eee',
      strokeDashArray: 3,
    },
    xaxis: {
      categories: data.map(d => {
        const s = String(d.x);
        // If it's a date string like YYYY-MM-DD, abbreviate
        if (s.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return s.slice(5); // MM-DD
        }
        if (s.includes('T')) {
          const dt = new Date(s);
          return `${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }
        return s;
      }),
      labels: {
        style: { colors: isDark ? '#aaa' : '#666', fontSize: '10px' },
        rotate: -45,
        maxHeight: 60,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#aaa' : '#666', fontSize: '11px' } },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `${val.toLocaleString()} ${label.includes('kg') ? 'kg' : ''}` },
    },
    plotOptions: type === 'bar' ? {
      bar: { borderRadius: 4, columnWidth: '55%' },
    } : {},
  }), [data, color, type, isDark, label]);

  const series = [{ name: label, data: data.map(d => d.y) }];

  if (data.length === 0) {
    return <div className="text-center text-body-secondary py-4">No data to display</div>;
  }

  return (
    <div className="chart-responsive">
      <Chart options={options} series={series} type={type === 'bar' ? 'bar' : 'area'} height={height} />
    </div>
  );
}
