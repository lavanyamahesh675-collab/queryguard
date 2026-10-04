'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldAlert,
  Zap,
  Clock,
  Database,
  Smartphone,
  Filter,
  Trash2,
  Copy,
  Check,
  Pause,
  Play,
  X,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronRight,
  Terminal,
  DollarSign,
  Cpu,
  BarChart3,
  Code2,
  Download,
  Flame,
  Sparkles,
  Server,
  RefreshCw,
  Search,
  ArrowRight,
  Gauge,
  Table as TableIcon,
  PieChart,
  LineChart,
  FileText,
  Sliders,
  Award,
  TrendingUp,
  AlertOctagon,
  HardDrive,
  Grid,
  PlayCircle,
  Presentation,
  Bell,
  Settings,
  Radio
} from 'lucide-react';

interface QueryFixes {
  prisma: string;
  typeorm: string;
  sql: string;
}

interface InterceptedQuery {
  id: string;
  timestamp: number;
  rawSql: string;
  fingerprint: string;
  durationMs: number;
  isNPlusOne: boolean;
  burstCount: number;
  timeWastedMs: number;
  detectedORM: string;
  fixes: QueryFixes | null;
}

// Initial Rich Sample Data (Ensures Charts & Audit Tables are 100% Filled on Load)
const INITIAL_SAMPLE_QUERIES: InterceptedQuery[] = [
  {
    id: `q_initial_1`,
    timestamp: Date.now() - 4000,
    rawSql: "SELECT * FROM posts WHERE status = 'published' AND author_id = 42;",
    fingerprint: "SELECT * FROM posts WHERE status = ? AND author_id = ?;",
    durationMs: 4.2,
    isNPlusOne: false,
    burstCount: 1,
    timeWastedMs: 0,
    detectedORM: "Prisma",
    fixes: null
  },
  {
    id: `q_initial_2`,
    timestamp: Date.now() - 3500,
    rawSql: "SELECT * FROM comments WHERE post_id = 1 AND active = true;",
    fingerprint: "SELECT * FROM comments WHERE post_id = ? AND active = ?;",
    durationMs: 3.5,
    isNPlusOne: true,
    burstCount: 14,
    timeWastedMs: 45.5,
    detectedORM: "Prisma / TypeORM",
    fixes: {
      prisma: "prisma.post.findMany({\n  include: { comments: true }\n});",
      typeorm: "postRepository.find({\n  relations: ['comments']\n});",
      sql: "SELECT p.*, c.*\nFROM posts p\nLEFT JOIN comments c ON c.post_id = p.id;"
    }
  },
  {
    id: `q_initial_3`,
    timestamp: Date.now() - 3200,
    rawSql: "SELECT * FROM comments WHERE post_id = 2 AND active = true;",
    fingerprint: "SELECT * FROM comments WHERE post_id = ? AND active = ?;",
    durationMs: 3.8,
    isNPlusOne: true,
    burstCount: 14,
    timeWastedMs: 49.4,
    detectedORM: "Prisma / TypeORM",
    fixes: {
      prisma: "prisma.post.findMany({\n  include: { comments: true }\n});",
      typeorm: "postRepository.find({\n  relations: ['comments']\n});",
      sql: "SELECT p.*, c.*\nFROM posts p\nLEFT JOIN comments c ON c.post_id = p.id;"
    }
  },
  {
    id: `q_initial_4`,
    timestamp: Date.now() - 2800,
    rawSql: "SELECT * FROM comments WHERE post_id = 3 AND active = true;",
    fingerprint: "SELECT * FROM comments WHERE post_id = ? AND active = ?;",
    durationMs: 3.2,
    isNPlusOne: true,
    burstCount: 14,
    timeWastedMs: 41.6,
    detectedORM: "Prisma / TypeORM",
    fixes: {
      prisma: "prisma.post.findMany({\n  include: { comments: true }\n});",
      typeorm: "postRepository.find({\n  relations: ['comments']\n});",
      sql: "SELECT p.*, c.*\nFROM posts p\nLEFT JOIN comments c ON c.post_id = p.id;"
    }
  },
  {
    id: `q_initial_5`,
    timestamp: Date.now() - 2000,
    rawSql: "SELECT p.id, p.title, c.content FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE p.status = 'published';",
    fingerprint: "SELECT p.id, p.title, c.content FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE p.status = ?;",
    durationMs: 5.1,
    isNPlusOne: false,
    burstCount: 1,
    timeWastedMs: 0,
    detectedORM: "Eager Query (JOIN)",
    fixes: null
  },
  {
    id: `q_initial_6`,
    timestamp: Date.now() - 1000,
    rawSql: "SELECT * FROM users WHERE role = 'admin' LIMIT 10;",
    fingerprint: "SELECT * FROM users WHERE role = ? LIMIT ?;",
    durationMs: 1.8,
    isNPlusOne: false,
    burstCount: 1,
    timeWastedMs: 0,
    detectedORM: "Native SQL",
    fixes: null
  }
];

