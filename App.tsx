
import React, { useState, useMemo, useCallback } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Upload, 
  Calculator, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Copy, 
  Check,
  Settings2,
  Table as TableIcon,
  BarChart3,
  Info
} from 'lucide-react';
import { DataPoint, CalculationResults } from './types';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<string>('');
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
  }, [data]);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const parsedData = lines.slice(1).map((line, idx) => {
      const values = line.split(',');
      const obj: DataPoint = { id: idx };
      headers.forEach((header, i) => {
        const val = parseFloat(values[i]);
        obj[header] = isNaN(val) ? values[i] : val;
      });
      return obj;
    });

    setData(parsedData);
    if (headers.includes('TS1')) {
        setSelectedColumn('TS1');
    } else {
        const numericCol = headers.find(h => typeof parsedData[0][h] === 'number');
        if (numericCol) setSelectedColumn(numericCol);
    }
  };

  const calculate = useCallback(() => {
    if (!selectedColumn || data.length === 0) return;

    const values = data
      .map(d => d[selectedColumn])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) return;

    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    
    // Sample Variance (ddof=1)
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    const conventions = [250, 252, 260, 360, 365].map(days => {
      const annualMean = mean * days;
      const annualStdDev = stdDev * Math.sqrt(days);
      return {
        name: `${days}-Day Convention`,
        days,
        annualMean,
        annualStdDev,
        meanPercent: (annualMean * 100).toFixed(4) + '%',
        stdDevPercent: (annualStdDev * 100).toFixed(4) + '%'
      };
    });

    setResults({
      dailyMean: mean,
      dailyStdDev: stdDev,
      sampleSize: n,
      conventions
    });
  }, [data, selectedColumn]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const chartData = useMemo(() => {
    return data.map((d, i) => ({
      index: i,
      value: d[selectedColumn] as number
    })).slice(0, 500);
  }, [data, selectedColumn]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10 border-b border-slate-300 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-xl border border-slate-700">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Diagnostics<span className="text-indigo-600">.</span>
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl font-semibold text-lg leading-snug">
            Time Series Diagnostics Dashboard
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Engine Active: v1.2.1
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Data Import */}
          <section className="bg-white rounded-2xl shadow-md border-2 border-slate-300 p-6 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="text-slate-900 w-5 h-5" />
              <h2 className="font-black text-slate-900 uppercase tracking-tight">Dataset Import</h2>
            </div>
            <div className="relative group">
              <textarea
                className="w-full h-80 p-5 mono text-sm bg-slate-900 border-2 border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all resize-none text-emerald-400 placeholder-slate-600 font-bold leading-relaxed"
                placeholder="Paste CSV:&#10;Date,TS1&#10;2023-01-01,0.0012&#10;2023-01-02,-0.005"
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">
                Raw CSV Input
              </div>
            </div>
            <button
              onClick={() => parseCSV(rawData)}
              className="w-full mt-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-all shadow-[0_4px_20px_0_rgba(79,70,229,0.4)] active:scale-[0.97] flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              <Upload size={18} />
              Load Data Series
            </button>
          </section>

          {/* Configuration */}
          {columns.length > 0 && (
            <section className="bg-white rounded-2xl shadow-md border-2 border-slate-300 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 className="text-slate-900 w-5 h-5" />
                <h2 className="font-black text-slate-900 uppercase tracking-tight">Processing Parameters</h2>
              </div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Active Data Column</label>
              <div className="relative group">
                <select
                  className="w-full p-4 bg-slate-100 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none font-black text-slate-900 group-hover:border-slate-400 transition-colors cursor-pointer"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-900">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
              
              <button
                onClick={calculate}
                className="w-full mt-5 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black transition-all shadow-xl active:scale-[0.97] flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                <Calculator size={18} />
                Execute Math
              </button>
            </section>
          )}

          {/* Reference Info */}
          <div className="bg-slate-800 text-slate-300 p-6 rounded-2xl border border-slate-700 shadow-inner">
             <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Formulas Used</h3>
             </div>
             <ul className="space-y-3 text-[11px] font-bold leading-relaxed">
                <li className="flex gap-2">
                   <span className="text-indigo-400">•</span>
                   <span>Annualized Mean = Daily Mean × Days</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-indigo-400">•</span>
                   <span>Annualized Volatility = Daily σ × √Days</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-indigo-400">•</span>
                   <span>Standard Deviation uses Bessels' Correction (N-1) for sample variance.</span>
                </li>
             </ul>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-8 space-y-8">
          {results ? (
            <>
              {/* Daily Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Daily Arithmetic Mean', val: results.dailyMean.toFixed(8), color: 'bg-indigo-600' },
                  { label: 'Daily Return Volatility', val: results.dailyStdDev.toFixed(8), color: 'bg-indigo-600' },
                  { label: 'Sample Observations (N)', val: results.sampleSize.toLocaleString(), color: 'bg-slate-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-colors">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.color}`}></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mono">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Data Visualization */}
              <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md h-96">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="font-black text-xl text-slate-900 flex items-center gap-3 tracking-tighter">
                     <TrendingUp className="w-6 h-6 text-indigo-600" />
                     Returns Distribution Series
                   </h3>
                   <div className="flex gap-2">
                      <span className="px-3 py-1 bg-slate-900 rounded-full text-[9px] font-black text-white uppercase tracking-widest">Historical Basis</span>
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest">N=500 Limit</span>
                   </div>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="quantGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                     <XAxis dataKey="index" hide />
                     <YAxis fontSize={11} tickFormatter={(v) => v.toFixed(3)} stroke="#64748b" fontWeight="bold" />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '3px solid #000', backgroundColor: '#fff', boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: '900', color: '#4f46e5', fontFamily: 'JetBrains Mono' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(v: number) => [v.toFixed(8), 'VAL']}
                     />
                     <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#quantGradient)" strokeWidth={3} />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>

              {/* Annualization Table */}
              <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.1)] overflow-hidden">
                <div className="p-6 bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <TableIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="font-black text-xl tracking-tight uppercase">Annualization Matrix</h3>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                    Precision: 4 Decimal Places
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b-4 border-slate-900">
                        <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest border-r-2 border-slate-200">Convention</th>
                        <th className="px-8 py-5 text-[11px] font-black text-indigo-900 uppercase tracking-widest bg-indigo-50/50 border-r-2 border-slate-200">Mean Return (Dec)</th>
                        <th className="px-8 py-5 text-[11px] font-black text-emerald-900 uppercase tracking-widest bg-emerald-50/50 border-r-2 border-slate-200">Std Deviation (Dec)</th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Percentage Basis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                      {results.conventions.map((c) => (
                        <tr key={c.name} className="hover:bg-indigo-50/20 transition-all group">
                          <td className="px-8 py-6 font-black text-slate-900 border-r-2 border-slate-100 text-lg tracking-tight">{c.name}</td>
                          <td className="px-8 py-6 mono text-xl font-black text-indigo-700 bg-indigo-50/10 border-r-2 border-slate-100 relative group/cell">
                            {c.annualMean.toFixed(4)}
                            <button 
                              onClick={() => copyToClipboard(c.annualMean.toFixed(4), `mean-${c.days}`)}
                              className="ml-4 p-2 bg-slate-900 text-white rounded shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                              title="Copy"
                            >
                              {copiedKey === `mean-${c.days}` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </td>
                          <td className="px-8 py-6 mono text-xl font-black text-emerald-700 bg-emerald-50/10 border-r-2 border-slate-100 relative group/cell">
                            {c.annualStdDev.toFixed(4)}
                            <button 
                              onClick={() => copyToClipboard(c.annualStdDev.toFixed(4), `std-${c.days}`)}
                              className="ml-4 p-2 bg-slate-900 text-white rounded shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                              title="Copy"
                            >
                              {copiedKey === `std-${c.days}` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </td>
                          <td className="px-8 py-6 text-sm font-black text-slate-500 italic">
                            {c.meanPercent} / {c.stdDevPercent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-5 bg-amber-50 border-t-2 border-amber-200 flex items-start gap-4">
                  <div className="p-2 bg-amber-200 rounded-lg text-amber-700">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Implementation Note</h4>
                    <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
                      Academic systems often toggle between 250 and 252 day counts. If your result is rejected by a margin of 0.8%, verify the trading day convention required.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border-4 border-dashed border-slate-300 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 transition-all hover:border-indigo-400 group">
              <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center mb-8 shadow-inner border-2 border-slate-200 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="text-slate-300 w-12 h-12 group-hover:text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Engine Ready. Awaiting Series Data.</h3>
              <p className="text-slate-500 font-bold max-w-sm mb-10 text-lg leading-relaxed">
                Connect a CSV data stream or paste your series in the input panel to initiate quantitative analysis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                 {[
                   { t: 'Multi-Series Detection', c: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                   { t: 'Mean Annualization', c: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                   { t: 'Volatility Scaling', c: 'bg-amber-50 text-amber-600 border-amber-100' }
                 ].map((tag, idx) => (
                   <div key={idx} className={`px-6 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-[0.15em] shadow-sm ${tag.c}`}>
                      {tag.t}
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-24 border-t-2 border-slate-300 pt-10 pb-16 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
           <h4 className="font-black text-slate-900 text-sm mb-1 tracking-tight">Time Series Diagnostics Dashboard</h4>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Precision Analytical Verification Tool</p>
        </div>
        <div className="flex gap-8">
           <a href="#" className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors">Documentation</a>
           <a href="#" className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors">Privacy</a>
           <a href="#" className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors">Source Code</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
