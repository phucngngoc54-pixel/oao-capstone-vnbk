import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Filter, 
  Save, 
  X,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { ParsedData, SegmentBundle, TargetingRule } from '../types';

interface SegmentBundleManagerProps {
  data: ParsedData;
  onUpdateData: (newData: ParsedData) => void;
}

const OPERATORS = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Not Equals' },
  { value: 'GREATER_THAN', label: 'Greater Than' },
  { value: 'LESS_THAN', label: 'Less Than' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'IN', label: 'In' },
];

const FIELDS = [
  { value: 'age', label: 'Age' },
  { value: 'location', label: 'Location' },
  { value: 'salary', label: 'Salary' },
  { value: 'hasLoan', label: 'Has Loan' },
  { value: 'segment', label: 'User Segment' },
  { value: 'os', label: 'OS' },
];

export default function SegmentBundleManager({ data, onUpdateData }: SegmentBundleManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBundle, setEditingBundle] = useState<SegmentBundle | null>(null);

  const handleAddBundle = () => {
    const newBundle: SegmentBundle = {
      id: `B_${Date.now()}`,
      name: 'New Segment Bundle',
      category: 'Custom',
      description: '',
      rules: [],
      logicOperator: 'AND',
      isActive: true
    };
    setEditingBundle(newBundle);
    setIsAdding(true);
  };

  const handleSaveBundle = () => {
    if (!editingBundle) return;
    
    const bundles = [...(data.segmentBundles || [])];
    const index = bundles.findIndex(b => b.id === editingBundle.id);
    
    if (index >= 0) {
      bundles[index] = editingBundle;
    } else {
      bundles.push(editingBundle);
    }
    
    onUpdateData({ ...data, segmentBundles: bundles });
    setIsAdding(false);
    setEditingBundle(null);
  };

  const handleDeleteBundle = (id: string) => {
    const bundles = (data.segmentBundles || []).filter(b => b.id !== id);
    onUpdateData({ ...data, segmentBundles: bundles });
  };

  const toggleBundleActive = (bundle: SegmentBundle) => {
    const bundles = (data.segmentBundles || []).map(b => 
      b.id === bundle.id ? { ...b, isActive: !b.isActive } : b
    );
    onUpdateData({ ...data, segmentBundles: bundles });
  };

  const addRule = () => {
    if (!editingBundle) return;
    const newRule: TargetingRule = {
      id: `R_${Date.now()}`,
      field: 'age',
      operator: 'GREATER_THAN',
      value: ''
    };
    setEditingBundle({
      ...editingBundle,
      rules: [...editingBundle.rules, newRule]
    });
  };

  const removeRule = (ruleId: string) => {
    if (!editingBundle) return;
    setEditingBundle({
      ...editingBundle,
      rules: editingBundle.rules.filter(r => r.id !== ruleId)
    });
  };

  const updateRule = (ruleId: string, updates: Partial<TargetingRule>) => {
    if (!editingBundle) return;
    setEditingBundle({
      ...editingBundle,
      rules: editingBundle.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Segment Bundles</h1>
          <p className="text-slate-500 text-sm mt-1">Create reusable targeting groups for cards and experiments.</p>
        </div>
        <button
          onClick={handleAddBundle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Create Bundle
        </button>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {isAdding || editingBundle ? (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {isAdding ? 'Create New Segment Bundle' : 'Edit Segment Bundle'}
              </h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingBundle(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Bundle Name</label>
                  <input 
                    type="text" 
                    value={editingBundle?.name || ''}
                    onChange={(e) => setEditingBundle({ ...editingBundle!, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. High Worth Personalities"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select 
                    value={editingBundle?.category || 'Custom'}
                    onChange={(e) => setEditingBundle({ ...editingBundle!, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Loan">Loan</option>
                    <option value="Credit">Credit</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  value={editingBundle?.description || ''}
                  onChange={(e) => setEditingBundle({ ...editingBundle!, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  placeholder="What is this bundle for?"
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-blue-500" />
                    Targeting Rules
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setEditingBundle({ ...editingBundle!, logicOperator: 'AND' })}
                        className={`px-3 py-1 text-xs font-bold rounded ${editingBundle?.logicOperator === 'AND' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                      >AND</button>
                      <button 
                        onClick={() => setEditingBundle({ ...editingBundle!, logicOperator: 'OR' })}
                        className={`px-3 py-1 text-xs font-bold rounded ${editingBundle?.logicOperator === 'OR' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                      >OR</button>
                    </div>
                    <button 
                      onClick={addRule}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Rule
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {editingBundle?.rules.map((rule, idx) => (
                    <div key={rule.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 group">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </div>
                      <select 
                        value={rule.field}
                        onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <select 
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input 
                        type="text" 
                        value={String(rule.value)}
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value..."
                      />
                      <button 
                        onClick={() => removeRule(rule.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {editingBundle?.rules.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-400 text-sm">No rules defined. This bundle will match all users.</p>
                      <button onClick={addRule} className="mt-2 text-blue-600 font-bold text-sm">+ Add first rule</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => { setIsAdding(false); setEditingBundle(null); }}
                className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBundle}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Save Bundle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.segmentBundles || []).map(bundle => (
              <div key={bundle.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {bundle.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{bundle.name}</h3>
                  </div>
                  <button 
                    onClick={() => toggleBundleActive(bundle)}
                    className={`p-1 rounded-full transition-colors ${bundle.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
                    title={bundle.isActive ? 'Active' : 'Inactive'}
                  >
                    {bundle.isActive ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </button>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-2">{bundle.description || 'No description provided.'}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tight">
                      <span>{bundle.rules.length} Rules ({bundle.logicOperator})</span>
                      <Filter size={14} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.rules.slice(0, 3).map(rule => (
                        <span key={rule.id} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                          {rule.field} {rule.operator === 'EQUALS' ? '=' : rule.operator === 'GREATER_THAN' ? '>' : rule.operator.toLowerCase()} {String(rule.value)}
                        </span>
                      ))}
                      {bundle.rules.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px] font-medium border border-slate-200">
                          +{bundle.rules.length - 3} more
                        </span>
                      )}
                      {bundle.rules.length === 0 && <span className="text-xs text-slate-400 italic">Matches all users</span>}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    onClick={() => handleDeleteBundle(bundle.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => setEditingBundle(bundle)}
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Save size={14} />
                    Edit Details
                  </button>
                  <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddBundle}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-blue-400 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm">Create New Bundle</span>
            </button>
          </div>
        )}
      </div>

      {data.experiments && data.experiments.length > 0 && (
        <div className="mx-8 mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Dependencies Detected</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Some bundles are currently used in active A/B experiments. Modification may affect experiment baseline results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
