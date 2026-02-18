import { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { sensorAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Thermometer, Droplets, Sun, Download, Calendar, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SensorCard } from '../components/ui/SensorCard';
import toast from 'react-hot-toast';

export const Homepage = () => {
  const [sensorData, setSensorData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchLatestData();
    fetch24HourData();
  }, []);

  useEffect(() => {
    fetchDataByDate(selectedDate);
  }, [selectedDate]);

  // Fix: named handler so socket.off removes the correct listener (no stale closure)
  useEffect(() => {
    if (!socket) return;
    const handleNewReading = (reading) => setSensorData(reading);
    socket.on('new_reading', handleNewReading);
    return () => socket.off('new_reading', handleNewReading);
  }, [socket]);

  const fetchLatestData = async () => {
    try {
      const response = await sensorAPI.getLatest();
      setSensorData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  };

  const fetch24HourData = async () => {
    try {
      const response = await sensorAPI.get24Hours();
      const formatted = (response.data.data || []).map((r) => ({
        ...r,
        timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setChartData(formatted);
    } catch (error) {
      toast.error('Failed to fetch chart data');
    }
  };

  const fetchDataByDate = async (date) => {
    if (!date) return;
    try {
      const response = await sensorAPI.getByDate(date);
      const formatted = (response.data.data || []).map((r) => ({
        ...r,
        timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setChartData(formatted);
    } catch (error) {
      toast.error('Failed to fetch data for selected date');
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await sensorAPI.exportExcel(selectedDate);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `greenhouse-data-${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Greenhouse Dashboard</h1>
          <p className="text-gray-500">Real-time monitoring and historical data</p>
        </div>
        <Button variant="secondary" onClick={downloadExcel} icon={<Download className="w-4 h-4" />}>
          Export Data (.xlsx)
        </Button>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard label="Temperature" value={sensorData?.temp?.toFixed(1)} unit="°C" icon={Thermometer} colorClass="bg-orange-500" />
        <SensorCard label="Humidity" value={sensorData?.hum?.toFixed(1)} unit="%" icon={Droplets} colorClass="bg-blue-500" />
        <SensorCard label="Light Level" value={sensorData?.light?.toFixed(0)} unit="lux" icon={Sun} colorClass="bg-yellow-500" />
        <SensorCard label="Soil Moisture" value={sensorData?.soil_moisture?.toFixed(0)} unit="%" icon={Droplets} colorClass="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Climate Trends</h2>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 ml-2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none pr-2"
              />
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No data for this date.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} name="Temp (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Live Webcam */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="font-semibold">Live Camera Feed</h2>
          </div>
          <div className="relative aspect-video bg-gray-900 group">
            <img
              src={`${process.env.REACT_APP_API_URL}/webcam/stream`}
              alt="Greenhouse Live"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="ghost" className="text-white border-white hover:bg-white/20">
                <Play className="w-5 h-5 mr-2" /> Expand Feed
              </Button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 text-gray-600 text-xs font-medium">
            System Status: Monitoring Active
          </div>
        </div>
      </div>
    </div>
  );
};
