import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DriverCalculated } from '../types';

interface ResultsChartProps {
    data: DriverCalculated[];
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
    // Transform data for the chart to make it stacked and intuitive
    // We want: 
    // 1. Completed (Green)
    // 2. Can Complete (Blue)
    // 3. Deficit (Red) - only if they need rescue
    
    const chartData = data.map(d => ({
        name: d.name,
        Completed: d.completed,
        Projected: d.canComplete,
        RescueNeeded: d.diff > 0 ? d.diff : 0,
        Surplus: d.diff < 0 ? Math.abs(d.diff) : 0
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80} 
                    tick={{fontSize: 11, fill: '#6B7280'}}
                />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} />
                <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                
                {/* Completed stops - Base layer */}
                <Bar dataKey="Completed" stackId="a" fill="#10B981" name="Completed" />
                
                {/* Capacity remaining */}
                <Bar dataKey="Projected" stackId="a" fill="#3B82F6" name="Projected Capacity" />
                
                {/* If they need rescue, it sits on top */}
                <Bar dataKey="RescueNeeded" stackId="a" fill="#EF4444" name="Needs Rescue" />
            </BarChart>
        </ResponsiveContainer>
    );
};