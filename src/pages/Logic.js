import { useState, useEffect } from 'react';
import { thresholdAPI } from '../services/api'; // Matches your import
import { useWebSocket } from '../context/WebSocketContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Save, 
  RefreshCw, 
  Thermometer, 
  Droplets, 
  FlaskConical, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Logic = () => {
  // ⬇️ YOUR ORIGINAL LOGIC
  const [thresholds, setThresholds] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchThresholds();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('threshold_update', () => {
      fetchThresholds();
    });
    return () => socket.off('threshold_update');
  }, [socket]);

  const fetchThresholds = async () => {
    try {
      const response = await thresholdAPI.get();
      setThresholds(response.data.data);
      setEditing(response.data.data);
    } catch (error) {
      console.error('Failed to fetch thresholds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setEditing({ ...editing, [key]: parseFloat(value) });
  };

  const saveThreshold = async (key) => {
    try {
      await thresholdAPI.update({ [key]: editing[key] });
      toast.success(`${key} updated successfully`);
      fetchThresholds();
    } catch (error) {
      toast.error('Failed to update threshold');
    }
  };

  const saveAll = async (e) => {
    e.preventDefault(); // Prevent form reload
    try {
      const updates = {
        soil1: editing.soil1,
        soil2: editing.soil2,
        temp_high: editing.temp_high,
        temp_low: editing.temp_low,
        hum_high: editing.hum_high,
        hum_low: editing.hum_low,
        npk_n: editing.npk_n,
        npk_p: editing.npk_p,
        npk_k: editing.npk_k,
      };
      await thresholdAPI.update(updates);
      toast.success('All thresholds updated successfully');
      fetchThresholds();
    } catch (error) {
      toast.error('Failed to update thresholds');
    }
  };
  // ⬆️ LOGIC ENDS

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-nature-600">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium">Loading automation logic...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Logic</h1>
          <p className="text-gray-500">Configure thresholds for automated greenhouse systems</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4 text-nature-500" />
          <span>Last Synced: {thresholds?.lastSyncedWithArduino ? new Date(thresholds.lastSyncedWithArduino).toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>

      <form onSubmit={saveAll} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Soil Moisture Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-gray-50 pb-3 mb-4">
              <Droplets size={20} /> 
              <h3>Soil Moisture (%)</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-end gap-2">
                <Input 
                  label="Soil Sensor 1" 
                  type="number" 
                  className="flex-1"
                  value={editing.soil1 || ''} 
                  onChange={(e) => handleChange('soil1', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('soil1')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Input 
                  label="Soil Sensor 2" 
                  type="number" 
                  className="flex-1"
                  value={editing.soil2 || ''} 
                  onChange={(e) => handleChange('soil2', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('soil2')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
            </div>
          </section>

          {/* Temperature Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold border-b border-gray-50 pb-3 mb-4">
              <Thermometer size={20} /> 
              <h3>Climate Control (°C)</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-end gap-2">
                <Input 
                  label="High (Cooling ON)" 
                  type="number"
                  className="flex-1"
                  value={editing.temp_high || ''} 
                  onChange={(e) => handleChange('temp_high', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('temp_high')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Input 
                  label="Low (Alert/Heat)" 
                  type="number"
                  className="flex-1"
                  value={editing.temp_low || ''} 
                  onChange={(e) => handleChange('temp_low', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('temp_low')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
            </div>
          </section>

          {/* Humidity Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-gray-50 pb-3 mb-4">
              <Droplets size={20} /> 
              <h3>Air Humidity (%)</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-end gap-2">
                <Input 
                  label="High (Exhaust ON)" 
                  type="number"
                  className="flex-1"
                  value={editing.hum_high || ''} 
                  onChange={(e) => handleChange('hum_high', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('hum_high')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Input 
                  label="Low (Alert)" 
                  type="number"
                  className="flex-1"
                  value={editing.hum_low || ''} 
                  onChange={(e) => handleChange('hum_low', e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => saveThreshold('hum_low')} className="mb-0.5 px-3">
                  <CheckCircle2 size={18} />
                </Button>
              </div>
            </div>
          </section>

          {/* NPK Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-purple-600 font-bold border-b border-gray-50 pb-3 mb-4">
              <FlaskConical size={20} /> 
              <h3>Soil Nutrients (mg/kg)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input 
                label="Nitrogen" 
                type="number"
                value={editing.npk_n || ''} 
                onChange={(e) => handleChange('npk_n', e.target.value)}
              />
              <Input 
                label="Phosphorus" 
                type="number"
                value={editing.npk_p || ''} 
                onChange={(e) => handleChange('npk_p', e.target.value)}
              />
              <Input 
                label="Potassium" 
                type="number"
                value={editing.npk_k || ''} 
                onChange={(e) => handleChange('npk_k', e.target.value)}
              />
            </div>
            <div className="pt-2 text-xs text-gray-400 italic">
              * Note: NPK updates are suggested to be saved via "Save All Changes" below.
            </div>
          </section>
        </div>

        {/* Global Action Bar */}
        <div className="sticky bottom-6 bg-nature-900 text-white p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-nature-800">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-nature-800/50 rounded-xl">
                <Save className="text-nature-400 w-6 h-6" />
             </div>
             <div>
               <p className="font-semibold text-lg leading-tight">Sync Global Changes</p>
               <p className="text-nature-300 text-xs mt-1">Updates all thresholds across all sensors simultaneously.</p>
             </div>
          </div>
          <Button 
            type="submit" 
            className="w-full sm:w-auto bg-white text-nature-900 hover:bg-nature-50 px-8 py-3 text-base font-bold transition-transform active:scale-95"
          >
            Save All Changes
          </Button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-400 px-2 italic">
        <p>Database Record: {thresholds?.updatedAt ? new Date(thresholds.updatedAt).toLocaleString() : 'N/A'}</p>
        <p>Encrypted via JWT Protocol • Greenhouse ID: GH-01</p>
      </div>
    </div>
  );
};
