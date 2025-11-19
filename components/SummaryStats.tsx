import React from 'react';
import { Users, AlertTriangle, PackageX, PackageCheck } from 'lucide-react';
import { StatCard } from './SummaryCards';
import { SummaryData } from '../types';

interface SummaryStatsProps {
    summary: SummaryData;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                label="Total Drivers"
                value={summary.totalDrivers}
                icon={Users}
                colorClass="text-gray-600"
                bgClass="bg-gray-50"
            />
            <StatCard 
                label="Drivers Needing Rescue"
                value={summary.totalRescueNeeded}
                icon={AlertTriangle}
                colorClass="text-red-600"
                bgClass="bg-red-50"
            />
            <StatCard 
                label="Stops to Rescue"
                value={summary.totalStopsToRescue}
                icon={PackageX}
                colorClass="text-red-600"
                bgClass="bg-red-50"
            />
            <StatCard 
                label="Surplus Stops"
                value={summary.totalStopsAvailable}
                icon={PackageCheck}
                colorClass="text-green-600"
                bgClass="bg-green-50"
            />
        </div>
    );
};