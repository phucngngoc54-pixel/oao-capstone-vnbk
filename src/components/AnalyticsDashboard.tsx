import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ParsedData } from '../types';

interface AnalyticsDashboardProps {
    data: ParsedData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
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
        { name: 'Active', value: activeCards, color: '#10b981' }, // Emerald
        { name: 'Draft', value: draftCards, color: '#f59e0b' },   // Amber
        { name: 'Inactive', value: totalCards - activeCards - draftCards, color: '#94a3b8' } // Slate
    ];

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
                    {/* Bar Chart */}
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

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                        <h3 className="text-slate-800 font-bold mb-4">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
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
