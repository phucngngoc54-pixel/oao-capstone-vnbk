import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  History, 
  PlusCircle, 
  X, 
  Save, 
  ChevronRight, 
  Users,
  AlertTriangle,
  Settings,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { ParsedData, Experiment, Variant, SegmentBundle } from '../types';

interface ExperimentManagerProps {
  data: ParsedData;
  onUpdateData: (newData: ParsedData) => void;
}

export default function ExperimentManager({ data, onUpdateData }: ExperimentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExp, setEditingExp] = useState<Experiment | null>(null);

  const handleAddExperiment = () => {
    const newExp: Experiment = {
      id: `EXP_${Date.now()}`,
      name: 'New Experiment',
      description: '',
      status: 'Draft',
      variants: [
        { 
          id: `V_A_${Date.now()}`, 
          name: 'Control', 
          weight: 50, 
          segment_bundle_snapshot: { id: `S_${Date.now()}`, name: 'All', category: 'Custom', rules: [], logicOperator: 'AND', isActive: true } 
        },
        { 
          id: `V_B_${Date.now()}`, 
          name: 'Variant B', 
          weight: 50, 
          segment_bundle_snapshot: { id: `S_B_${Date.now()}`, name: 'Targeted', category: 'Custom', rules: [], logicOperator: 'AND', isActive: true } 
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingExp(newExp);
    setIsAdding(true);
  };

  const handleSaveExperiment = () => {
    if (!editingExp) return;
    
    const experiments = [...(data.experiments || [])];
    const index = experiments.findIndex(e => e.id === editingExp.id);
    
    const updatedExp = { ...editingExp, updatedAt: new Date().toISOString() };
    
    if (index >= 0) {
      experiments[index] = updatedExp;
    } else {
      experiments.push(updatedExp);
    }
    
    onUpdateData({ ...data, experiments });
    setIsAdding(false);
    setEditingExp(null);
  };

  const toggleStatus = (exp: Experiment) => {
    const experiments = (data.experiments || []).map(e => {
      if (e.id === exp.id) {
        return { ...e, status: e.status === 'Running' ? 'Paused' : 'Running' as any };
      }
      return e;
    });
    onUpdateData({ ...data, experiments });
  };

  const updateVariant = (idx: number, updates: Partial<Variant>) => {
    if (!editingExp) return;
    const variants = [...editingExp.variants];
    variants[idx] = { ...variants[idx], ...updates };
    setEditingExp({ ...editingExp, variants });
  };

  const applyBundleToVariant = (variantIdx: number, bundle: SegmentBundle) => {
    if (!editingExp) return;
    const variants = [...editingExp.variants];
    variants[variantIdx] = { 
      ...variants[variantIdx], 
      segment_bundle_snapshot: { ...bundle } // Snapshot it
    };
    setEditingExp({ ...editingExp, variants });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">A/B Testing</h1>
          <p className="text-slate-500 text-sm mt-1">Run and monitor experiments to optimize product conversion.</p>
        </div>
        <button
          onClick={handleAddExperiment}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <PlusCircle size={18} />
          New Experiment
        </button>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {isAdding || editingExp ? (
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {isAdding ? 'Configure New Experiment' : 'Edit Experiment'}
              </h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingExp(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 text-slate-800">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Experiment Name</label>
                    <input 
                      type="text" 
                      value={editingExp?.name || ''}
                      onChange={(e) => setEditingExp({ ...editingExp!, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                      placeholder="Enter a descriptive name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hypothesis & Description</label>
                    <textarea 
                      value={editingExp?.description || ''}
                      onChange={(e) => setEditingExp({ ...editingExp!, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                      placeholder="What are we testing and why?"
                    />
                  </div>
                </div>
                
                <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold flex items-center gap-2 text-indigo-900 leading-none">
                    <Settings size={18} className="text-indigo-600" />
                    Runtime Settings
                  </h3>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Status</label>
                      <div className="flex gap-2">
                        {['Draft', 'Running'].map(s => (
                          <button 
                            key={s}
                            onClick={() => setEditingExp({ ...editingExp!, status: s as any })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${editingExp?.status === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-slate-800">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2 text-indigo-600">
                    <History size={20} />
                    Variant Allocation
                  </h3>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                    <Plus size={16} /> Add Variant
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {editingExp?.variants.map((variant, idx) => (
                    <div key={variant.id} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-300 transition-colors">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">Variant {String.fromCharCode(65 + idx)}</span>
                          <input 
                            type="text" 
                            value={variant.name}
                            onChange={(e) => updateVariant(idx, { name: e.target.value })}
                            className="bg-transparent border-none p-0 text-xl font-black text-slate-800 focus:ring-0 outline-none w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                          <input 
                            type="number" 
                            value={variant.weight}
                            onChange={(e) => updateVariant(idx, { weight: Number(e.target.value) })}
                            className="w-10 text-center font-black text-indigo-600 focus:ring-0 outline-none"
                          />
                          <span className="text-xs font-black text-slate-400">%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Users size={14} /> Targeting Logic (Snapshot)
                        </label>
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner min-h-[100px] flex flex-col">
                          {variant.segment_bundle_snapshot.rules.length > 0 ? (
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-indigo-600">{variant.segment_bundle_snapshot.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{variant.segment_bundle_snapshot.logicOperator}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {variant.segment_bundle_snapshot.rules.map(r => (
                                  <span key={r.id} className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                    {r.field} {r.operator.toLowerCase()} {String(r.value)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                              <p className="text-xs text-slate-400 italic">No targeting constraints.</p>
                              <p className="text-[10px] text-slate-400">Targeting ALL traffic for this variant.</p>
                            </div>
                          )}
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Apply Reusable Bundle</label>
                            <div className="flex overflow-x-auto gap-2 py-1 scrollbar-hide">
                              {(data.segmentBundles || []).map(bundle => (
                                <button 
                                  key={bundle.id}
                                  onClick={() => applyBundleToVariant(idx, bundle)}
                                  className="shrink-0 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg transition-colors border border-indigo-100"
                                >
                                  {bundle.name}
                                </button>
                              ))}
                              <button 
                                onClick={() => applyBundleToVariant(idx, { id: 'ALL', name: 'Reset (All)', category: 'Custom', rules: [], logicOperator: 'AND', isActive: true })}
                                className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 translate-y-0">
              <button 
                onClick={() => { setIsAdding(false); setEditingExp(null); }}
                className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveExperiment}
                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Save size={18} />
                Finalize Experiment
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(data.experiments || []).map(exp => (
              <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${exp.status === 'Running' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <FlaskConical size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-800">{exp.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exp.status === 'Running' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{exp.description || 'No description provided.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleStatus(exp)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm active:shadow-none bg-white border-2 ${exp.status === 'Running' ? 'text-amber-600 border-amber-600 hover:bg-amber-50' : 'text-emerald-600 border-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {exp.status === 'Running' ? <Pause size={18} /> : <Play size={18} />}
                      {exp.status === 'Running' ? 'PAUSE' : 'START'}
                    </button>
                    <button 
                      onClick={() => setEditingExp(exp)}
                      className="p-3 text-slate-400 hover:text-slate-800 transition-colors bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="px-8 py-8 bg-slate-50/50 flex gap-8">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Variation Control</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {exp.variants.map((variant, vIdx) => (
                        <div key={vIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{variant.name}</span>
                            <span className="text-xl font-black text-slate-800">{variant.weight}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${variant.weight}%` }} />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {variant.segment_bundle_snapshot.rules.length > 0 ? (
                               variant.segment_bundle_snapshot.rules.slice(0, 2).map((r, ri) => (
                                 <span key={ri} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                                   {r.field} {r.operator.toLowerCase()}
                                 </span>
                               ))
                             ) : (
                               <span className="text-[9px] italic text-slate-400">All Traffic</span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-72 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Estimated Reach</h4>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                       <div className="text-3xl font-black text-slate-800 leading-none">12.4K</div>
                       <div className="text-slate-500 text-xs font-bold mt-2">Active Participants</div>
                       <div className="mt-8 flex items-center justify-between text-xs font-black">
                          <span className="text-emerald-500">+12%</span>
                          <span className="text-slate-400 uppercase tracking-tighter italic">VS BASELINE</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white px-8 py-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <History size={14} />
                      Created {new Date(exp.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <div>Last update {new Date(exp.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    View Detailed Reports <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            {(data.experiments || []).length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FlaskConical size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No active experiments</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">Create your first A/B test to start optimizing your user experience with data-driven decisions.</p>
                <button 
                  onClick={handleAddExperiment}
                  className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  Start First Experiment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
