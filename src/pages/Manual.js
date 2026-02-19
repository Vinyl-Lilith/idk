import { useState, useEffect } from 'react';
import { manualAPI, sensorAPI } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { Switch } from '../components/ui/Switch';
import { Slider } from '../components/ui/Slider';
import { Button } from '../components/ui/Button';
import { 
  Power, 
  Fan, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  RotateCcw,
  Wind,
  FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Manual = () => {
  // ⬇️ YOUR ORIGINAL STATE LOGIC
  const [sensorData, setSensorData] = useState(null);
  const [actuators, setActuators] = useState({
    pump_water: false,
    pump_nutrient: false,
    fan_exhaust: false,
    peltier: false,
    fan_peltier_hot: false,
    fan_peltier_cold: false,
  });
  const [pwm, setPwm] = useState({
    fan_exhaust: 0,
    peltier: 0,
  });
  const [manualMode, setManualMode] = useState(false);
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchLatestData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewReading = (reading) => {
      setSensorData(reading);
      if (reading.actuators) {
        setActuators(reading.actuators);
        setManualMode(reading.actuators.manual_override);
      }
    };
    const handleManualControl = (data) => {
      setActuators(prev => ({ ...prev, [data.actuator]: data.state }));
    };

    socket.on('new_reading', handleNewReading);
    socket.on('manual_control', handleManualControl);

    return () => {
      socket.off('new_reading', handleNewReading);
      socket.off('manual_control', handleManualControl);
    };
  }, [socket]);

  const fetchLatestData = async () => {
    try {
      const response = await sensorAPI.getLatest();
      setSensorData(response.data.data);
      if (response.data.data.actuators) {
        setActuators(response.data.data.actuators);
        setManualMode(response.data.data.actuators.manual_override);
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  };

  const controlActuator = async (actuator, state, pwmValue = null) => {
    try {
      const data = { actuator, state };
      if (pwmValue !== null) {
        data.pwm = pwmValue;
      }
      await manualAPI.control(data);
      toast.success(`${actuator.replace('_', ' ')} ${state ? 'ON' : 'OFF'}`);
    } catch (error) {
      toast.error('Failed to control actuator');
    }
  };

  const resumeAuto = async () => {
    if (!window.confirm('Resume automatic mode? Manual controls will be disabled.')) return;
    try {
      await manualAPI.resumeAuto();
      setManualMode(false);
      toast.success('Automatic mode resumed');
    } catch (error) {
      toast.error('Failed to resume automatic mode');
    }
  };

  const handlePWMChange = (actuator, value) => {
    setPwm({ ...pwm, [actuator]: value });
    controlActuator(actuator, true, value);
  };
  // ⬆️ ORIGINAL LOGIC ENDS

  // Internal Helper Component for Actuator Cards
  const ActuatorCard = ({ icon: Icon, title, name, color, hasPwm = false }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
          </div>
          <Switch 
            checked={actuators[name]} 
            onChange={(val) => controlActuator(name, val)} 
          />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      </div>
      
      {hasPwm && (
        <div className="mt-4">
          <Slider 
            label="Power (PWM)"
            min="0"
            max="255"
            value={pwm[name] || 0}
            onChange={(val) => handlePWMChange(name, val)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Controls</h1>
          <p className="text-gray-500">Override the automated system for direct maintenance.</p>
        </div>
        
        {manualMode && (
          <Button 
            variant="danger" 
            onClick={resumeAuto}
            icon={<RotateCcw className="w-4 h-4" />}
            className="animate-pulse shadow-lg shadow-red-100"
          >
            Resume Automatic Mode
          </Button>
        )}
      </div>

      {/* Manual Mode Alert Bar */}
      {manualMode ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
          <AlertTriangle className="flex-shrink-0" size={20} />
          <p className="text-sm font-medium">
            <strong>Manual Override Active:</strong> Greenhouse automation is currently paused. Remember to resume automatic mode when finished.
          </p>
        </div>
      ) : (
        <div className="bg-nature-50 border border-nature-100 p-4 rounded-xl flex items-center gap-3 text-nature-700">
          <Power className="text-nature-500" size={18} />
          <span className="text-sm font-medium">System following automation logic. Using any toggle below will trigger Manual Mode.</span>
        </div>
      )}

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Irrigation Section */}
        <ActuatorCard icon={Droplets} title="Water Pump" name="pump_water" color="bg-blue-500" />
        <ActuatorCard icon={FlaskConical} title="Nutrient Pump" name="pump_nutrient" color="bg-purple-500" />
        
        {/* Climate Section */}
        <ActuatorCard icon={Wind} title="Exhaust Fan" name="fan_exhaust" color="bg-emerald-500" hasPwm={true} />
        <ActuatorCard icon={Zap} title="Peltier Cooler" name="peltier" color="bg-orange-500" hasPwm={true} />
        
        {/* Peltier Secondary Controls */}
        <ActuatorCard icon={Fan} title="Peltier Hot Fan" name="fan_peltier_hot" color="bg-red-500" />
        <ActuatorCard icon={Fan} title="Peltier Cold Fan" name="fan_peltier_cold" color="bg-sky-500" />
      </div>

      {/* Real-time Status Footer */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Current Environment Reading</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-500">Temp</p>
            <p className="text-lg font-bold text-gray-900">{sensorData?.temp?.toFixed(1) || '--'} °C</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="text-lg font-bold text-gray-900">{sensorData?.hum?.toFixed(1) || '--'} %</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Soil 1</p>
            <p className="text-lg font-bold text-gray-900">{sensorData?.soil1?.toFixed(1) || '--'} %</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Soil 2</p>
            <p className="text-lg font-bold text-gray-900">{sensorData?.soil2?.toFixed(1) || '--'} %</p>
          </div>
        </div>
      </div>
    </div>
  );
};
