import React, { useState, useEffect } from 'react';
import { X, Save, Smartphone, CheckCircle2, ChevronRight, Building2, ArrowLeft, Activity, ExternalLink, Copy, Upload, EyeOff, Plus, Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, Palette, Type } from 'lucide-react';
import { ParsedData, CardUIConfig, ProductDetailConfig, DisplayRules } from '../types';

interface CardConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    configId: string | null;
    data: ParsedData;
    onSave: (card: CardUIConfig, detail: ProductDetailConfig, rule: DisplayRules) => void;
    onRedirectToPartners: () => void;
}

export default function CardConfigModal({ isOpen, onClose, configId, data, onSave, onRedirectToPartners }: CardConfigModalProps) {
    const [previewScreen, setPreviewScreen] = useState<'listing' | 'detail' | 'steps'>('listing');
    const [mobileActiveCategory, setMobileActiveCategory] = useState('Tất cả');
    const [mobileActiveNav, setMobileActiveNav] = useState('Mở thẻ & Vay');

    // Draft States
    const [cardUI, setCardUI] = useState<Partial<CardUIConfig>>({});
    const [productDetail, setProductDetail] = useState<Partial<ProductDetailConfig>>({});
    const [displayRule, setDisplayRule] = useState<Partial<DisplayRules>>({});

    const [activeSubContentTab, setActiveSubContentTab] = useState(0);
    const [activeMainCtaTab, setActiveMainCtaTab] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (configId) {
                // Edit Mode
                const c = data.cardUIConfig.find(c => c.Config_ID === configId) || ({} as CardUIConfig);
                const d = data.productDetailConfig.find(d => d.Config_ID === configId) || ({} as ProductDetailConfig);
                const r = data.displayRules.find(r => r.Config_ID === configId) || ({} as DisplayRules);

                setCardUI({
                    ...c,
                    Has_Base_Card: c.Has_Base_Card !== undefined ? c.Has_Base_Card : true,
                    Has_Explored_Card: c.Has_Explored_Card !== undefined ? c.Has_Explored_Card : true,
                    Has_Freeze_Banner: c.Has_Freeze_Banner !== undefined ? c.Has_Freeze_Banner : false,
                    Has_Hero_Banner: c.Has_Hero_Banner !== undefined ? c.Has_Hero_Banner : false,
                    Has_Detail_Block: c.Has_Detail_Block !== undefined ? c.Has_Detail_Block : true,
                });
                setProductDetail({
                    ...d,
                });
                setDisplayRule(r);
            } else {
                // Create Mode
                const newId = `CFG_NEW_${Math.floor(Math.random() * 10000)}`;
                setCardUI({
                    Config_ID: newId,
                    Bg_Color: '#ffffff',
                    Text_Color: '#1e293b',
                    Has_Base_Card: true,
                    Has_Explored_Card: true,
                    Has_Freeze_Banner: false,
                    Has_Hero_Banner: false,
                    Has_Detail_Block: true
                });
                setProductDetail({ Config_ID: newId });
                setDisplayRule({ Config_ID: newId, Priority: '10', User_Segment: 'All', Status: 'DRAFT' });
            }
            setPreviewScreen('listing');
        }
    }, [isOpen, configId, data]);

    if (!isOpen) return null;

    const handlePartnerChange = (partnerId: string) => {
        if (partnerId === 'ADD_NEW_PARTNER') {
            onRedirectToPartners();
            return;
        }

        const partner = data.partnerMaster.find(p => p.Partner_ID === partnerId);
        if (partner) {
            setCardUI({
                ...cardUI,
                Partner_ID: partnerId,
                Card_Title: partner.Card_Title || cardUI.Card_Title,
                Card_Subtitle: partner.Card_Subtitle || cardUI.Card_Subtitle,
                Logo_URL: partner.Logo_URL || cardUI.Logo_URL,
                Bg_Color: partner.Bg_Color || cardUI.Bg_Color,
                Text_Color: partner.Text_Color || cardUI.Text_Color,
                Config_Name: partner.Partner_Name, // Auto-fill internal name
                Bank_Code: partner.Bank_Code
            });
        } else {
            setCardUI({ ...cardUI, Partner_ID: partnerId });
        }
    };

    const handleSave = (targetStatus: 'DRAFT' | 'ACTIVE') => {
        // Basic validation
        if (!cardUI.Config_ID || !cardUI.Partner_ID || !cardUI.Card_Title) {
            alert("Config ID, Partner, and Card Title are required.");
            return;
        }

        onSave(
            cardUI as CardUIConfig,
            productDetail as ProductDetailConfig,
            { ...displayRule, Status: targetStatus } as DisplayRules
        );
    };

    const handleExport = () => {
        const exportData = {
            cardUI,
            productDetail,
            displayRule
        };
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
            .then(() => alert('Configuration copied to clipboard!'))
            .catch(err => alert('Failed to copy.'));
    };

    const handleImport = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const imported = JSON.parse(text);
            if (imported.cardUI) setCardUI(imported.cardUI);
            if (imported.productDetail) setProductDetail(imported.productDetail);
            if (imported.displayRule) setDisplayRule({ ...imported.displayRule, Config_ID: cardUI.Config_ID || '' });
            alert('Imported configuration successfully!');
        } catch (e) {
            alert('Failed to import JSON from clipboard. Please ensure it is valid.');
        }
    };

    // --- Array Handlers for Phase 9 ---
    const addSubContent = () => {
        const newItem = { id: Date.now().toString(), type: 'HYPER_LINK', label: '' };
        const newArr = [...(productDetail.Sub_Contents || []), newItem];
        setProductDetail({ ...productDetail, Sub_Contents: newArr });
        setActiveSubContentTab(newArr.length - 1);
    };
    const updateSubContent = (index: number, key: string, value: string) => {
        const arr = [...(productDetail.Sub_Contents || [])];
        arr[index] = { ...arr[index], [key]: value };
        setProductDetail({ ...productDetail, Sub_Contents: arr });
    };
    const removeSubContent = (index: number) => {
        const arr = [...(productDetail.Sub_Contents || [])];
        arr.splice(index, 1);
        setProductDetail({ ...productDetail, Sub_Contents: arr });
        if (activeSubContentTab >= arr.length) setActiveSubContentTab(Math.max(0, arr.length - 1));
    };

    const addGuidance = () => {
        const newItem = { id: Date.now().toString(), content: '', image_url: '' };
        setProductDetail({ ...productDetail, Guidances: [...(productDetail.Guidances || []), newItem] });
    };
    const updateGuidance = (index: number, key: string, value: string) => {
        const arr = [...(productDetail.Guidances || [])];
        arr[index] = { ...arr[index], [key]: value };
        setProductDetail({ ...productDetail, Guidances: arr });
    };
    const removeGuidance = (index: number) => {
        const arr = [...(productDetail.Guidances || [])];
        arr.splice(index, 1);
        setProductDetail({ ...productDetail, Guidances: arr });
    };

    const addMainCta = () => {
        const newItem = { id: Date.now().toString(), condition: 'CONFIRM_CONDITION', name: '', action_type: 'DEEPLINK', url: '' };
        const newArr = [...(productDetail.Main_CTAs || []), newItem];
        setProductDetail({ ...productDetail, Main_CTAs: newArr });
        setActiveMainCtaTab(newArr.length - 1);
    };
    const updateMainCta = (index: number, key: string, value: string) => {
        const arr = [...(productDetail.Main_CTAs || [])];
        arr[index] = { ...arr[index], [key]: value };
        setProductDetail({ ...productDetail, Main_CTAs: arr });
    };
    const removeMainCta = (index: number) => {
        const arr = [...(productDetail.Main_CTAs || [])];
        arr.splice(index, 1);
        setProductDetail({ ...productDetail, Main_CTAs: arr });
        if (activeMainCtaTab >= arr.length) setActiveMainCtaTab(Math.max(0, arr.length - 1));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {configId ? `Edit Configuration: ${configId}` : 'Create New Configuration'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Modify card details, visuals, and display rules.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => handleSave('DRAFT')} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-bold shadow-sm transition-colors">
                            Save Draft
                        </button>
                        <button onClick={() => handleSave('ACTIVE')} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors">
                            <CheckCircle2 size={18} />
                            Publish Active
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left: Form Area */}
                    <div className="flex-1 flex flex-col border-r border-slate-200">
                        {/* Action Bar */}
                        <div className="flex justify-end gap-2 p-3 border-b border-slate-200 bg-slate-50/80">
                            {configId ? (
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-md text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                                >
                                    <Copy size={14} /> Export JSON Config
                                </button>
                            ) : (
                                <button
                                    onClick={handleImport}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors"
                                >
                                    <Upload size={14} /> Import from Clipboard
                                </button>
                            )}
                        </div>

                        {/* Scrollable Form Content - Gray Block UI */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 space-y-6">

                            {/* BLOCK 1: Basic Information */}
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={cardUI.Config_Name || ''}
                                            onChange={e => setCardUI({ ...cardUI, Config_Name: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Status <span className="text-red-500">*</span></label>
                                        <select
                                            value={displayRule.Status || 'DRAFT'}
                                            onChange={e => setDisplayRule({ ...displayRule, Status: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="DRAFT">DRAFT</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Bank Code <span className="text-red-500">*</span></label>
                                        <select
                                            value={cardUI.Partner_ID || ''}
                                            onChange={e => handlePartnerChange(e.target.value)}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select partner...</option>
                                            {data.partnerMaster.map(p => <option key={p.Partner_ID} value={p.Partner_ID}>{p.Bank_Code}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Category <span className="text-red-500">*</span></label>
                                        <select
                                            value={cardUI.Service_Group || 'Khác'}
                                            onChange={e => setCardUI({ ...cardUI, Service_Group: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Tài khoản">Tài khoản</option>
                                            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                            <option value="Vay tiêu dùng">Vay tiêu dùng</option>
                                            <option value="Loại khác">LOẠI KHÁC</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Extra Info <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={cardUI.Extra_Info || ''}
                                            onChange={e => setCardUI({ ...cardUI, Extra_Info: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 2: Banner */}
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Banner</h3>

                                {/* Freeze Banner Sub-section */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[12px] font-bold text-slate-600 uppercase">Freeze Banner</h4>
                                        <button
                                            onClick={() => setCardUI({ ...cardUI, Has_Freeze_Banner: !cardUI.Has_Freeze_Banner })}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${cardUI.Has_Freeze_Banner ? 'bg-blue-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${cardUI.Has_Freeze_Banner ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-x-8 gap-y-4 transition-opacity ${cardUI.Has_Freeze_Banner ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Title <span className="text-red-500">*</span></label>
                                            <input type="text" value={productDetail.Freeze_Title || ''} onChange={e => setProductDetail({ ...productDetail, Freeze_Title: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Subtitle <span className="text-red-500">*</span></label>
                                            <input type="text" value={productDetail.Freeze_Subtitle || ''} onChange={e => setProductDetail({ ...productDetail, Freeze_Subtitle: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Banner Sub-section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[12px] font-bold text-slate-600 uppercase">Hero Banner</h4>
                                        <button
                                            onClick={() => setCardUI({ ...cardUI, Has_Hero_Banner: !cardUI.Has_Hero_Banner })}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${cardUI.Has_Hero_Banner ? 'bg-blue-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${cardUI.Has_Hero_Banner ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-x-8 gap-y-4 transition-opacity ${cardUI.Has_Hero_Banner ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Title</label>
                                            <input type="text" value={productDetail.Hero_Title || ''} onChange={e => setProductDetail({ ...productDetail, Hero_Title: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Image</label>
                                            <div className="relative">
                                                <input type="text" value={productDetail.Hero_Banner_URL || ''} onChange={e => setProductDetail({ ...productDetail, Hero_Banner_URL: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm pr-20" placeholder="https://..." />
                                                <span className="absolute right-3 top-2.5 text-[10px] text-blue-500 font-bold cursor-pointer">Image Details</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Subtitle</label>
                                            <input type="text" value={productDetail.Hero_Subtitle || ''} onChange={e => setProductDetail({ ...productDetail, Hero_Subtitle: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 3: Card */}
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Card</h3>

                                {/* Base Card */}
                                <div className="mb-8 p-4 border border-slate-100 rounded-lg bg-white/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[12px] font-bold text-slate-600 uppercase">Base Card</h4>
                                        <button
                                            onClick={() => setCardUI({ ...cardUI, Has_Base_Card: !cardUI.Has_Base_Card })}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${cardUI.Has_Base_Card ? 'bg-blue-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${cardUI.Has_Base_Card ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-x-8 gap-y-6 transition-opacity ${cardUI.Has_Base_Card ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Title <span className="text-red-500">*</span></label>
                                            <input type="text" value={cardUI.Card_Title || ''} onChange={e => setCardUI({ ...cardUI, Card_Title: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Logo <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input type="text" value={cardUI.Logo_URL || ''} onChange={e => setCardUI({ ...cardUI, Logo_URL: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm pr-20" />
                                                <span className="absolute right-3 top-2.5 text-[10px] text-blue-500 font-bold cursor-pointer">Image Details</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Subtitle <span className="text-red-500">*</span></label>
                                            <input type="text" value={cardUI.Card_Subtitle || ''} onChange={e => setCardUI({ ...cardUI, Card_Subtitle: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Background Image</label>
                                            <div className="relative">
                                                <input type="text" value={cardUI.Background_Image_URL || ''} onChange={e => setCardUI({ ...cardUI, Background_Image_URL: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm pr-20" />
                                                <span className="absolute right-3 top-2.5 text-[10px] text-blue-500 font-bold cursor-pointer">Image Details</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 grid grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title Color</label>
                                                <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden">
                                                    <input type="color" value={cardUI.Title_Color || '#000000'} onChange={e => setCardUI({ ...cardUI, Title_Color: e.target.value })} className="w-1/3 h-full cursor-pointer border-none p-0" />
                                                    <input type="text" value={cardUI.Title_Color || ''} onChange={e => setCardUI({ ...cardUI, Title_Color: e.target.value })} className="w-2/3 h-full px-2 text-[10px] uppercase font-mono border-none outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtitle Color</label>
                                                <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden">
                                                    <input type="color" value={cardUI.Subtitle_Color || '#64748b'} onChange={e => setCardUI({ ...cardUI, Subtitle_Color: e.target.value })} className="w-1/3 h-full cursor-pointer border-none p-0" />
                                                    <input type="text" value={cardUI.Subtitle_Color || ''} onChange={e => setCardUI({ ...cardUI, Subtitle_Color: e.target.value })} className="w-2/3 h-full px-2 text-[10px] uppercase font-mono border-none outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Background Color</label>
                                                <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden">
                                                    <input type="color" value={cardUI.Bg_Color || '#ffffff'} onChange={e => setCardUI({ ...cardUI, Bg_Color: e.target.value })} className="w-1/3 h-full cursor-pointer border-none p-0" />
                                                    <input type="text" value={cardUI.Bg_Color || ''} onChange={e => setCardUI({ ...cardUI, Bg_Color: e.target.value })} className="w-2/3 h-full px-2 text-[10px] uppercase font-mono border-none outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Content Color</label>
                                                <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden">
                                                    <input type="color" value={cardUI.Content_Color || '#333333'} onChange={e => setCardUI({ ...cardUI, Content_Color: e.target.value })} className="w-1/3 h-full cursor-pointer border-none p-0" />
                                                    <input type="text" value={cardUI.Content_Color || ''} onChange={e => setCardUI({ ...cardUI, Content_Color: e.target.value })} className="w-2/3 h-full px-2 text-[10px] uppercase font-mono border-none outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Top Right Image</label>
                                            <div className="relative">
                                                <input type="text" value={cardUI.Right_Faded_Logo_URL || ''} onChange={e => setCardUI({ ...cardUI, Right_Faded_Logo_URL: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm pr-20" />
                                                <span className="absolute right-3 top-2.5 text-[10px] text-blue-500 font-bold cursor-pointer">Image Details</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Explored Card */}
                                <div className="p-4 border border-slate-100 rounded-lg bg-white/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[12px] font-bold text-slate-600 uppercase">Explored Card</h4>
                                        <button
                                            onClick={() => setCardUI({ ...cardUI, Has_Explored_Card: !cardUI.Has_Explored_Card })}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${cardUI.Has_Explored_Card ? 'bg-blue-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${cardUI.Has_Explored_Card ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-1 gap-y-4 transition-opacity ${cardUI.Has_Explored_Card ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Badge <span className="text-red-500">*</span></label>
                                            <input type="text" value={cardUI.Badge_Text || ''} onChange={e => setCardUI({ ...cardUI, Badge_Text: e.target.value })} className="w-1/2 p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Description <span className="text-red-500">*</span></label>
                                            <textarea
                                                value={cardUI.Description || ''}
                                                onChange={e => setCardUI({ ...cardUI, Description: e.target.value })}
                                                rows={4}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none resize-none"
                                                placeholder="Nhập các quyền lợi nổi bật, mỗi dòng một ý..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 4: Detail Block (Refactored Phase 9) */}
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Detail Screen Config</h3>
                                    <button
                                        onClick={() => setCardUI({ ...cardUI, Has_Detail_Block: !cardUI.Has_Detail_Block })}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${cardUI.Has_Detail_Block ? 'bg-blue-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${cardUI.Has_Detail_Block ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className={`space-y-8 transition-opacity ${cardUI.Has_Detail_Block ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                                    {/* Header */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-4">Header</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Title <span className="text-red-500">*</span></label>
                                                <input type="text" value={productDetail.Detail_Header_Title || ''} onChange={e => setProductDetail({ ...productDetail, Detail_Header_Title: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" placeholder="Vay tiêu dùng trực tuyến" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Header Image (Logo ngang) <span className="text-red-500">*</span></label>
                                                <input type="text" value={productDetail.Detail_Header_Image_URL || productDetail.Top_Image_URL || ''} onChange={e => setProductDetail({ ...productDetail, Detail_Header_Image_URL: e.target.value, Top_Image_URL: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-4">Main Content</h4>

                                        {/* Fake WYSIWYG Toolbar */}
                                        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-lg border-b-0">
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Type size={14} /></button>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <button className="p-1.5 text-slate-700 font-bold hover:bg-slate-200 rounded">H1</button>
                                            <button className="p-1.5 text-slate-700 font-semibold hover:bg-slate-200 rounded">H2</button>
                                            <button className="p-1.5 text-slate-700 font-medium hover:bg-slate-200 rounded">H3</button>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Bold size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Italic size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Underline size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><LinkIcon size={14} /></button>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><List size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><ListOrdered size={14} /></button>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><AlignLeft size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><AlignCenter size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><AlignRight size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><AlignJustify size={14} /></button>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <select className="text-xs border-none bg-transparent text-slate-600 outline-none cursor-pointer hover:bg-slate-200 rounded px-1 py-1">
                                                <option>14px</option>
                                            </select>
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Palette size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Undo size={14} /></button>
                                            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"><Redo size={14} /></button>
                                        </div>

                                        <textarea
                                            value={productDetail.Detail_Contents || ''}
                                            onChange={e => setProductDetail({ ...productDetail, Detail_Contents: e.target.value })}
                                            rows={8}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-b-lg text-sm outline-none resize-y focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                            placeholder={`Quyền lợi nổi bật:\n- Chỉ cần Căn Cước/CCCD để đăng ký\n- Lãi suất chỉ từ 1.91%/tháng\n\nĐiều kiện:\n- Khách hàng từ 22 tuổi trở lên`}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">Dùng format dạng text list (có bullet) để giả lập hiển thị WYSIWYG Content.</p>
                                    </div>

                                    {/* Sub Contents */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-slate-700 uppercase">Sub Contents</h4>
                                        </div>

                                        {/* Sub Content Tabs */}
                                        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 border-b border-slate-200">
                                            {(productDetail.Sub_Contents || []).map((sub, idx) => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => setActiveSubContentTab(idx)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-b-2 cursor-pointer transition-colors whitespace-nowrap text-xs font-bold ${activeSubContentTab === idx ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                                >
                                                    {idx + 1}. {sub.type || 'HYPER_LINK'}
                                                    <button onClick={(e) => { e.stopPropagation(); removeSubContent(idx); }} className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-200"><X size={12} /></button>
                                                </div>
                                            ))}
                                            <button onClick={addSubContent} className="px-3 py-1.5 text-slate-400 hover:text-blue-600 flex items-center justify-center shrink-0">
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Sub Content Editor */}
                                        {(productDetail.Sub_Contents || []).length > 0 && productDetail.Sub_Contents![activeSubContentTab] && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Label <span className="text-red-500">*</span></label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].label} onChange={e => updateSubContent(activeSubContentTab, 'label', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="Ex: Mã giới thiệu, Xem điều khoản..." />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Code</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].code || ''} onChange={e => updateSubContent(activeSubContentTab, 'code', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="Ex: Z{{phone_number}}" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">CTA Name</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].cta_name || ''} onChange={e => updateSubContent(activeSubContentTab, 'cta_name', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="Ex: Sao chép..." />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Pre-icon URL</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].pre_icon_url || ''} onChange={e => updateSubContent(activeSubContentTab, 'pre_icon_url', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="Ex: https://icon.example.com" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Post-icon URL</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].post_icon_url || ''} onChange={e => updateSubContent(activeSubContentTab, 'post_icon_url', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="Ex: https://icon.example.com" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                                    <div className="col-span-2 text-[10px] italic text-slate-500">Với sub content này mình sẽ chỉ làm HYPER_LINK cho đơn giản. Gồm Content (Label), ZPI Link, ZPA Link.</div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ZPI Link</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].zpi_link || ''} onChange={e => updateSubContent(activeSubContentTab, 'zpi_link', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="https://..." />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">ZPA Link</label>
                                                        <input type="text" value={productDetail.Sub_Contents![activeSubContentTab].zpa_link || ''} onChange={e => updateSubContent(activeSubContentTab, 'zpa_link', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="https://..." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(!productDetail.Sub_Contents || productDetail.Sub_Contents.length === 0) && (
                                            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                <p className="text-xs">Click <button onClick={addSubContent} className="text-blue-500 font-bold inline-flex items-center"><Plus size={12} /> Add</button> to create a sub-content item.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Guidances */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-4">Guidances</h4>
                                        <div className="space-y-3 mb-4">
                                            {(productDetail.Guidances || []).map((item, idx) => (
                                                <div key={item.id} className="p-4 border border-slate-200 bg-white rounded-xl relative flex items-start gap-4 shadow-sm group">
                                                    <button onClick={() => removeGuidance(idx)} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                                                        <X size={14} />
                                                    </button>

                                                    {/* Content input */}
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Content</label>
                                                        <input type="text" value={item.content} onChange={e => updateGuidance(idx, 'content', e.target.value)} className="w-full p-2 text-sm border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Đăng ký tài khoản CUB..." />
                                                    </div>

                                                    {/* Image Box */}
                                                    <div className="w-[280px] shrink-0 border border-slate-200 bg-slate-50 rounded-lg p-2 relative flex flex-col justify-center items-center group/img">
                                                        {item.image_url ? (
                                                            <>
                                                                <img src={item.image_url} alt="preview" className="h-16 object-contain" />
                                                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 rounded-lg">
                                                                    <div className="flex items-center gap-2 font-bold text-[10px] text-emerald-600 mb-1">
                                                                        <CheckCircle2 size={12} /> Image Ready
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => updateGuidance(idx, 'image_url', '')} className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold flex items-center gap-1"><X size={10} /> Remove</button>
                                                                        <button onClick={() => {
                                                                            const url = window.prompt("Enter new URL:", item.image_url);
                                                                            if (url !== null) updateGuidance(idx, 'image_url', url);
                                                                        }} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1"><Upload size={10} /> Replace</button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => {
                                                                const url = window.prompt("Enter Image URL:");
                                                                if (url) updateGuidance(idx, 'image_url', url);
                                                            }} className="w-full py-4 text-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex flex-col items-center gap-1 rounded-md transition-colors">
                                                                <Upload size={16} />
                                                                <span className="text-[10px] font-medium block">Click to upload image URL</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={addGuidance} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                            <Plus size={16} /> Add Guidance Step
                                        </button>
                                    </div>

                                </div>
                            </div>

                            {/* BLOCK 5: Main CTA (Dynamic) */}
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Main CTA</h3>

                                {/* Main CTA Tabs */}
                                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 border-b border-slate-200">
                                    {(productDetail.Main_CTAs || []).map((cta, idx) => (
                                        <div
                                            key={cta.id}
                                            onClick={() => setActiveMainCtaTab(idx)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-b-2 cursor-pointer transition-colors whitespace-nowrap text-xs font-bold ${activeMainCtaTab === idx ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                        >
                                            {cta.condition || 'DEFAULT'}
                                            <button onClick={(e) => { e.stopPropagation(); removeMainCta(idx); }} className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-200"><X size={12} /></button>
                                        </div>
                                    ))}
                                    <button onClick={addMainCta} className="px-3 py-1.5 text-slate-400 hover:text-blue-600 flex items-center justify-center shrink-0">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Main CTA Editor */}
                                {(productDetail.Main_CTAs || []).length > 0 && productDetail.Main_CTAs![activeMainCtaTab] && (
                                    <div className="p-4 border border-slate-200 bg-white rounded-lg relative">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Name <span className="text-red-500">*</span></label>
                                                <input type="text" value={productDetail.Main_CTAs![activeMainCtaTab].name} onChange={e => { updateMainCta(activeMainCtaTab, 'name', e.target.value); if (activeMainCtaTab === 0) setCardUI({ ...cardUI, CTA_Label_Card: e.target.value }) }} className="w-full p-2 text-xs border rounded-md" placeholder="Mở ngay" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Action Type (Dẫn đến đâu?)</label>
                                                <div className="relative">
                                                    <select value={productDetail.Main_CTAs![activeMainCtaTab].action_type} onChange={e => updateMainCta(activeMainCtaTab, 'action_type', e.target.value)} className="w-full p-2 text-xs border rounded-md bg-slate-50 appearance-none font-bold text-slate-700">
                                                        <option value="DEEPLINK">DEEPLINK</option>
                                                        <option value="COPY">COPY</option>
                                                        <option value="OPEN_KYC_FLOW">OPEN_KYC_FLOW</option>
                                                        <option value="NFC">NFC</option>
                                                        <option value="UPDATE_NFC">UPDATE_NFC</option>
                                                        <option value="ADJUST_KYC_NFC">ADJUST_KYC_NFC</option>
                                                        <option value="KYC_NFC">KYC_NFC</option>
                                                        <option value="ERROR_PAGE">ERROR_PAGE</option>
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Description</label>
                                            <input type="text" value={productDetail.Main_CTAs![activeMainCtaTab].description || ''} onChange={e => updateMainCta(activeMainCtaTab, 'description', e.target.value)} className="w-full p-2 text-xs border rounded-md bg-slate-50" placeholder="Input description here..." />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-1">URL</label>
                                                <input type="text" value={productDetail.Main_CTAs![activeMainCtaTab].primary_url || ''} onChange={e => { updateMainCta(activeMainCtaTab, 'primary_url', e.target.value); if (activeMainCtaTab === 0) setProductDetail({ ...productDetail, ZPI_Link: e.target.value }) }} className="w-full p-2 text-xs border rounded-md" placeholder="https://..." />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Secondary URL</label>
                                                <input type="text" value={productDetail.Main_CTAs![activeMainCtaTab].secondary_url || ''} onChange={e => updateMainCta(activeMainCtaTab, 'secondary_url', e.target.value)} className="w-full p-2 text-xs border rounded-md" placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Extra Info JSON</label>
                                            <div className="relative">
                                                <textarea
                                                    rows={2}
                                                    value={productDetail.Main_CTAs![activeMainCtaTab].extra_info_json || '{}'}
                                                    onChange={e => updateMainCta(activeMainCtaTab, 'extra_info_json', e.target.value)}
                                                    className="w-full p-3 text-xs border rounded-md font-mono bg-slate-50 border-emerald-200 outline-none focus:border-emerald-500 transition-colors"
                                                />
                                                <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                                                    <CheckCircle2 size={12} /> Valid JSON
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!productDetail.Main_CTAs || productDetail.Main_CTAs.length === 0) && (
                                    <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <p className="text-xs">Click <button onClick={addMainCta} className="text-blue-500 font-bold inline-flex items-center"><Plus size={12} /> Add</button> to create a CTA.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BLOCK 6: Rules (Extended) */}
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Display Rules</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">User Segment</label>
                                    <select value={displayRule.User_Segment || 'All'} onChange={e => setDisplayRule({ ...displayRule, User_Segment: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
                                        <option value="All">All Users</option>
                                        <option value="New User">New User</option>
                                        <option value="Existing User">Existing User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Priority Order</label>
                                    <input type="number" value={displayRule.Priority || '0'} onChange={e => setDisplayRule({ ...displayRule, Priority: e.target.value })} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="pb-10"></div>
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="w-[450px] bg-slate-800 flex flex-col items-center justify-center relative p-8">
                    <div className="absolute top-4 w-full flex justify-center gap-2 z-20">
                        <button
                            onClick={() => setPreviewScreen('listing')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${previewScreen === 'listing' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >Listing</button>
                        <button
                            onClick={() => setPreviewScreen('detail')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${previewScreen === 'detail' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >Detail</button>
                        <button
                            onClick={() => setPreviewScreen('steps')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${previewScreen === 'steps' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >Steps</button>
                    </div>

                    <div className="w-[320px] h-[650px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-900 relative flex flex-col scale-95 transform-gpu origin-center">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-50"></div>

                        {/* Mobile Content Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-6 pt-10 scrollbar-hide">

                            {/* PREVIEW: LISTING */}
                            {previewScreen === 'listing' && (
                                <div className="flex flex-col h-full bg-slate-50">

                                    {/* Horizontal Navigator */}
                                    <div className="px-2 pb-2 mt-4">
                                        <div className="flex overflow-x-auto gap-2 px-2 pb-2 scrollbar-hide">
                                            {['Tất cả', 'Tài khoản', 'Thẻ tín dụng', 'Vay tiêu dùng', 'Bảo hiểm'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setMobileActiveCategory(tab)}
                                                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${mobileActiveCategory === tab ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 overflow-y-auto">
                                        {/* PREVIEW: Freeze Banner (Listing) */}
                                        {cardUI.Has_Freeze_Banner && (
                                            <div className="bg-blue-600 text-white p-3 rounded-xl mb-4 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <h5 className="text-[10px] font-bold uppercase opacity-80">{productDetail.Freeze_Title || 'Mở tài khoản nhanh'}</h5>
                                                    <p className="text-xs font-medium">{productDetail.Freeze_Subtitle || 'Chỉ 5 phút có ngay tài khoản'}</p>
                                                </div>
                                                <ChevronRight size={16} />
                                            </div>
                                        )}

                                        {/* PREVIEW: Hero Banner (Listing) */}
                                        {cardUI.Has_Hero_Banner && (
                                            <div className="w-full aspect-[21/9] rounded-xl overflow-hidden mb-4 bg-slate-200">
                                                {productDetail.Hero_Banner_URL ? (
                                                    <img src={productDetail.Hero_Banner_URL} className="w-full h-full object-cover" alt="Hero" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-4 text-center">
                                                        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">{productDetail.Hero_Title || 'Chi tiêu trước, trả tiền sau'}</span>
                                                        <span className="text-[8px] text-slate-400">{productDetail.Hero_Subtitle || 'Đăng ký thẻ tín dụng ngay để nhận ưu đãi'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* PREVIEW: Card Block */}
                                        {cardUI.Has_Base_Card && (
                                            <div
                                                className="relative rounded-2xl p-5 shadow-sm border border-black/5 overflow-hidden"
                                                style={{
                                                    backgroundColor: cardUI.Bg_Color || '#ffffff',
                                                    backgroundImage: cardUI.Background_Image_URL ? `url(${cardUI.Background_Image_URL})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    color: cardUI.Text_Color || '#1e293b'
                                                }}
                                            >
                                                {cardUI.Right_Faded_Logo_URL && (
                                                    <img src={cardUI.Right_Faded_Logo_URL} alt="" className="absolute -bottom-4 -right-4 w-32 h-32 object-contain opacity-10 pointer-events-none" />
                                                )}

                                                {cardUI.Badge_Text && (
                                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl z-20">
                                                        {cardUI.Badge_Text}
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-3 mb-4 relative z-10">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-slate-50">
                                                        {cardUI.Logo_URL ? (
                                                            <img src={cardUI.Logo_URL} alt="logo" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        ) : (
                                                            <Building2 size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight" style={{ color: cardUI.Title_Color || 'inherit' }}>{cardUI.Card_Title || 'Tên dịch vụ'}</h3>
                                                        <p className="text-xs mt-0.5" style={{ color: cardUI.Subtitle_Color || cardUI.Text_Color || 'inherit', opacity: cardUI.Subtitle_Color ? 1 : 0.8 }}>{cardUI.Card_Subtitle || 'Tên đối tác'}</p>
                                                    </div>
                                                </div>

                                                {cardUI.Has_Explored_Card && (
                                                    <ul className="space-y-1.5 mb-4 relative z-10">
                                                        {(cardUI.Description || '').split('\n').filter(Boolean).map((benefit, i) => (
                                                            <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: cardUI.Content_Color || cardUI.Text_Color || 'inherit', opacity: cardUI.Content_Color ? 1 : 0.9 }}>
                                                                <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-1.5 opacity-70" />
                                                                <span className="leading-tight">{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <div className="flex justify-end relative z-10">
                                                    <div
                                                        className="bg-white/30 text-[10px] font-bold py-1.5 px-4 rounded-full backdrop-blur-sm shadow-sm border border-white/20"
                                                        style={{ color: cardUI.Text_Color || 'inherit' }}
                                                    >
                                                        {cardUI.CTA_Label_Card || 'Mở thẻ ngay'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center mt-4">
                                        <button
                                            onClick={() => alert("Chức năng 'Xem thêm' đang cập nhật")}
                                            className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                                        >
                                            Xem thêm
                                            <ChevronRight size={14} className="rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PREVIEW: DETAIL */}
                            {previewScreen === 'detail' && (
                                <div className="bg-white min-h-full flex flex-col">
                                    {cardUI.Has_Detail_Block ? (
                                        <>
                                            <div className="w-full h-40 bg-slate-100 relative shrink-0">
                                                {(productDetail.Detail_Header_Image_URL || productDetail.Top_Image_URL) ? (
                                                    <img src={productDetail.Detail_Header_Image_URL || productDetail.Top_Image_URL} alt="Header" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                                                        <span className="text-xs font-medium">Header Image missing</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex-1 overflow-y-auto scrollbar-hide pb-20">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                                                        {cardUI.Logo_URL ? (
                                                            <img src={cardUI.Logo_URL} alt="logo" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Building2 size={24} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h1 className="font-bold text-lg text-slate-900 leading-tight">{productDetail.Detail_Header_Title || cardUI.Card_Title || 'Tên dịch vụ'}</h1>
                                                        <p className="text-sm text-slate-500">{cardUI.Card_Subtitle || 'Đối tác'}</p>
                                                    </div>
                                                </div>

                                                {productDetail.Sub_Contents && productDetail.Sub_Contents.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {productDetail.Sub_Contents.map(sub => (
                                                            <span key={sub.id} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
                                                                {sub.label} <ExternalLink size={10} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 border border-blue-100/50">
                                                    <h3 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-3">Quyền lợi / Tiêu điểm</h3>
                                                    <ul className="space-y-3">
                                                        {(productDetail.Detail_Contents || '').split('\n').filter(Boolean).map((benefit, i) => (
                                                            <li key={i} className="text-xs flex items-start gap-2.5 text-blue-800">
                                                                <div className="w-5 h-5 rounded-full bg-white text-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                                                    <CheckCircle2 size={12} />
                                                                </div>
                                                                <span className="leading-relaxed font-medium">{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 mb-2">Điều kiện & Điều khoản</h3>
                                                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        {productDetail.TnC_Content || 'Chưa có thông tin điều khoản.'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-10">
                                                <button
                                                    onClick={() => setPreviewScreen('steps')}
                                                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
                                                >
                                                    {cardUI.CTA_Label_Card || 'Đăng ký ngay'}
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                <EyeOff size={32} />
                                            </div>
                                            <h4 className="font-bold text-slate-600">Trang chi tiết đã ẩn</h4>
                                            <p className="text-xs mt-2 leading-relaxed">Người dùng sẽ không xem được trang này. Nút "Mở" ở trang chủ sẽ dẫn trực tiếp sang đối tác.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PREVIEW: STEPS */}
                            {previewScreen === 'steps' && (
                                <div className="bg-white min-h-full flex flex-col">
                                    <div className="p-8 flex-1 pt-12">
                                        <div className="text-center mb-10">
                                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                                                <Smartphone size={36} className="text-blue-600 -rotate-3" />
                                            </div>
                                            <h3 className="font-bold text-xl text-slate-900">Mở tài khoản nhanh</h3>
                                            <p className="text-sm text-slate-500 mt-2">Duyệt hồ sơ tức thì chỉ trong 2 bước</p>
                                        </div>

                                        <div className="relative border-l-2 border-slate-100 ml-6 space-y-10 pb-4">
                                            {(productDetail.Guidances && productDetail.Guidances.length > 0
                                                ? productDetail.Guidances
                                                : [{ content: 'Vui lòng thiết lập các bước hướng dẫn (Guidances)...', image_url: '' }]
                                            ).map((step, idx) => (
                                                <div key={idx} className="relative pl-8">
                                                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-blue-600 ring-4 ring-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="font-bold text-sm text-slate-900 mb-1.5 uppercase tracking-wide">Bước {idx + 1}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{step.content}</p>
                                                    {step.image_url && (
                                                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                                            <img src={step.image_url} alt={`Minh họa bước ${idx + 1}`} className="w-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                                        {productDetail.Main_CTAs && productDetail.Main_CTAs.length > 0 ? (
                                            productDetail.Main_CTAs.map(cta => (
                                                <button
                                                    key={cta.id}
                                                    onClick={() => alert(`[CTA ACTION]\n\nType: ${cta.action_type}\nURL: ${cta.primary_url}`)}
                                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${cta.action_type === 'DEEPLINK' || cta.condition === 'CONFIRM_CONDITION'
                                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                        }`}
                                                >
                                                    {cta.name || 'Hành động'}
                                                    {(cta.action_type === 'DEEPLINK' || cta.action_type === 'OPEN_KYC_FLOW') && <ExternalLink size={16} />}
                                                </button>
                                            ))
                                        ) : (
                                            <button
                                                onClick={() => alert(`[CHUYỂN HƯỚNG ĐỐI TÁC]\n\nURL: ${productDetail.ZPI_Link || productDetail.Final_Target_URL}`)}
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                            >
                                                {cardUI.CTA_Label_Card || 'Tiếp tục sang đối tác'}
                                                <ExternalLink size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Navigator */}
                        <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-1 shrink-0 z-50">
                            {[
                                { id: 'Khám phá', icon: Activity },
                                { id: 'Mở thẻ & Vay', icon: Activity, badge: true },
                                { id: 'Ưu đãi', icon: Activity },
                                { id: 'Quản lý', icon: Activity }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setMobileActiveNav(item.id)}
                                    className={`flex flex-col items-center gap-1 transition-colors ${mobileActiveNav === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <div className="relative">
                                        <item.icon size={20} />
                                        {item.badge && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>}
                                    </div>
                                    <span className={`text-[9px] ${mobileActiveNav === item.id ? 'font-bold' : 'font-medium'}`}>{item.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
