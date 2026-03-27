import React, { useState } from 'react';
import { ParsedData, DisplayRules, UserPersona } from '../types';
import { GitPullRequest, ArrowRightLeft, Waypoints, Settings2, Plus, Search, Filter, Play, Pause, MoreVertical, Edit2, Trash2, ChevronRight, GripVertical, ArrowLeft, User, Zap, FlaskConical, Target } from 'lucide-react';
import { evaluateBundle, assignVariant } from '../utils/targetingEngine';

interface DecisionToolProps {
    data: ParsedData;
    onUpdateData: (newData: ParsedData) => void;
}

export default function DecisionTool({ data, onUpdateData }: DecisionToolProps) {
    const [activeTab, setActiveTab] = useState<'flows' | 'priority' | 'simulation'>('flows');
    const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Simulation State
    const [simPersona, setSimPersona] = useState<UserPersona>({
        userId: 'USER_SIM_001',
        age: 25,
        location: 'HCM',
        salary: 25000000,
        hasLoan: false,
        segment: 'Gold'
    });

    const mockFlows = [
        { id: 'F_ONBOARD_01', name: 'New User Onboarding Flow', description: 'Rules for users who just registered.', status: 'Active', updated_at: '2024-03-01', nodes: 5 },
        { id: 'F_CREDIT_01', name: 'Credit Card Eligibility Check', description: 'Determine which credit cards to show based on age and salary.', status: 'Active', updated_at: '2024-03-02', nodes: 8 },
        { id: 'F_LOAN_01', name: 'Basic Loan Filtering', description: 'Filter out loans for non-eligible segments.', status: 'Inactive', updated_at: '2024-02-28', nodes: 3 },
    ];

    const filteredFlows = mockFlows.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        {editingFlowId && (
                            <button onClick={() => setEditingFlowId(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={18} className="text-slate-500" /></button>
                        )}
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Waypoints className="text-blue-600" />
                            {editingFlowId ? 'Rule Builder' : 'Decision Engine Hub'}
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{editingFlowId ? `Editing Flow: ${editingFlowId}` : 'Manage display rules, logic flows, and partner priorities.'}</p>
                </div>
                {!editingFlowId && (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setActiveTab('simulation')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'simulation' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Zap size={16} /> Run Simulation
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                            <Plus size={16} /> Create New Flow
                        </button>
                    </div>
                )}
                {editingFlowId && (
                    <div className="flex items-center gap-2">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                            Save Draft
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                            Publish Flow
                        </button>
                    </div>
                )}
            </header>

            {/* Tabs Layout */}
            {!editingFlowId && (
                <div className="px-8 mt-6">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('flows')}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'flows' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
                        >
                            <GitPullRequest size={16} />
                            Rule Flows (Logic)
                        </button>
                        <button
                            onClick={() => setActiveTab('priority')}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'priority' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
                        >
                            <ArrowRightLeft size={16} />
                            Card Display Priority
                        </button>
                        <button
                            onClick={() => setActiveTab('simulation')}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'simulation' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
                        >
                            <Zap size={16} />
                            Decision Logic Simulator
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 relative">

                {editingFlowId ? (
                    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Rule Logic Configuration</h3>

                            {/* Simplified Rule Node */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 relative">
                                <div className="absolute top-4 left-4 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold font-mono">1</div>
                                <div className="pl-10">
                                    <div className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wide">IF (Condition)</div>
                                    <div className="flex gap-3 items-center mb-4">
                                        <select className="p-2 border border-slate-300 rounded bg-white text-sm w-48">
                                            <option>User.Age</option>
                                            <option>User.Segment</option>
                                            <option>User.Salary</option>
                                        </select>
                                        <select className="p-2 border border-slate-300 rounded bg-white text-sm w-32">
                                            <option>GreaterThan</option>
                                            <option>Equals</option>
                                            <option>In_Segment_Bundle</option>
                                        </select>
                                        <input type="text" className="p-2 border border-slate-300 rounded bg-white text-sm flex-1" placeholder="Value or Bundle ID" />
                                    </div>

                                    <div className="font-bold text-sm text-emerald-700 mb-3 uppercase tracking-wide">THEN (Action)</div>
                                    <div className="flex gap-3 items-center">
                                        <select className="p-2 border border-emerald-300 rounded bg-emerald-50 text-sm w-48 font-medium">
                                            <option>Show_Card</option>
                                            <option>Hide_Card</option>
                                            <option>Set_Priority</option>
                                            <option>Assign_Experiment</option>
                                        </select>
                                        <select className="p-2 border border-emerald-300 rounded bg-white text-sm flex-1">
                                            {data.cardUIConfig.map(c => (
                                                <option key={c.Config_ID} value={c.Config_ID}>{c.Config_ID} ({c.Card_Title})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button className="py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all w-full">
                                <Plus size={16} /> Add Rule Step
                            </button>
                        </div>
                    </div>
                ) : activeTab === 'flows' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search logic flows..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4 font-medium">Flow ID</th>
                                    <th className="px-6 py-4 font-medium">Name & Description</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Nodes</th>
                                    <th className="px-6 py-4 font-medium">Last Updated</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredFlows.map(flow => (
                                    <tr key={flow.id} className="hover:bg-slate-50/50 group transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{flow.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-slate-800">{flow.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">{flow.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {flow.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                    <Play size={10} className="fill-emerald-800" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    <Pause size={10} className="fill-slate-600" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                <Waypoints size={14} className="text-slate-400" />
                                                <span className="font-bold">{flow.nodes}</span> nodes
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{flow.updated_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingFlowId(flow.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit Flow Engine">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'priority' ? (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Card Display Priority</h2>
                                    <p className="text-xs text-slate-500 mt-1">Drag and drop to reorder the base priority of cards across the OAO Hub.</p>
                                </div>
                            </div>

                            <div className="p-2 space-y-2 bg-slate-50/30">
                                {data.cardUIConfig.map((card, idx) => (
                                    <div key={card.Config_ID} className="flex items-center gap-4 bg-white p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <button className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                                            <GripVertical size={20} />
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-1">
                                            {card.Logo_URL ? <img src={card.Logo_URL} alt="logo" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-slate-200 rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-slate-800">{card.Card_Title}</h4>
                                            <p className="text-xs text-slate-500">{card.Config_ID}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Priority Score</div>
                                            <div className="font-mono text-sm text-slate-800 font-bold bg-slate-100 inline-block px-2 rounded">
                                                {(100 - idx * 10).toString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                                <p className="text-xs text-slate-500 italic">This priority can be overridden dynamically by specific Rule Flows.</p>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'simulation' ? (
                    <div className="max-w-6xl mx-auto flex gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Control Panel */}
                        <div className="w-80 shrink-0 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                                    <User size={18} className="text-blue-500" />
                                    Simulation Persona
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Region</label>
                                        <select 
                                            value={simPersona.location}
                                            onChange={(e) => setSimPersona({...simPersona, location: e.target.value})}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                        >
                                            <option value="HCM">Ho Chi Minh</option>
                                            <option value="HN">Ha Noi</option>
                                            <option value="DaNang">Da Nang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salary Range (VND)</label>
                                        <input 
                                            type="number" 
                                            value={simPersona.salary}
                                            onChange={(e) => setSimPersona({...simPersona, salary: Number(e.target.value)})}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age</label>
                                        <input 
                                            type="number" 
                                            value={simPersona.age}
                                            onChange={(e) => setSimPersona({...simPersona, age: Number(e.target.value)})}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <label className="text-sm font-medium text-slate-600">Existing Loan?</label>
                                        <input 
                                            type="checkbox" 
                                            checked={simPersona.hasLoan}
                                            onChange={(e) => setSimPersona({...simPersona, hasLoan: e.target.checked})}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Panel */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                                    Simulating Output for {simPersona.userId}
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        Decision Cycle: 14ms
                                    </span>
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Segment Matching */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Target size={14} /> Segment Bundles Matching
                                        </h4>
                                        <div className="space-y-2">
                                            {data.segmentBundles.map(bundle => {
                                                const isMatch = evaluateBundle(bundle, simPersona);
                                                return (
                                                    <div key={bundle.id} className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${isMatch ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${isMatch ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                            <div>
                                                                <div className={`text-sm font-bold ${isMatch ? 'text-emerald-900' : 'text-slate-600'}`}>{bundle.name}</div>
                                                                <div className="text-[10px] text-slate-400">{bundle.description}</div>
                                                            </div>
                                                        </div>
                                                        {isMatch && <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm">MATCH</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Experiment Assignment */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FlaskConical size={14} /> A/B Experiment Assignment
                                        </h4>
                                        <div className="space-y-2">
                                            {data.experiments.map(exp => {
                                                const variant = assignVariant(exp, simPersona);
                                                return (
                                                    <div key={exp.id} className="p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-sm font-bold text-blue-900">{exp.name}</div>
                                                            <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm">ACTIVE</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Assigned Variant:</div>
                                                            <div className="text-xs font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                                                {variant?.name || 'Assigned to Control'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Resulting Card Layout */}
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Final Multi-layered Decision Result</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        {data.cardUIConfig.map((card, i) => (
                                            <div key={card.Config_ID} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                                <div className="text-[10px] font-mono text-slate-400 mb-1">{card.Config_ID}</div>
                                                <div className="font-bold text-xs text-slate-700 truncate">{card.Card_Title}</div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">SHOWN</span>
                                                    <span className="text-[10px] text-slate-400">Prio: {100 - i*10}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

            </div>
        </div>
    );
}
    );
}
