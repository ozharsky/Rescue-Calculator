
import { DriverCalculated, CalculationParams, CalculationResult } from '../types';

/**
 * Calculates driver statistics based on raw Excel data and parameters.
 */
export const calculateDriverStats = (
    rawData: any[][], 
    params: CalculationParams
): CalculationResult => {
    const { endTime, defaultPace, bufferMinutes, useIndividualPace, smartAdjustment } = params;

    // 1. Calculate Time Budget
    const now = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Create Date object for today at the target end time
    const shiftEnd = new Date(now);
    shiftEnd.setHours(endHours, endMinutes, 0, 0);

    // Handle shift crossing midnight
    if (shiftEnd.getTime() < now.getTime()) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    // Apply buffer (subtract buffer from end time)
    const lastStopDeadline = new Date(shiftEnd.getTime() - bufferMinutes * 60 * 1000);
    
    // Recalculate if deadline is now in the past
    const diffMs = lastStopDeadline.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, diffMs / (1000 * 60 * 60));

    // --- Smart Prediction Factors ---
    // If smartAdjustment is on, and we are within the last 2.5 hours of the shift (Rush Hour / Fatigue window),
    // we apply a penalty to the pace.
    let efficiencyFactor = 1.0;
    if (smartAdjustment) {
        if (hoursRemaining < 2.5) {
             efficiencyFactor = 0.85; // 15% slowdown due to traffic/fatigue
        } else if (hoursRemaining < 4) {
             efficiencyFactor = 0.92; // 8% slowdown
        }
    }

    const processedDrivers: DriverCalculated[] = [];

    // 2. Iterate Rows (Skip header row 0)
    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length < 12) continue;

        // Column mapping based on standard itinerary files
        const rawRouteId = row[0]; // Assuming Col 0 is ID/Route
        const driverName = row[1];
        const stopsCompleted = parseInt(row[11], 10);
        const stopsRemaining = parseInt(row[12], 10);

        if (!driverName || isNaN(stopsRemaining) || isNaN(stopsCompleted)) {
            continue;
        }

        // Determine Base Pace
        let currentPace = defaultPace;
        let paceSource: 'default' | 'file' = 'default';

        if (useIndividualPace && row[14] !== undefined) {
            const filePace = parseFloat(row[14]);
            if (!isNaN(filePace) && filePace > 0) {
                currentPace = filePace;
                paceSource = 'file';
            }
        }

        // Apply Efficiency Factor
        const effectivePace = currentPace * efficiencyFactor;

        // Calculate Capacity
        const canComplete = Math.floor(hoursRemaining * effectivePace);
        
        // Diff: > 0 means they have more remaining than they can do (Rescue Needed)
        const diff = stopsRemaining - canComplete;

        // Calculate ETA
        // Hours needed = Remaining / Pace
        const hoursNeeded = stopsRemaining / effectivePace;
        const projectedFinishTime = new Date(now.getTime() + hoursNeeded * 60 * 60 * 1000);
        const etaString = projectedFinishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Calculate Progress
        const totalStops = stopsCompleted + stopsRemaining;
        const progress = totalStops > 0 ? Math.round((stopsCompleted / totalStops) * 100) : 0;

        processedDrivers.push({
            id: `row-${i}`,
            routeId: rawRouteId || `RT-${100+i}`,
            name: String(driverName).replace(/"/g, ''),
            remaining: stopsRemaining,
            completed: stopsCompleted,
            total: totalStops,
            progress: progress,
            canComplete: canComplete,
            diff: diff,
            pace: currentPace, 
            paceSource: paceSource,
            eta: etaString
        });
    }

    // 3. Aggregation
    const driversBehind = processedDrivers.filter(d => d.diff > 0);
    const driversAhead = processedDrivers.filter(d => d.diff <= 0);

    const summary = {
        totalDrivers: processedDrivers.length,
        totalRescueNeeded: driversBehind.length,
        totalStopsToRescue: driversBehind.reduce((sum, d) => sum + d.diff, 0),
        totalStopsAvailable: driversAhead.reduce((sum, d) => sum + Math.abs(d.diff), 0),
    };

    return {
        results: processedDrivers,
        summary,
        meta: {
            hoursRemaining,
            deadline: lastStopDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    };
};