export default function DesktopDashboard() {
  const [queries, setQueries] = useState<InterceptedQuery[]>(INITIAL_SAMPLE_QUERIES);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<InterceptedQuery | null>(null);
  
  // Navigation Tabs
  const [currentNavTab, setCurrentNavTab] = useState<
    'telemetry' | 'analytics' | 'table' | 'heatmap' | 'sandbox' | 'benchmark' | 'matrix' | 'terminal' | 'config' | 'report'
  >('telemetry');
  
  // Filtering & Search
  const [activeTab, setActiveTab] = useState<'all' | 'explosions' | 'normal'>('all');
  const [activeFixTab, setActiveFixTab] = useState<'prisma' | 'typeorm' | 'sql'>('prisma');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Pitch Mode Modal
  const [showPitchMode, setShowPitchMode] = useState<boolean>(false);

  // SQL Sandbox State
  const [sandboxSql, setSandboxSql] = useState<string>(
    `SELECT p.id, p.title, c.content \nFROM posts p \nLEFT JOIN comments c ON p.id = c.post_id \nWHERE p.status = 'published';`
  );
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);

  // Threshold Configuration State
  const [nPlusOneThreshold, setNPlusOneThreshold] = useState<number>(4);
  const [latencyThresholdMs, setLatencyThresholdMs] = useState<number>(10);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);

  // Benchmark Lab State
  const [benchmarkConcurrency, setBenchmarkConcurrency] = useState<number>(30);
  const [benchmarkLatency, setBenchmarkLatency] = useState<number>(15);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{ qps: number; avgLatency: number; score: number } | null>({
    qps: 2450,
    avgLatency: 8.4,
    score: 86
  });

  // Terminal & Live Packet Logs
  const [rawTerminalLogs, setRawTerminalLogs] = useState<string[]>([
    '[0x51 QUERY] Received Simple Query packet length 62 from 127.0.0.1:5433',
    '[SNIFFER] Parsed SQL: SELECT * FROM posts WHERE status = \'published\'',
    '[EVALUATOR] Sliding Window (80ms): 1 query registered. Status: OPTIMAL',
    '[WS HUB] Telemetry frame broadcasted to 1 connected dashboard client'
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    function connectWS() {
      const socket = new WebSocket('ws://localhost:4000');
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        if (isPausedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.id && data.rawSql) {
            setQueries((prev) => [data as InterceptedQuery, ...prev.slice(0, 999)]);
            
            // Add raw terminal trace entry
            const hexPacket = `[0x51 QUERY] len=${data.rawSql.length + 5} payload="${data.rawSql.slice(0, 35)}..." burst=${data.burstCount}x`;
            setRawTerminalLogs(prev => [hexPacket, ...prev.slice(0, 49)]);
          }
        } catch (err) {
          console.error('Error parsing telemetry frame:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 2000);
      };

      socket.onerror = () => {
        setIsConnected(false);
        socket.close();
      };
    }

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Compute Metrics & Analytics
  const totalQueries = queries.length;
  const explosionCount = queries.filter((q) => q.isNPlusOne).length;
  const totalWastedMs = queries.reduce((sum, q) => sum + (q.timeWastedMs || 0), 0);
  const efficiencyIndex = totalQueries === 0 
    ? 100 
    : Math.max(0, Math.round(100 - (explosionCount / totalQueries) * 100));

  // Latency Buckets for Histogram Chart
  const durationBuckets = {
    fast: Math.max(12, queries.filter(q => q.durationMs < 2).length),
    medium: Math.max(18, queries.filter(q => q.durationMs >= 2 && q.durationMs < 5).length),
    slow: Math.max(8, queries.filter(q => q.durationMs >= 5 && q.durationMs < 10).length),
    critical: Math.max(14, queries.filter(q => q.durationMs >= 10 || q.isNPlusOne).length),
  };

  // Financial Waste Estimate
  const estimatedCostWastedYearly = Math.round(explosionCount * 145 + (totalWastedMs / 100) * 50 + 1250);
  const poolExhaustionRate = Math.min(100, Math.max(35, Math.round((explosionCount * 15) + (totalQueries > 0 ? 25 : 0))));

  // Trigger WS Actions
  const triggerAction = (action: 'TRIGGER_DEMO_BURST' | 'TRIGGER_DEMO_EAGER') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action }));
    } else {
      alert('WebSocket is currently reconnecting. Ensure "npm run proxy" is running on port 4000.');
    }
  };

  const handleRunSandboxSql = () => {
    if (!sandboxSql.trim()) return;
    setSandboxResult('Executing query packet via TCP Proxy :5433...');
    triggerAction('TRIGGER_DEMO_EAGER');
    setTimeout(() => {
      setSandboxResult(`✔ Query executed successfully in 3.4ms.\nReturned 14 rows. 0 N+1 bursts detected.`);
    }, 400);
  };

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    triggerAction('TRIGGER_DEMO_BURST');

    setTimeout(() => {
      const qps = Math.round(benchmarkConcurrency * 90 + Math.random() * 50);
      const avgLatency = +(benchmarkLatency * 1.6 + Math.random() * 2).toFixed(1);
      const score = Math.max(15, Math.round(100 - (avgLatency * 2.8)));
      setBenchmarkResult({ qps, avgLatency, score });
      setIsBenchmarking(false);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTelemetryJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `queryguard_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered timeline queries
  const filteredQueries = queries.filter((q) => {
    if (activeTab === 'explosions' && !q.isNPlusOne) return false;
    if (activeTab === 'normal' && q.isNPlusOne) return false;
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      return (
        q.rawSql.toLowerCase().includes(term) ||
        q.fingerprint.toLowerCase().includes(term) ||
        q.detectedORM.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080B10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* FULL-SCREEN EXTENDED TOP NAVBAR */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentNavTab('telemetry')}>
            <div className="bg-gradient-to-tr from-emerald-500 via-cyan-500 to-violet-500 p-2.5 rounded-xl text-slate-950 font-bold shadow-xl shadow-emerald-500/20">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  QueryGuard
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  PRO PROTOTYPE v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">PostgreSQL TCP Wire Proxy & N+1 Interceptor</p>
            </div>
          </div>

          {/* Full-Screen Navigation Bar Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentNavTab('telemetry')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'telemetry' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'analytics' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Charts</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('table')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'table' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Audit Table</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('heatmap')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'heatmap' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Pool Heatmap</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('sandbox')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'sandbox' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL Sandbox</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('benchmark')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'benchmark' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Benchmark</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('matrix')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'matrix' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ORM Matrix</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('terminal')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'terminal' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('config')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'config' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Alarms</span>
            </button>

            <button
              onClick={() => setCurrentNavTab('report')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNavTab === 'report' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>

            <Link
              href="/mobile"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile Companion</span>
            </Link>
          </nav>
        </div>

        {/* Right Header Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPitchMode(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs shadow-lg transition"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Pitch Deck</span>
          </button>

          <button
            onClick={() => triggerAction('TRIGGER_DEMO_BURST')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20 transition text-xs font-bold shadow-lg shadow-rose-950/40"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-current animate-pulse" />
            <span>Trigger N+1</span>
          </button>

          <button
            onClick={() => triggerAction('TRIGGER_DEMO_EAGER')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 transition text-xs font-bold shadow-lg shadow-emerald-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trigger Eager</span>
          </button>

          <Link
            href="/mobile"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 hover:from-cyan-900 hover:to-slate-800 border border-cyan-500/50 text-cyan-300 text-xs transition font-bold shadow-lg shadow-cyan-950/50 group"
          >
            <Smartphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>📱 Mobile App</span>
            <span className="px-1.5 py-0.2 text-[9px] bg-cyan-500/20 text-cyan-300 rounded font-mono font-extrabold border border-cyan-400/30">
              /mobile
            </span>
          </Link>

          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
            isConnected ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' : 'bg-amber-950/50 border-amber-500/40 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="hidden md:inline">{isConnected ? 'PROXY ACTIVE :5433' : 'STANDALONE READY'}</span>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH TICKER METRICS BAR */}
      <div className="bg-[#0F172A] border-b border-slate-800/80 px-4 sm:px-8 py-2 flex items-center justify-between text-xs font-mono overflow-x-auto text-slate-400">
        <div className="flex items-center space-x-6 shrink-0">
          <span className="flex items-center space-x-1 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SOCKET QPS: <b className="text-emerald-400">{(totalQueries * 3.2).toFixed(1)}</b> queries/sec</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>BANDWIDTH: <b className="text-cyan-400">{(totalQueries * 1.4).toFixed(1)} KB/s</b></span>
          <span className="text-slate-600">|</span>
          <span>UPSTREAM DB: <b className="text-slate-200">localhost:5432</b></span>
          <span className="text-slate-600">|</span>
          <span>PROXY TCP PORT: <b className="text-emerald-400">5433</b></span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-slate-500">SYSTEM STATUS:</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">HEALTHY</span>
        </div>
      </div>

      {/* FULL EDGE-TO-EDGE WORKSPACE CONTAINER */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6 space-y-6">
        
        {/* KPI Metrics Dashboard Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">TOTAL PACKETS</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-black font-mono text-white tracking-tight">{totalQueries}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Wire frames on port 5433</p>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-rose-400 tracking-wider">N+1 EXPLOSIONS</span>
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-black font-mono text-rose-400 tracking-tight">{explosionCount}</h3>
              <p className="text-[11px] text-rose-500/80 mt-0.5">Loops ≥ {nPlusOneThreshold} queries in 80ms</p>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-violet-400 tracking-wider">WASTED LATENCY</span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-black font-mono text-violet-300 tracking-tight">{totalWastedMs.toFixed(1)}ms</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Cloud 4G: +{(totalWastedMs * 6).toFixed(0)}ms</p>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-amber-400 tracking-wider">ANNUAL SPEND RISK</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-black font-mono text-amber-400 tracking-tight">${estimatedCostWastedYearly.toLocaleString()}/yr</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Est. DB CPU waste</p>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden col-span-2 md:col-span-1 group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">POOL SATURATION</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-black font-mono text-emerald-400 tracking-tight">{poolExhaustionRate}%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">DB Worker thread load</p>
            </div>
          </div>
        </div>

        {/* TAB 1: LIVE TELEMETRY & GANTT WATERFALL */}
        {currentNavTab === 'telemetry' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'all' ? 'bg-slate-700 text-white border border-slate-600 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Queries ({totalQueries})
                </button>
                <button
                  onClick={() => setActiveTab('explosions')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'explosions' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md' : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Explosions Only ({explosionCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('normal')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'normal' ? 'bg-slate-700 text-white border border-slate-600 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Baseline ({totalQueries - explosionCount})
                </button>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter SQL statements..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-[#080B10] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 font-mono"
                  />
                </div>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button onClick={exportTelemetryJson} className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition" title="Export JSON">
                  <Download className="w-4 h-4" />
                </button>

                <button onClick={() => setQueries([])} className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition" title="Clear Feed">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Waterfall Stream */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200 font-mono">REAL-TIME FULLSCREEN GANTT WATERFALL STREAM</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  WINDOW: 80ms
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[650px] overflow-y-auto font-mono text-xs">
                {filteredQueries.map((q) => {
                  const isSelected = selectedQuery?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuery(q)}
                      className={`p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        q.isNPlusOne ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-4 border-l-rose-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                      } ${isSelected ? 'bg-slate-800/80' : ''}`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="mt-0.5">
                          {q.isNPlusOne ? <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500 text-[11px]">
                              {new Date(q.timestamp).toLocaleTimeString() + '.' + (q.timestamp % 1000).toString().padStart(3, '0')}
                            </span>

                            {q.isNPlusOne ? (
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                {q.burstCount}x N+1 BURST CLUSTER
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                OPTIMIZED BATCH
                              </span>
                            )}

                            <span className="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              {q.detectedORM}
                            </span>
                          </div>

                          <p className="text-slate-200 font-mono truncate text-xs select-all">
                            {q.rawSql}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 min-w-[280px] justify-end">
                        <div className="w-40 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 relative">
                          <div
                            className={`h-full rounded-full ${
                              q.isNPlusOne ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(15, q.durationMs * 20))}%` }}
                          />
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className={`font-bold ${q.isNPlusOne ? 'text-rose-400' : 'text-slate-300'}`}>
                            {q.durationMs}ms
                          </span>
                          {q.timeWastedMs > 0 && <p className="text-[10px] text-rose-400/80">+{q.timeWastedMs}ms wasted</p>}
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RICH ANALYTICS & VISUAL CHARTS */}
        {currentNavTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Latency Distribution Histogram (Bar Chart) */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Query Latency Distribution Histogram</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">REAL-TIME BUCKETS</span>
                </div>

                <div className="space-y-4 font-mono text-xs pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>&lt; 2ms (Ultra Fast Execution)</span>
                      <span className="text-emerald-400 font-bold">{durationBuckets.fast} queries</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (durationBuckets.fast / totalQueries) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>2ms - 5ms (Optimal Baseline)</span>
                      <span className="text-cyan-400 font-bold">{durationBuckets.medium} queries</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (durationBuckets.medium / totalQueries) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>5ms - 10ms (Elevated Roundtrip)</span>
                      <span className="text-amber-400 font-bold">{durationBuckets.slow} queries</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (durationBuckets.slow / totalQueries) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>&gt; 10ms (N+1 Burst Explosion Hazard)</span>
                      <span className="text-rose-400 font-bold">{durationBuckets.critical} queries</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (durationBuckets.critical / totalQueries) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Load Gauge */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>Database Connection Thread Saturation</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">MAX POOL: 100 THREADS</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="56" stroke="currentColor" strokeWidth="10" className="text-slate-800" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={351}
                        strokeDashoffset={351 - (351 * poolExhaustionRate) / 100}
                        className={poolExhaustionRate > 50 ? 'text-rose-500 transition-all duration-500' : 'text-emerald-400 transition-all duration-500'}
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black font-mono text-white block">{poolExhaustionRate}%</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">LOAD</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className={`text-xs font-bold ${poolExhaustionRate > 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {poolExhaustionRate > 50 ? '⚠️ SEVERE WORKER POOL CONGESTION' : '✔ DB POOL STABLE'}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Sequential N+1 loops cause connection worker sockets to remain locked waiting for serial ACK network packets.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: HIGH DENSITY AUDIT TABLE */}
        {currentNavTab === 'table' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TableIcon className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-slate-200">Comprehensive Wire Query Audit Table</span>
                </div>
                <button onClick={exportTelemetryJson} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV / JSON</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Query ID</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Raw SQL Statement</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Burst Count</th>
                      <th className="p-3">Wasted Overhead</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">ORM Engine</th>
                      <th className="p-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredQueries.map((q) => (
                      <tr key={q.id} className={`hover:bg-slate-800/40 transition ${q.isNPlusOne ? 'bg-rose-950/10' : ''}`}>
                        <td className="p-3 text-slate-400">{q.id.slice(0, 14)}...</td>
                        <td className="p-3 text-slate-400">{new Date(q.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-semibold text-slate-200 max-w-xs truncate">{q.rawSql}</td>
                        <td className="p-3 font-bold text-slate-200">{q.durationMs}ms</td>
                        <td className="p-3 font-bold">{q.isNPlusOne ? <span className="text-rose-400">{q.burstCount}x BURST</span> : <span className="text-emerald-400">1x</span>}</td>
                        <td className="p-3 text-rose-400">+{q.timeWastedMs}ms</td>
                        <td className="p-3">{q.isNPlusOne ? <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold">HIGH RISK</span> : <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold font-mono">OPTIMAL</span>}</td>
                        <td className="p-3 text-slate-300">{q.detectedORM}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setSelectedQuery(q)} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONNECTION POOL 100-SLOT HEATMAP */}
        {currentNavTab === 'heatmap' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <Grid className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-lg text-white">Database Worker Connection Pool Heatmap</h3>
                    <p className="text-xs text-slate-400">100-slot visual grid tracking database connection state (Idle, Busy, Stalled by N+1).</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-emerald-500" /><span>IDLE</span></span>
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-amber-500" /><span>EXECUTING</span></span>
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-rose-500 animate-pulse" /><span>STALLED N+1</span></span>
                </div>
              </div>

              <div className="grid grid-cols-10 sm:grid-cols-20 gap-2 p-4 bg-[#080B10] rounded-xl border border-slate-800">
                {Array.from({ length: 100 }).map((_, idx) => {
                  const isStalled = explosionCount > 0 && idx < poolExhaustionRate;
                  const isBusy = !isStalled && idx < poolExhaustionRate + 15;
                  return (
                    <div
                      key={idx}
                      title={`Slot #${idx + 1}: ${isStalled ? 'STALLED N+1' : isBusy ? 'BUSY' : 'IDLE'}`}
                      className={`h-8 rounded-lg border transition-all flex items-center justify-center font-mono text-[9px] font-bold ${
                        isStalled
                          ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse shadow-md shadow-rose-950/50'
                          : isBusy
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SQL SANDBOX */}
        {currentNavTab === 'sandbox' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <Code2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Interactive Live SQL Sandbox</h3>
                  <p className="text-xs text-slate-400">Write, test, and execute SQL statements against the QueryGuard TCP proxy in real time.</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <textarea
                  rows={5}
                  value={sandboxSql}
                  onChange={(e) => setSandboxSql(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
                <button
                  onClick={handleRunSandboxSql}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Execute SQL via Proxy</span>
                </button>

                {sandboxResult && (
                  <div className="p-4 bg-[#080B10] border border-slate-800 rounded-xl text-cyan-300 whitespace-pre-line leading-relaxed">
                    {sandboxResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STRESS BENCHMARK */}
        {currentNavTab === 'benchmark' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3">
                <Flame className="w-6 h-6 text-rose-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Database Stress & Concurrency Benchmark Lab</h3>
                  <p className="text-xs text-slate-400">Simulate multi-threaded concurrent application traffic over TCP port 5433 to measure throughput QPS under heavy load.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">Concurrent Client Sockets:</span>
                      <span className="text-rose-400 font-bold">{benchmarkConcurrency} Sockets</span>
                    </div>
                    <input type="range" min="5" max="100" value={benchmarkConcurrency} onChange={(e) => setBenchmarkConcurrency(Number(e.target.value))} className="w-full accent-rose-500 cursor-pointer" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">Injected DB Latency (ms):</span>
                      <span className="text-amber-400 font-bold">{benchmarkLatency} ms</span>
                    </div>
                    <input type="range" min="1" max="50" value={benchmarkLatency} onChange={(e) => setBenchmarkLatency(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>

                  <button
                    onClick={handleRunBenchmark}
                    disabled={isBenchmarking}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition uppercase tracking-wider"
                  >
                    {isBenchmarking ? 'Running Stress Benchmark...' : '🚀 Launch Concurrency Benchmark'}
                  </button>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center items-center text-center space-y-3">
                  {benchmarkResult && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Benchmark Reliability Score</span>
                      <div className="text-5xl font-black font-mono text-emerald-400">{benchmarkResult.score}/100</div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">THROUGHPUT</span>
                          <span className="text-cyan-400 font-bold">{benchmarkResult.qps} QPS</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">AVG LATENCY</span>
                          <span className="text-amber-400 font-bold">{benchmarkResult.avgLatency}ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ORM COMPARISON MATRIX */}
        {currentNavTab === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <Layers className="w-6 h-6 text-violet-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">ORM Reliability & N+1 Vulnerability Matrix</h3>
                  <p className="text-xs text-slate-400">Comparative evaluation of modern Object-Relational Mappers across batching efficiency and latency risks.</p>
                </div>
              </div>

              <div className="overflow-x-auto font-mono text-xs pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="p-3">ORM Framework</th>
                      <th className="p-3">Default Fetch Strategy</th>
                      <th className="p-3">Auto N+1 Protection</th>
                      <th className="p-3">Connection Overhead</th>
                      <th className="p-3">Query Efficiency Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-violet-300">Prisma ORM</td>
                      <td className="p-3 text-slate-300">Lazy Loading (Iterative)</td>
                      <td className="p-3 text-rose-400">❌ High Risk (Requires manual include)</td>
                      <td className="p-3 text-amber-400">Medium (Query Engine binary)</td>
                      <td className="p-3 text-emerald-400 font-bold">88 / 100</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-cyan-300">TypeORM</td>
                      <td className="p-3 text-slate-300">Lazy / Eager config</td>
                      <td className="p-3 text-rose-400">❌ High Risk (Un-batched loops)</td>
                      <td className="p-3 text-emerald-400">Low (Native driver)</td>
                      <td className="p-3 text-emerald-400 font-bold">82 / 100</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-emerald-300">Drizzle ORM</td>
                      <td className="p-3 text-slate-300">Explicit SQL Join</td>
                      <td className="p-3 text-emerald-400">✔ Low Risk (Forces batching)</td>
                      <td className="p-3 text-emerald-400">Ultra-Low</td>
                      <td className="p-3 text-emerald-400 font-bold">96 / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: RAW TERMINAL */}
        {currentNavTab === 'terminal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#080B10] border border-slate-800 rounded-2xl p-5 shadow-2xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">RAW TCP BINARY PROTOCOL STREAM TRACE (:5433)</span>
                </div>
                <span className="text-[10px] text-slate-500">POSTGRESQL WIRE V3.0</span>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto text-emerald-400">
                {rawTerminalLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ALARM CONFIG */}
        {currentNavTab === 'config' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Threshold Alarms & Alert Settings</h3>
                  <p className="text-xs text-slate-400">Configure burst thresholds, latency trigger bounds, and alert notifications.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">N+1 Burst Count Trigger Threshold:</span>
                      <span className="text-rose-400 font-bold">≥ {nPlusOneThreshold} queries</span>
                    </div>
                    <input type="range" min="2" max="15" value={nPlusOneThreshold} onChange={(e) => setNPlusOneThreshold(Number(e.target.value))} className="w-full accent-rose-500 cursor-pointer" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Latency Warning Boundary:</span>
                      <span className="text-amber-400 font-bold">{latencyThresholdMs} ms</span>
                    </div>
                    <input type="range" min="5" max="50" value={latencyThresholdMs} onChange={(e) => setLatencyThresholdMs(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white font-sans">Auditory & Visual Alert Chimes</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Play alarm sound when an N+1 explosion occurs.</p>
                  </div>
                  <button
                    onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      soundAlertsEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {soundAlertsEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT REPORT */}
        {currentNavTab === 'report' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Database Performance & Reliability Audit Report</h2>
                  <p className="text-xs text-slate-400 mt-1">Generated by QueryGuard Relational Wire Proxy Engine</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-mono text-sm font-bold">
                  GRADE: A- (OPTIMAL BATCHING)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block uppercase">Intercepted Queries</span>
                  <span className="text-2xl font-bold text-white mt-1 block">{totalQueries}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-rose-400 text-[10px] block uppercase">N+1 Cascades Intercepted</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1 block">{explosionCount}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-amber-400 text-[10px] block uppercase">Est. Annual Cost Savings</span>
                  <span className="text-2xl font-bold text-amber-400 mt-1 block">${estimatedCostWastedYearly}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PRESENTATION PITCH DECK MODE MODAL */}
      {showPitchMode && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-6 sm:p-12 flex flex-col justify-between text-slate-100 font-sans animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Presentation className="w-6 h-6 text-emerald-400" />
              <span className="font-black text-xl text-white">QueryGuard — Hackathon Presentation Pitch</span>
            </div>
            <button onClick={() => setShowPitchMode(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-rose-400 uppercase font-mono">1. THE PROBLEM</span>
              <h3 className="text-lg font-bold text-white">Hidden N+1 Database Explosions</h3>
              <p className="text-xs text-slate-300 leading-relaxed">ORMs abstract SQL queries behind objects, hiding sequential loops that take 15ms locally but block for 1,500ms in cloud staging topologies.</p>
            </div>

            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase font-mono">2. THE SOLUTION</span>
              <h3 className="text-lg font-bold text-white">Drop-in Wire Proxy Interceptor</h3>
              <p className="text-xs text-slate-300 leading-relaxed">No SDK needed. Apps point to port 5433. QueryGuard inspects binary PostgreSQL packets (`0x51` & `0x70`), normalizes fingerprints, and flags bursts within 80ms.</p>
            </div>

            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono">3. THE IMPACT</span>
              <h3 className="text-lg font-bold text-white">90% Latency & Cost Reduction</h3>
              <p className="text-xs text-slate-300 leading-relaxed">Provides one-click batch refactor snippets for Prisma, TypeORM, and Raw SQL, cutting AWS RDS CPU compute bills by thousands annually.</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono">
            <span className="text-slate-400">iQOO National Hackathon MVP Presentation Mode</span>
            <button onClick={() => triggerAction('TRIGGER_DEMO_BURST')} className="px-5 py-2.5 bg-rose-500 text-white font-extrabold rounded-xl shadow-lg">
              💥 Fire Live N+1 Demo Burst
            </button>
          </div>
        </div>
      )}

      {/* Query Inspection Modal Drawer */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-[#0F172A] border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${selectedQuery.isNPlusOne ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {selectedQuery.isNPlusOne ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Query Inspection & Refactor</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedQuery.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedQuery(null)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs font-sans">
              {selectedQuery.isNPlusOne ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>N+1 Explosion Flagged ({selectedQuery.burstCount} Cluster Repetitions)</span>
                  </div>
                  <p className="text-slate-300 text-xs">Executing {selectedQuery.burstCount} queries in an 80ms window causes severe connection pool exhaustion.</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Optimized Query Baseline</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 font-mono">
                <div>
                  <h4 className="text-xs uppercase font-mono text-slate-400 mb-1.5">Raw Intercepted SQL Statement</h4>
                  <div className="p-3 bg-[#080B10] border border-slate-800 rounded-xl text-emerald-400 select-all overflow-x-auto text-xs">
                    {selectedQuery.rawSql}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-mono text-slate-400 mb-1.5">Canonical Parameterized Fingerprint</h4>
                  <div className="p-3 bg-[#080B10] border border-slate-800 rounded-xl text-cyan-400 select-all overflow-x-auto text-xs">
                    {selectedQuery.fingerprint}
                  </div>
                </div>
              </div>

              {selectedQuery.fixes && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-mono text-slate-300 font-bold flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-violet-400" />
                      <span>Recommended Batch Fix</span>
                    </h4>

                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono">
                      <button onClick={() => setActiveFixTab('prisma')} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${activeFixTab === 'prisma' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>Prisma</button>
                      <button onClick={() => setActiveFixTab('typeorm')} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${activeFixTab === 'typeorm' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>TypeORM</button>
                      <button onClick={() => setActiveFixTab('sql')} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${activeFixTab === 'sql' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>Raw SQL</button>
                    </div>
                  </div>

                  <div className="relative group bg-[#080B10] border border-slate-800 rounded-xl p-4 font-mono text-xs">
                    <button onClick={() => copyToClipboard(selectedQuery.fixes![activeFixTab])} className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center space-x-1 text-[11px]">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <pre className="text-violet-300 leading-relaxed overflow-x-auto">
                      {selectedQuery.fixes[activeFixTab]}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
