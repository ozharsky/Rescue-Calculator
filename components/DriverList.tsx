
import React, { useState } from 'react';
import { DriverCalculated } from '../types';
import { User, Package, Activity, MapPin, Clock, Search } from 'lucide-react';

interface DriverListProps {
    title: string;
    drivers: DriverCalculated[];
    type: 'danger' | 'success';
}

export const DriverList: React.FC<DriverListProps> = ({ title, drivers, type }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const isDanger = type === 'danger';

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.routeId.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full max-h-[700px]">
            {/* Header */}
            <div className={`px-4 py-3 border-b border-gray-100 ${isDanger ? 'bg-red-50/50' : 'bg-green-50/50'} rounded-t-xl`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold flex items-center ${isDanger ? 'text-red-900' : 'text-green-900'}`}>
                        {title} 
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${isDanger ? 'bg-red-100 border-red-200' : 'bg-green-100 border-green-200'}`}>
                            {drivers.length}
                        </span>
                    </h3>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by name or route ID..."
                        className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* List Content */}
            <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
                {filteredDrivers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-sm">No drivers found.</p>
                    </div>
                ) : (
                    filteredDrivers.map((driver) => (
                        <div 
                            key={driver.id} 
                            className="group relative bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                        >
                            {/* Hover Tooltip / Route Info Card */}
                            <div className="absolute left-0 top-full mt-2 z-20 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                <div className="bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 relative">
                                    <div className="absolute -top-1 left-8 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-600 pb-2 mb-2">
                                            <span className="font-bold text-slate-200">Route Details</span>
                                            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{driver.routeId}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-2 text-indigo-400" />
                                            <span>Proj. Finish: <strong className="text-white">{driver.eta}</strong></span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-3 h-3 mr-2 text-indigo-400" />
                                            <span>Total Stops: {driver.total}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Activity className="w-3 h-3 mr-2 text-indigo-400" />
                                            <span>Efficiency: {Math.round((driver.completed / (driver.total || 1)) * 100)}% Complete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Card Content */}
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center overflow-hidden">
                                    <div className={`flex-shrink-0 p-1.5 rounded-full mr-2 ${isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
                                        <User className={`w-4 h-4 ${isDanger ? 'text-red-600' : 'text-green-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">{driver.name}</h4>
                                        <p className="text-[10px] text-gray-400">Route: {driver.routeId}</p>
                                    </div>
                                </div>
                                <div className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                                    isDanger ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {isDanger ? `-${driver.diff}` : `+${Math.abs(driver.diff)}`}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-2 mb-2">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{driver.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-1.5 rounded-full ${isDanger ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{ width: `${driver.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-gray-50 p-1.5 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-500 flex items-center">
                                        <Package className="w-3 h-3 mr-1" /> Left
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">{driver.remaining}</div>
                                </div>
                                <div className="bg-gray-50 p-1.5 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-500 flex items-center">
                                        <Activity className="w-3 h-3 mr-1" /> Pace
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {driver.pace.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Rescue Context */}
                            {isDanger && (
                                <div className="mt-2 text-xs bg-red-50 text-red-700 p-1.5 rounded border border-red-100 flex items-center justify-center font-medium">
                                    Needs rescue for {driver.diff} stops
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
