import React from 'react';
import { Clock, Gauge, Timer, BrainCircuit } from 'lucide-react';
import { CalculationParams } from '../types';

interface ConfigPanelProps {
    params: CalculationParams;
    onChange: (key: keyof CalculationParams, value: any) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ params, onChange }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {/* End Time */}
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    End of Shift
                </label>
                <input 
                    type="time" 
                    value={params.endTime}
                    onChange={(e) => onChange('endTime', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white"
                />
            </div>

            {/* Pace */}
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <Gauge className="w-3.5 h-3.5 mr-1.5" />
                    Default Pace (stops/hr)
                </label>
                <input 
                    type="number" 
                    value={params.defaultPace}
                    min="1"
                    onChange={(e) => onChange('defaultPace', Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white"
                />
                <div className="mt-2 flex items-center">
                    <input 
                        id="useIndividualPace" 
                        type="checkbox"
                        checked={params.useIndividualPace}
                        onChange={(e) => onChange('useIndividualPace', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useIndividualPace" className="ml-2 block text-xs text-gray-600">
                        Use file pace
                    </label>
                </div>
            </div>

            {/* Buffer */}
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-1.5" />
                    Buffer (minutes)
                </label>
                <div className="relative rounded-md shadow-sm">
                    <input 
                        type="number" 
                        value={params.bufferMinutes}
                        min="0"
                        onChange={(e) => onChange('bufferMinutes', Number(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white"
                    />
                </div>
            </div>

            {/* Smart Prediction */}
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center">
                    <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                    AI Prediction Mode
                </label>
                <div className="flex items-center mt-3">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="smartAdjustment" 
                            id="smartAdjustment" 
                            checked={params.smartAdjustment}
                            onChange={(e) => onChange('smartAdjustment', e.target.checked)}
                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-indigo-600 border-gray-300"
                            style={{ right: params.smartAdjustment ? '0' : 'auto', left: params.smartAdjustment ? 'auto' : '0' }}
                        />
                        <label 
                            htmlFor="smartAdjustment" 
                            className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${params.smartAdjustment ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        ></label>
                    </div>
                    <label htmlFor="smartAdjustment" className="text-xs text-gray-700">
                        Account for traffic & fatigue
                    </label>
                </div>
            </div>
        </div>
    );
};