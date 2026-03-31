import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Flag, 
  Play, 
  Settings2, 
  BarChart3, 
  Zap, 
  Timer, 
  Layers,
  Search,
  Network,
  Type,
  Layout
} from 'lucide-react';
import * as Algos from './algorithms';

const CATEGORIES = {
  ARRAY: 'Array Sorting/Searching',
  GRAPH: 'Graph Algorithms',
  STRING: 'String Matching',
  DP: 'Dynamic Programming',
  GREEDY: 'Greedy Algorithms',
  BACKTRACKING: 'Backtracking'
};

const ALGO_MAP = {
  [CATEGORIES.ARRAY]: ['Merge Sort', 'Quick Sort'],
  [CATEGORIES.GRAPH]: ['BFS', 'Dijkstra'],
  [CATEGORIES.STRING]: ['Naïve Matching', 'KMP Algorithm'],
  [CATEGORIES.DP]: ['0/1 Knapsack', 'LCS'],
  [CATEGORIES.GREEDY]: ['Fractional Knapsack', 'Huffman Coding'],
  [CATEGORIES.BACKTRACKING]: ['N-Queens', 'Sudoku Solver']
};

const App = () => {
  const [category, setCategory] = useState(CATEGORIES.ARRAY);
  const [algoA, setAlgoA] = useState('Merge Sort');
  const [algoB, setAlgoB] = useState('Quick Sort');
  const [isRacing, setIsRacing] = useState(false);
  const [chartData, setChartData] = useState([]);
  
  // Input Sizes
  const [nSize, setNSize] = useState(2500);
  const [mSize, setMSize] = useState(50);
  const [vSize, setVSize] = useState(100);
  const [eSize, setESize] = useState(500);

  const [results, setResults] = useState({
    algoA: { ops: 0, time: 0 },
    algoB: { ops: 0, time: 0 }
  });

  // Handle category change (Reset algos)
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const algos = ALGO_MAP[cat];
    setAlgoA(algos[0]);
    setAlgoB(algos[1] || algos[0]);
    setChartData([]);
    setResults({ algoA: { ops: 0, time: 0 }, algoB: { ops: 0, time: 0 } });
    
    // Sync input sizes for categories with different scales
    if (cat === CATEGORIES.BACKTRACKING) {
      if (nSize > 12) setNSize(10);
    } else {
      if (nSize < 100) setNSize(2500);
    }
  };

  // Data Generators
  const generateData = (cat, n, m, v, e) => {
    switch (cat) {
      case CATEGORIES.ARRAY:
        return Array.from({ length: n }, () => Math.floor(Math.random() * 10000));
      case CATEGORIES.GRAPH:
        const adj = {};
        for (let i = 0; i < v; i++) adj[i] = [];
        for (let i = 0; i < e; i++) {
          const from = Math.floor(Math.random() * v);
          const to = Math.floor(Math.random() * v);
          adj[from].push({ to, weight: Math.floor(Math.random() * 10) + 1 });
        }
        return { adj, v, e };
      case CATEGORIES.STRING:
        const chars = 'ABC';
        const text = Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const pattern = text.substring(0, m);
        return { text, pattern };
      case CATEGORIES.DP:
        const weights = Array.from({ length: n }, () => Math.floor(Math.random() * 10) + 1);
        const values = Array.from({ length: n }, () => Math.floor(Math.random() * 100) + 1);
        const s1 = Array.from({ length: n }, () => 'ABC'[Math.floor(Math.random() * 3)]).join('');
        const s2 = Array.from({ length: m }, () => 'ABC'[Math.floor(Math.random() * 3)]).join('');
        return { weights, values, capacity: Math.floor(n * 2.5), s1, s2 };
      case CATEGORIES.GREEDY:
        const greedyItems = Array.from({ length: n }, () => ({
          val: Math.floor(Math.random() * 100) + 1,
          weight: Math.floor(Math.random() * 10) + 1
        }));
        const freqs = Array.from({ length: n }, () => Math.floor(Math.random() * 100) + 1);
        return { items: greedyItems, capacity: Math.floor(n * 2.5), freqs };
      case CATEGORIES.BACKTRACKING:
        // Capping N for exponential algorithms during simulation
        return Math.min(n, 12);
      default: return [];
    }
  };

  const executeAlgo = (name, data) => {
    switch (name) {
      case 'Merge Sort': return Algos.mergeSort(data);
      case 'Quick Sort': return Algos.quickSort(data);
      case 'BFS': return Algos.bfs(data.adj, data.v, data.e);
      case 'Dijkstra': return Algos.dijkstra(data.adj, data.v, data.e);
      case 'Naïve Matching': return Algos.naiveStringMatch(data.text, data.pattern);
      case 'KMP Algorithm': return Algos.kmpMatch(data.text, data.pattern);
      case '0/1 Knapsack': return Algos.knapsack01(data.weights, data.values, data.capacity);
      case 'LCS': return Algos.longestCommonSubsequence(data.s1, data.s2);
      case 'Fractional Knapsack': return Algos.fractionalKnapsack(data.items, data.capacity);
      case 'Huffman Coding': return Algos.huffmanCoding(data.freqs);
      case 'N-Queens': return Algos.nQueens(data);
      case 'Sudoku Solver': return Algos.sudokuSolver(data);
      default: return { operations: 0 };
    }
  };

  const handleRace = async () => {
    setIsRacing(true);
    setChartData([]);
    setResults({ algoA: { ops: 0, time: 0 }, algoB: { ops: 0, time: 0 } });
    
    // We sample 5 points based on the "Primary" size indicator
    const primarySize = category === CATEGORIES.GRAPH ? vSize : nSize;
    const intervals = [0.2, 0.4, 0.6, 0.8, 1.0].map(p => Math.floor(primarySize * p));
    const newChartData = [];

    try {
      for (const size of intervals) {
        // Scale data based on primary size indicator
        const currentN = category === CATEGORIES.GRAPH ? nSize : size;
        const currentV = category === CATEGORIES.GRAPH ? size : vSize;
        const currentE = category === CATEGORIES.GRAPH ? Math.floor(eSize * (size / vSize)) : eSize;
        const currentM = category === CATEGORIES.STRING || (category === CATEGORIES.DP && (algoA === 'LCS' || algoB === 'LCS')) 
                       ? (category === CATEGORIES.STRING ? mSize : Math.floor(mSize * (size / primarySize))) : mSize;

        const data = generateData(category, size, currentM, currentV, currentE);

        const startA = performance.now();
        const resA = executeAlgo(algoA, data);
        const endA = performance.now();

        const startB = performance.now();
        const resB = executeAlgo(algoB, data);
        const endB = performance.now();

        // X-axis mapping
        let xAxisVal = size;
        if (category === CATEGORIES.GRAPH) xAxisVal = currentV + currentE;
        if (category === CATEGORIES.DP && (algoA === 'LCS' || algoB === 'LCS')) xAxisVal = size * currentM;

        newChartData.push({
          name: xAxisVal,
          algoA: resA.operations,
          algoB: resB.operations
        });

        if (size === primarySize) {
          setResults({
            algoA: { ops: resA.operations, time: (endA - startA).toFixed(2) },
            algoB: { ops: resB.operations, time: (endB - startB).toFixed(2) }
          });
        }

        await new Promise(r => setTimeout(r, 100));
        setChartData([...newChartData]);
      }
    } catch (error) {
      console.error("AlgoRacer execution error:", error);
    } finally {
      setIsRacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 px-6 py-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2 rounded-lg shadow-lg">
            <Flag className="w-8 h-8 text-emerald-950" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-amber-100 uppercase">AlgoRacer</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isRacing}
            className="bg-emerald-900 border border-emerald-800 text-emerald-50 px-6 py-2 rounded-full text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-amber-400"
          >
            {Object.values(CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-emerald-100">Race Config</h2>
            </div>

            {/* Dynamic Sliders */}
            <div className="space-y-6">
              {(category === CATEGORIES.ARRAY || category === CATEGORIES.STRING || category === CATEGORIES.DP || category === CATEGORIES.GREEDY || category === CATEGORIES.BACKTRACKING) && (
                <div className="space-y-2">
                  <label className="text-xs uppercase text-emerald-400 tracking-wider">
                    {category === CATEGORIES.STRING ? 'Text Length (N)' : (category === CATEGORIES.BACKTRACKING ? 'Board Size (N)' : 'Input Size (N)')}: <span className="text-amber-400 font-mono">{nSize}</span>
                  </label>
                  <input type="range" min={category === CATEGORIES.BACKTRACKING ? 4 : 100} max={category === CATEGORIES.BACKTRACKING ? 12 : 5000} step={category === CATEGORIES.BACKTRACKING ? 1 : 100} value={nSize} onChange={(e) => setNSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-emerald-800 rounded-lg accent-amber-400 appearance-none" />
                </div>
              )}

              {category === CATEGORIES.GRAPH && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-emerald-400 tracking-wider">Vertices (V): <span className="text-amber-400 font-mono">{vSize}</span></label>
                    <input type="range" min="50" max="500" step="10" value={vSize} onChange={(e) => setVSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-emerald-800 rounded-lg accent-amber-400 appearance-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-emerald-400 tracking-wider">Edges (E): <span className="text-amber-400 font-mono">{eSize}</span></label>
                    <input type="range" min="100" max="2000" step="50" value={eSize} onChange={(e) => setESize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-emerald-800 rounded-lg accent-amber-400 appearance-none" />
                  </div>
                </>
              )}

              {category === CATEGORIES.STRING && (
                <div className="space-y-2">
                  <label className="text-xs uppercase text-emerald-400 tracking-wider">Pattern Length (M): <span className="text-amber-400 font-mono">{mSize}</span></label>
                  <input type="range" min="10" max="100" step="5" value={mSize} onChange={(e) => setMSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-emerald-800 rounded-lg accent-amber-400 appearance-none" />
                </div>
              )}

              {category === CATEGORIES.DP && (algoA === 'LCS' || algoB === 'LCS') && (
                <div className="space-y-2">
                  <label className="text-xs uppercase text-emerald-400 tracking-wider">String 2 Length (M): <span className="text-amber-400 font-mono">{mSize}</span></label>
                  <input type="range" min="100" max="2500" step="100" value={mSize} onChange={(e) => setMSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-emerald-800 rounded-lg accent-amber-400 appearance-none" />
                </div>
              )}
            </div>

            {/* Algo Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest pl-1 border-l-2 border-red-400">Competitor A</label>
                <select value={algoA} onChange={(e) => setAlgoA(e.target.value)} disabled={isRacing} 
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-50 px-4 py-3 rounded-xl appearance-none outline-none focus:ring-1 focus:ring-amber-400">
                  {ALGO_MAP[category].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest pl-1 border-l-2 border-sky-400">Competitor B</label>
                <select value={algoB} onChange={(e) => setAlgoB(e.target.value)} disabled={isRacing} 
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-50 px-4 py-3 rounded-xl appearance-none outline-none focus:ring-1 focus:ring-amber-400">
                  {ALGO_MAP[category].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleRace} disabled={isRacing} 
              className="w-full bg-amber-400 text-emerald-950 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50">
              {isRacing ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-950 border-t-transparent" /> Computing...</> : <><Play className="w-5 h-5 fill-current" /> Run Simulation</>}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-bold text-amber-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Telemetry Results
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-950/50 rounded-lg">
                <p className="text-[10px] text-emerald-500 font-mono mb-1">{algoA}</p>
                <p className="text-xl font-bold">{results.algoA.ops.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-1">{results.algoA.time}ms</p>
              </div>
              <div className="p-3 bg-emerald-950/50 rounded-lg">
                <p className="text-[10px] text-emerald-500 font-mono mb-1">{algoB}</p>
                <p className="text-xl font-bold">{results.algoB.ops.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-1">{results.algoB.time}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-8 min-h-[500px] flex flex-col flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">Efficiency Analysis <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /></h2>
              <p className="text-emerald-400 text-sm">{category} complexity metrics</p>
            </div>
            
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                  <XAxis dataKey="name" stroke="#34d399" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                  <YAxis stroke="#34d399" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : (val >= 1000 ? `${val/1000}k` : val)} />
                  <Tooltip contentStyle={{ backgroundColor: '#022c22', border: '1px solid #065f46', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#ecfdf5' }} />
                  <Line type="monotone" dataKey="algoA" stroke="#f87171" strokeWidth={3} dot={{ fill: '#f87171' }} animationDuration={1000} />
                  <Line type="monotone" dataKey="algoB" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8' }} animationDuration={1000} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-amber-400/10 p-2 rounded-lg"><Layout className="w-5 h-5 text-amber-400" /></div>
              <div><p className="text-[10px] text-emerald-500 uppercase font-mono">X-Axis</p><p className="text-xs font-bold">{category === CATEGORIES.GRAPH ? 'V + E' : (category === CATEGORIES.DP && (algoA === 'LCS' || algoB === 'LCS') ? 'N x M' : 'N')}</p></div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-emerald-400/10 p-2 rounded-lg"><Network className="w-5 h-5 text-emerald-400" /></div>
              <div><p className="text-[10px] text-emerald-500 uppercase font-mono">Samples</p><p className="text-xs font-bold">5 Intervals</p></div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-sky-400/10 p-2 rounded-lg"><Type className="w-5 h-5 text-sky-400" /></div>
              <div><p className="text-[10px] text-emerald-500 uppercase font-mono">Memory</p><p className="text-xs font-bold">Dynamic</p></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
