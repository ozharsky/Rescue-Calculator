import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Truck, LayoutDashboard, Sparkles, Bot, Settings as SettingsIcon } from 'lucide-react';
import { ConfigPanel } from './components/ConfigPanel';
import { FileUpload } from './components/FileUpload';
import { SummaryStats } from './components/SummaryStats';
import { DriverList } from './components/DriverList';
import { ResultsChart } from './components/ResultsChart';
import { ApiKeyModal } from './components/ApiKeyModal';
import { calculateDriverStats } from './services/calculationService';
import { generateRescuePlan } from './services/aiService';
import { CalculationParams } from './types';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration State
  const [params, setParams] = useState<CalculationParams>({
    endTime: '20:05',
    defaultPace: 20,
    bufferMinutes: 30,
    useIndividualPace: false,
    smartAdjustment: true, // Default to smart mode
  });

  // Load key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveKey = (key: string) => {
      localStorage.setItem('gemini_api_key', key);
      setApiKey(key);
  };

  const handleDataLoaded = useCallback((data: any[][], name: string) => {
    setRawData(data);
    setFileName(name);
    setAiPlan(null); // Reset AI plan on new file
  }, []);

  const handleParamChange = useCallback((key: keyof CalculationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setAiPlan(null); // Reset AI plan on config change as numbers change
  }, []);

  // Memoize calculations so they only run when data or params change
  const { results, summary, meta } = useMemo(() => {
    if (!rawData) {
      return { results: [], summary: null, meta: null };
    }
    return calculateDriverStats(rawData, params);
  }, [rawData, params]);

  const driversNeedingRescue = useMemo(() => 
    results.filter(d => d.diff > 0).sort((a, b) => b.diff - a.diff),
  [results]);

  const driversOnPace = useMemo(() => 
    results.filter(d => d.diff <= 0).sort((a, b) => a.diff - b.diff),
  [results]);

  const handleGenerateAiPlan = async () => {
    if (!summary || !meta) return;
    
    if (!apiKey) {
        setShowSettings(true);
        return;
    }
    
    setAiLoading(true);
    try {
      const plan = await generateRescuePlan(
        apiKey,
        driversNeedingRescue, 
        driversOnPace, 
        summary, 
        meta.hoursRemaining
      );
      setAiPlan(plan);
    } catch (e) {
      setAiPlan("Could not contact AI service. Please check your API Key.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
                <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Driver Rescue Dashboard</h1>
                <p className="text-xs text-gray-500">Logistics & Delivery Analysis</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
            title="Settings"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <ApiKeyModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={handleSaveKey} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 xl:col-span-3 border-r border-gray-100 pr-0 lg:pr-6">
               <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">1. Upload Data</h2>
               <FileUpload 
                 onDataLoaded={handleDataLoaded} 
                 currentFileName={fileName}
               />
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">2. Configuration</h2>
              <ConfigPanel params={params} onChange={handleParamChange} />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && summary && meta ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Status Banner & AI Button */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md flex-1">
                  <div className="flex items-center">
                     <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Analysis Complete {params.smartAdjustment && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full ml-2">Smart Mode Active</span>}</h3>
                        <div className="text-sm text-blue-700 mt-1">
                           <span className="font-semibold">{meta.hoursRemaining.toFixed(2)} hours</span> remaining until strict cutoff.
                           Drivers must finish by <span className="font-semibold">{meta.deadline}</span> (includes {params.bufferMinutes}m buffer).
                        </div>
                     </div>
                  </div>
                </div>
                
                <button 
                    onClick={handleGenerateAiPlan}
                    disabled={aiLoading || driversNeedingRescue.length === 0}
                    className={`flex items-center justify-center px-6 py-4 rounded-lg shadow-sm font-medium transition-all
                        ${aiLoading 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-md hover:from-violet-700 hover:to-indigo-700'}
                    `}
                >
                    {aiLoading ? (
                        <>Generating Plan...</>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate AI Rescue Plan
                        </>
                    )}
                </button>
            </div>
            
            {/* AI Result Box */}
            {aiPlan && (
                <div className="bg-indigo-900 text-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    <div className="bg-indigo-800/50 p-3 border-b border-indigo-700 flex items-center">
                        <Bot className="w-5 h-5 mr-2 text-indigo-300" />
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-indigo-100">Gemini Rescue Strategy</h3>
                    </div>
                    <div className="p-6 prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap font-sans text-indigo-50">{aiPlan}</div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <SummaryStats summary={summary} />

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <LayoutDashboard className="w-5 h-5 mr-2 text-gray-400" />
                    Fleet Projection
                  </h3>
                </div>
                <div className="h-[400px] w-full">
                  <ResultsChart data={results} />
                </div>
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DriverList 
                title="Rescue Needed" 
                drivers={driversNeedingRescue} 
                type="danger"
              />
              <DriverList 
                title="On Pace / Ahead" 
                drivers={driversOnPace} 
                type="success"
              />
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Truck className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No Data to Analyze</h3>
             <p className="text-gray-500 max-w-sm mx-auto mt-2">Upload an itinerary file (.xlsx or .csv) above to begin calculating driver rescues.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;