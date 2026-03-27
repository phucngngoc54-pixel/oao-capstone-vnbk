import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { ParsedData } from '../types';
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Repeat2, Heart, Clock, Edit3, AlertTriangle, Zap, RefreshCw } from 'lucide-react';

interface AnalyticsDashboardProps {
    data: ParsedData;
    onEditCard?: (configId: string) => void;
}

// --- Mock Real-time Performance Generator ---
function generateCardPerf(configId: string, seed: number) {
    const rand = (min: number, max: number, s: number) =>
        Math.floor(((Math.sin(s * 9301 + 49297) / 233280 + 1) / 2) * (max - min) + min);

    const impressions = rand(12000, 85000, seed);
    const clicks = Math.floor(impressions * (rand(3, 18, seed + 1) / 100));
    const conversions = Math.floor(clicks * (rand(5, 35, seed + 2) / 100));
    const ctr = +((clicks / impressions) * 100).toFixed(2);
    const convRate = +((conversions / clicks) * 100).toFixed(2);
    const avgTimeOnCard = rand(8, 45, seed + 3);
    const saves = Math.floor(clicks * (rand(2, 15, seed + 4) / 100));
    const shares = Math.floor(clicks * (rand(1, 8, seed + 5) / 100));
    const engagementScore = +(ctr * 0.4 + convRate * 0.4 + (saves / clicks) * 10 * 0.2).toFixed(1);

    return { configId, impressions, clicks, conversions, ctr, convRate, avgTimeOnCard, saves, shares, engagementScore };
}

function generateTrendData(seed: number) {
    return Array.from({ length: 7 }, (_, i) => {
        const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
        const base = Math.floor(((Math.sin((seed + i) * 9301 + 49297) / 233280 + 1) / 2) * 5000 + 1000);
        return { day, impressions: base, clicks: Math.floor(base * 0.12), conversions: Math.floor(base * 0.03) };
    });
}

const PERF_THRESHOLDS = { ctr: { good: 8, warn: 4 }, convRate: { good: 15, warn: 8 }, engagement: { good: 7, warn: 4 } };

