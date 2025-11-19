
export interface CalculationParams {
    endTime: string;
    defaultPace: number;
    bufferMinutes: number;
    useIndividualPace: boolean;
    smartAdjustment: boolean; // New toggle for non-linear prediction
}

export interface DriverCalculated {
    id: string;
    routeId: string; // Extracted from Col 0
    name: string;
    remaining: number;
    completed: number;
    total: number;
    progress: number; // 0-100
    canComplete: number;
    diff: number; // Positive means they need help, negative means surplus
    pace: number;
    paceSource: 'default' | 'file';
    eta: string; // Formatted time string (e.g. "18:45")
}

export interface SummaryData {
    totalDrivers: number;
    totalRescueNeeded: number;
    totalStopsToRescue: number;
    totalStopsAvailable: number;
}

export interface CalculationResult {
    results: DriverCalculated[];
    summary: SummaryData | null;
    meta: {
        hoursRemaining: number;
        deadline: string;
    } | null;
}
