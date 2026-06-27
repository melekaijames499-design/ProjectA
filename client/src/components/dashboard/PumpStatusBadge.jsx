import React from 'react';
import { Power, Zap } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const PumpStatusBadge = ({ status, lastChanged, triggerType }) => {
  const isOn = status === 'ON';

  return (
    <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
      isOn
        ? 'bg-emerald-50 ring-1 ring-emerald-200'
        : 'bg-gray-50 ring-1 ring-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${isOn ? 'bg-emerald-100' : 'bg-gray-100'}`}>
          <Power className={`h-6 w-6 ${isOn ? 'text-emerald-700' : 'text-gray-500'}`} />
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
          isOn
            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
            : 'bg-gray-100 text-gray-600 ring-1 ring-gray-300'
        }`}>
          {isOn ? 'Running' : 'Idle'}
        </span>
      </div>

      <div className="mt-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Water Pump</p>
        <div className="flex items-center space-x-2">
          {/* Animated indicator */}
          <span className={`inline-flex h-3.5 w-3.5 rounded-full ${
            isOn ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'
          }`} />
          <span className={`text-3xl font-black font-outfit ${isOn ? 'text-emerald-700' : 'text-gray-500'}`}>
            {isOn ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center space-x-1 mt-2">
          {triggerType && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              triggerType === 'auto' ? 'bg-amber-100 text-amber-700' :
              triggerType === 'schedule' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {triggerType.toUpperCase()}
            </span>
          )}
          {lastChanged && (
            <p className="text-[11px] text-gray-400 font-medium">{formatRelativeTime(lastChanged)}</p>
          )}
        </div>
      </div>

      {isOn && (
        <div className="mt-4 flex items-center space-x-1.5 text-emerald-700 bg-emerald-100/60 rounded-lg px-3 py-1.5">
          <Zap className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold">Irrigation Active</span>
        </div>
      )}
    </div>
  );
};

export default PumpStatusBadge;
