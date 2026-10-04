'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Zap,
  Clock,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Smartphone,
  ArrowLeft,
  Activity,
  CheckCircle2,
  Flame,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  DollarSign,
  Radio,
  X,
  ChevronRight
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
  }
];

export default function MobileCompanionPage() {
  const [queries, setQueries] = useState<InterceptedQuery[]>(INITIAL_SAMPLE_QUERIES);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'incidents' | 'actions' | 'metrics' | 'health'>('incidents');

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    function connectWS() {
      const socket = new WebSocket('ws://localhost:4000');
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.id && data.rawSql) {
            setQueries((prev) => [data as InterceptedQuery, ...prev.slice(0, 199)]);
          }
        } catch (err) {
          console.error('WS Parse Error:', err);
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

  const triggerAction = (action: 'TRIGGER_DEMO_BURST' | 'TRIGGER_DEMO_EAGER') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action }));
    }
  };

  const copyFix = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute metrics for mobile shield
  const totalQueries = queries.length;
  const explosions = queries.filter((q) => q.isNPlusOne).length;
  const totalWasted = queries.reduce((acc, q) => acc + (q.timeWastedMs || 0), 0);
  const healthScore = totalQueries === 0 ? 100 : Math.max(10, Math.round(100 - (explosions / totalQueries) * 100));

  const extractTable = (sql: string) => {
    const m = sql.match(/(?:FROM|INTO|UPDATE)\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
    return m ? m[1] : 'database';
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-slate-100 font-sans flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Full-Screen / Mobile App Shell */}
      <div className="w-full min-h-screen sm:min-h-[880px] sm:max-w-md bg-[#0F172A] border-0 sm:border border-slate-800 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border-t-0 sm:border-t-8 sm:border-t-slate-800">
        
        {/* Mobile Header Bar */}
        <header className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400 fill-current" />
            <span className="font-extrabold text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              QueryGuard Mobile
            </span>
          </div>

          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
            isConnected ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' : 'bg-amber-950/50 border-amber-500/40 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'ONLINE' : 'RECONNECTING'}</span>
          </div>
        </header>

        {/* Scrollable Mobile Body */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1 pb-20">
          
          {/* Mobile System Health Shield Banner */}
          <div className={`p-5 rounded-2xl border transition-all ${
            healthScore < 60 ? 'bg-rose-950/30 border-rose-500/40 shadow-xl shadow-rose-950/50' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">SYSTEM HEALTH SHIELD</span>
                <h2 className="text-xl font-black flex items-center space-x-2">
                  <span className={healthScore < 60 ? 'text-rose-400' : 'text-emerald-400'}>
                    {healthScore}% OPTIMAL
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  {explosions > 0 ? `${explosions} N+1 explosions detected!` : 'Zero N+1 explosions active'}
                </p>
              </div>

              {/* Radial Score Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-800" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={163}
                    strokeDashoffset={163 - (163 * healthScore) / 100}
                    className={healthScore < 60 ? 'text-rose-500 transition-all duration-500' : 'text-emerald-400 transition-all duration-500'}
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </svg>
                <Activity className={`w-5 h-5 absolute ${healthScore < 60 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[9px] block">CAPTURED</span>
                <span className="font-bold text-slate-200">{totalQueries}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-rose-400 text-[9px] block">BURSTS</span>
                <span className="font-bold text-rose-400">{explosions}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-violet-400 text-[9px] block">WASTED</span>
                <span className="font-bold text-violet-400">{totalWasted.toFixed(0)}ms</span>
              </div>
            </div>
          </div>

          {/* TAB CONTENT: INCIDENTS */}
          {mobileTab === 'incidents' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase font-mono text-slate-300">LIVE INCIDENT FEED</span>
                <span className="text-[10px] text-slate-500 font-mono">TOUCH FOR FIX</span>
              </div>

              {queries.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  <Database className="w-6 h-6 mx-auto text-slate-600 mb-2 animate-pulse" />
                  <p>Waiting for query telemetry...</p>
                  <p className="text-[10px] text-slate-600 mt-1">Tap <b>Actions</b> tab below to simulate</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {queries.map((q) => {
                    const isExpanded = expandedId === q.id;
                    const table = extractTable(q.rawSql);
                    return (
                      <div
                        key={q.id}
                        className={`rounded-xl border transition-all ${
                          q.isNPlusOne ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                          className="p-3.5 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-start space-x-3 min-w-0 flex-1">
                            {q.isNPlusOne ? (
                              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            )}

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-white uppercase font-mono">
                                  {table}
                                </span>
                                {q.isNPlusOne && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    {q.burstCount}x BURST
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 truncate font-mono">
                                {q.rawSql}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pl-2">
                            <span className={`text-xs font-mono font-bold ${q.isNPlusOne ? 'text-rose-400' : 'text-slate-400'}`}>
                              {q.durationMs}ms
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Accordion Expand */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/80 space-y-3 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">CANONICAL FINGERPRINT</span>
                              <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-cyan-400">
                                {q.fingerprint}
                              </div>
                            </div>

                            {q.fixes && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-violet-300 font-bold uppercase font-mono flex items-center space-x-1">
                                    <Layers className="w-3 h-3 text-violet-400" />
                                    <span>PRISMA BATCH FIX</span>
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyFix(q.id, q.fixes!.prisma);
                                    }}
                                    className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 flex items-center space-x-1"
                                  >
                                    {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-violet-300 leading-relaxed overflow-x-auto">
                                  {q.fixes.prisma}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: ACTIONS */}
          {mobileTab === 'actions' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block tracking-wider">ONE-TAP DIAGNOSTIC CONTROLS</span>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => triggerAction('TRIGGER_DEMO_BURST')}
                  className="p-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-rose-900/30 active:scale-95 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Flame className="w-5 h-5 fill-current" />
                    <div className="text-left">
                      <span className="block font-extrabold text-sm">Simulate N+1 Explosion</span>
                      <span className="text-[10px] text-rose-200">Fires 14 rapid child queries to test interceptor</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => triggerAction('TRIGGER_DEMO_EAGER')}
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-900/30 active:scale-95 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 fill-current" />
                    <div className="text-left">
                      <span className="block font-extrabold text-sm">Simulate Eager JOIN</span>
                      <span className="text-[10px] text-emerald-200">Fires single optimized batch JOIN query</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: METRICS */}
          {mobileTab === 'metrics' && (
            <div className="space-y-3 animate-in fade-in duration-150 font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">MOBILE PERFORMANCE METRICS</span>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Intercepted:</span>
                  <span className="text-white font-bold">{totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N+1 Bursts:</span>
                  <span className="text-rose-400 font-bold">{explosions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Time Wasted:</span>
                  <span className="text-violet-400 font-bold">{totalWasted.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Est. Mobile 4G Delay:</span>
                  <span className="text-amber-400 font-bold">+{(explosions * 18).toFixed(0)}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: HEALTH */}
          {mobileTab === 'health' && (
            <div className="space-y-3 animate-in fade-in duration-150 font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">DATABASE HEALTH INSPECTOR</span>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-slate-200 font-bold">TCP Socket :5433 Active</span>
                </div>
                <p className="text-[11px] text-slate-400">Proxy intercepts binary PostgreSQL frames over TCP and relays telemetry over WebSocket :4000.</p>
              </div>
            </div>
          )}

        </div>

        {/* TOUCH NAVIGATION FOOTER */}
        <nav className="border-t border-slate-800 bg-slate-900 p-2 fixed bottom-0 left-0 right-0 max-w-md mx-auto grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
          <button
            onClick={() => setMobileTab('incidents')}
            className={`py-2 rounded-xl flex flex-col items-center space-y-1 ${
              mobileTab === 'incidents' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Incidents</span>
          </button>

          <button
            onClick={() => setMobileTab('actions')}
            className={`py-2 rounded-xl flex flex-col items-center space-y-1 ${
              mobileTab === 'actions' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Actions</span>
          </button>

          <button
            onClick={() => setMobileTab('metrics')}
            className={`py-2 rounded-xl flex flex-col items-center space-y-1 ${
              mobileTab === 'metrics' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics</span>
          </button>

          <button
            onClick={() => setMobileTab('health')}
            className={`py-2 rounded-xl flex flex-col items-center space-y-1 ${
              mobileTab === 'health' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