function getPerfStatus(ctr: number, convRate: number, engagement: number) {
    const issues = [];
    if (ctr < PERF_THRESHOLDS.ctr.warn) issues.push('Low CTR');
    if (convRate < PERF_THRESHOLDS.convRate.warn) issues.push('Low Conversion');
    if (engagement < PERF_THRESHOLDS.engagement.warn) issues.push('Low Engagement');
    if (issues.length >= 2) return { status: 'critical', label: 'Needs Fix', color: 'text-red-600 bg-red-50 border-red-200' };
    if (issues.length === 1) return { status: 'warn', label: 'Monitor', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { status: 'good', label: 'Healthy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

function MetricBadge({ label, value, suffix = '', good, warn, reverse = false }: { label: string; value: number; suffix?: string; good: number; warn: number; reverse?: boolean }) {
    const isGood = reverse ? value <= warn : value >= good;
    const isWarn = reverse ? value > warn && value <= good : value >= warn && value < good;
    const color = isGood ? 'text-emerald-700' : isWarn ? 'text-amber-700' : 'text-red-700';
    const bg = isGood ? 'bg-emerald-50' : isWarn ? 'bg-amber-50' : 'bg-red-50';
    return (
        <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${bg}`}>
            <span className={`text-lg font-bold ${color}`}>{value}{suffix}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</span>
        </div>
    );
}

export default function AnalyticsDashboard({ data, onEditCard }: AnalyticsDashboardProps) {
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    // Simulate live refresh every 30s
    useEffect(() => {
        const timer = setInterval(() => {
            setLastRefresh(new Date());
            setRefreshKey(k => k + 1);
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const handleManualRefresh = () => {
        setLastRefresh(new Date());
        setRefreshKey(k => k + 1);
    };

    // Aggregate data for KPIs
    const totalCards = data.cardUIConfig.length;
    const activeCards = data.displayRules.filter(r => r.Status === 'ACTIVE').length;
    const draftCards = data.displayRules.filter(r => r.Status === 'DRAFT').length;

    // Chart 1: Cards by Partner
    const partnerCounts = data.cardUIConfig.reduce((acc, card) => {
        acc[card.Partner_ID] = (acc[card.Partner_ID] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barChartData = Object.entries(partnerCounts).map(([id, count]) => {
        const pName = data.partnerMaster.find(p => p.Partner_ID === id)?.Partner_Name || id;
        return { name: pName, count };
    });

    // Chart 2: Status Distribution
    const pieData = [
        { name: 'Active', value: activeCards, color: '#10b981' },
        { name: 'Draft', value: draftCards, color: '#f59e0b' },
        { name: 'Inactive', value: totalCards - activeCards - draftCards, color: '#94a3b8' }
    ];

    // Real-time performance per card
    const activeConfigs = data.displayRules.filter(r => r.Status === 'ACTIVE');
    const cardPerformances = data.cardUIConfig.map((card, i) => {
        const rule = data.displayRules.find(r => r.Config_ID === card.Config_ID);
        const perf = generateCardPerf(card.Config_ID, i + refreshKey * 1000);
        const partner = data.partnerMaster.find(p => p.Partner_ID === card.Partner_ID);
        const perfStatus = getPerfStatus(perf.ctr, perf.convRate, perf.engagementScore);
        return { ...perf, card, rule, partner, perfStatus };
    });

    const trendData = generateTrendData(refreshKey);

    // Mock Audit Logs
    const auditLogs = [
        { id: 1, time: '2026-02-28 10:30', user: 'Product Owner (Alice)', action: 'PUBLISHED', target: 'CFG_CATHAY_001' },
        { id: 2, time: '2026-02-28 09:15', user: 'Business Specialist (Bob)', action: 'EDITED', target: 'CFG_CATHAY_001' },
        { id: 3, time: '2026-02-27 16:45', user: 'Business Specialist (Bob)', action: 'CREATED', target: 'CFG_SHB_001' },
        { id: 4, time: '2026-02-27 11:20', user: 'System', action: 'AUTO_DEACTIVATED', target: 'CFG_OLD_PROMO_01' },
        { id: 5, time: '2026-02-26 14:00', user: 'Product Owner (Alice)', action: 'ROLLED_BACK', target: 'CFG_CAKE_001' },
    ];

    return (
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 font-medium text-sm">Total Cards</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{totalCards}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                        <h3 className="text-slate-500 font-medium text-sm">Active Now</h3>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCards}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-yellow-500">
                        <h3 className="text-slate-500 font-medium text-sm">Drafts Pending</h3>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">{draftCards}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 font-medium text-sm">Avg Dev Time Saved</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">120 hrs</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                        <h3 className="text-slate-800 font-bold mb-4">Configurations by Partner</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                        <h3 className="text-slate-800 font-bold mb-4">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-[-20px]">
                            {pieData.map(d => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-xs text-slate-600">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== REAL-TIME CARDS PERFORMANCE ===== */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                <h3 className="text-white font-bold text-base">Real-time Cards Performance</h3>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs flex items-center gap-1.5">
                                <Clock size={12} />
                                Last updated: {lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                                onClick={handleManualRefresh}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                            >
                                <RefreshCw size={12} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* 7-Day Aggregate Trend */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">7-Day Overall Trend</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                                    <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Impressions" />
                                    <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} dot={false} name="Clicks" />
                                    <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Conversions" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Per-Card Performance Table */}
                    <div className="divide-y divide-slate-100">
                        {cardPerformances.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">No active cards to display performance data.</div>
                        )}
                        {cardPerformances.map((cp) => {
                            const isExpanded = expandedCard === cp.configId;
                            const trend7d = generateTrendData(cp.card.Config_ID.charCodeAt(0) + refreshKey);

                            return (
                                <div key={cp.configId} className="hover:bg-slate-50/50 transition-colors">
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedCard(isExpanded ? null : cp.configId)}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Card Identity */}
                                            <div className="flex items-center gap-3 min-w-[200px]">
                                                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                                    {cp.card.Logo_URL ? (
                                                        <img src={cp.card.Logo_URL} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full" style={{ backgroundColor: cp.card.Bg_Color || '#e2e8f0' }}></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 leading-tight">{cp.card.Card_Title}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{cp.configId}</p>
                                                </div>
                                            </div>

                                            {/* Main Metrics */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Eye size={13} className="text-blue-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{cp.impressions.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400">Impressions</p>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <MousePointerClick size={13} className={cp.ctr >= PERF_THRESHOLDS.ctr.good ? 'text-emerald-500' : cp.ctr >= PERF_THRESHOLDS.ctr.warn ? 'text-amber-500' : 'text-red-500'} />
                                                    <div>
                                                        <p className={`text-sm font-bold ${cp.ctr >= PERF_THRESHOLDS.ctr.good ? 'text-emerald-600' : cp.ctr >= PERF_THRESHOLDS.ctr.warn ? 'text-amber-600' : 'text-red-600'}`}>{cp.ctr}%</p>
                                                        <p className="text-[10px] text-slate-400">CTR</p>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Repeat2 size={13} className={cp.convRate >= PERF_THRESHOLDS.convRate.good ? 'text-emerald-500' : cp.convRate >= PERF_THRESHOLDS.convRate.warn ? 'text-amber-500' : 'text-red-500'} />
                                                    <div>
                                                        <p className={`text-sm font-bold ${cp.convRate >= PERF_THRESHOLDS.convRate.good ? 'text-emerald-600' : cp.convRate >= PERF_THRESHOLDS.convRate.warn ? 'text-amber-600' : 'text-red-600'}`}>{cp.convRate}%</p>
                                                        <p className="text-[10px] text-slate-400">Conversion</p>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Heart size={13} className="text-pink-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{cp.saves.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400">Saves</p>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Zap size={13} className={cp.engagementScore >= PERF_THRESHOLDS.engagement.good ? 'text-emerald-500' : cp.engagementScore >= PERF_THRESHOLDS.engagement.warn ? 'text-amber-500' : 'text-red-500'} />
                                                    <div>
                                                        <p className={`text-sm font-bold ${cp.engagementScore >= PERF_THRESHOLDS.engagement.good ? 'text-emerald-600' : cp.engagementScore >= PERF_THRESHOLDS.engagement.warn ? 'text-amber-600' : 'text-red-600'}`}>{cp.engagementScore}</p>
                                                        <p className="text-[10px] text-slate-400">Engagement</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge + Edit Button */}
                                            <div className="flex items-center gap-3 ml-auto shrink-0">
                                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cp.perfStatus.color}`}>
                                                    {cp.perfStatus.status !== 'good' && <AlertTriangle size={11} />}
                                                    {cp.perfStatus.label}
                                                </span>
                                                {onEditCard && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEditCard(cp.configId); }}
                                                        title="Edit card config"
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${cp.perfStatus.status === 'critical'
                                                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                                                            : cp.perfStatus.status === 'warn'
                                                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                                : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        <Edit3 size={13} />
                                                        {cp.perfStatus.status === 'critical' ? 'Fix Now' : cp.perfStatus.status === 'warn' ? 'Review' : 'Edit'}
                                                    </button>
                                                )}
                                                <span className="text-slate-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail Panel */}
                                    {isExpanded && (
                                        <div className="px-4 pb-5 bg-slate-50 border-t border-slate-100">
                                            <div className="grid grid-cols-3 gap-4 mt-4">
                                                {/* Detailed Metrics */}
                                                <div className="col-span-1 space-y-3">
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Metrics</h5>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <MetricBadge label="CTR" value={cp.ctr} suffix="%" good={PERF_THRESHOLDS.ctr.good} warn={PERF_THRESHOLDS.ctr.warn} />
                                                        <MetricBadge label="Conv. Rate" value={cp.convRate} suffix="%" good={PERF_THRESHOLDS.convRate.good} warn={PERF_THRESHOLDS.convRate.warn} />
                                                        <MetricBadge label="Avg. Time (s)" value={cp.avgTimeOnCard} suffix="s" good={20} warn={10} />
                                                        <MetricBadge label="Shares" value={cp.shares} suffix="" good={50} warn={20} />
                                                        <MetricBadge label="Conversions" value={cp.conversions} suffix="" good={100} warn={30} />
                                                        <MetricBadge label="Eng. Score" value={cp.engagementScore} suffix="" good={PERF_THRESHOLDS.engagement.good} warn={PERF_THRESHOLDS.engagement.warn} />
                                                    </div>
                                                    {cp.perfStatus.status !== 'good' && onEditCard && (
                                                        <div className={`p-3 rounded-lg border ${cp.perfStatus.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                                            <p className={`text-xs font-bold mb-1 ${cp.perfStatus.status === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                                                {cp.perfStatus.status === 'critical' ? '⚠️ Action Required' : '👀 Suggested Action'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-600 mb-2">
                                                                {cp.ctr < PERF_THRESHOLDS.ctr.warn ? 'CTR is critically low. Try updating the card title, subtitle, or badge text to be more compelling.' : ''}
                                                                {cp.convRate < PERF_THRESHOLDS.convRate.warn ? ' Conversion rate needs improvement. Consider adjusting CTA text, priority, or target segment.' : ''}
                                                            </p>
                                                            <button
                                                                onClick={() => onEditCard(cp.configId)}
                                                                className={`w-full py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 ${cp.perfStatus.status === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                                                            >
                                                                <Edit3 size={12} />
                                                                Open Card Editor
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 7-day Sparkline */}
                                                <div className="col-span-2">
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">7-Day Trend (This Card)</h5>
                                                    <div className="h-40">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={trend7d} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                                                <YAxis tick={{ fontSize: 10 }} />
                                                                <Tooltip contentStyle={{ fontSize: 11 }} />
                                                                <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Impressions" />
                                                                <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={1.5} dot={false} name="Clicks" />
                                                                <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Conversions" />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex gap-4 mt-2 justify-end">
                                                        {[{ c: '#3b82f6', l: 'Impressions' }, { c: '#10b981', l: 'Clicks' }, { c: '#f59e0b', l: 'Conversions' }].map(item => (
                                                            <div key={item.l} className="flex items-center gap-1.5">
                                                                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: item.c }}></div>
                                                                <span className="text-[10px] text-slate-500">{item.l}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-slate-800 font-bold">System Audit Logs</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Export CSV</button>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th className="px-6 py-3 font-medium">Timestamp</th>
                                <th className="px-6 py-3 font-medium">User Role</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                                <th className="px-6 py-3 font-medium">Target Config</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-500">{log.time}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.user}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.action === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                                            log.action === 'EDITED' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'ROLLED_BACK' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{log.target}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

