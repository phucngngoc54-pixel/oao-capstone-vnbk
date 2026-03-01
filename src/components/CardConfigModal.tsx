import React, { useState, useEffect } from 'react';
import { X, Save, Smartphone, CheckCircle2, ChevronRight, Building2, ArrowLeft, Activity } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'info' | 'visual' | 'benefits' | 'details' | 'rules'>('info');
    const [previewScreen, setPreviewScreen] = useState<'listing' | 'detail' | 'steps'>('listing');

    // Draft States
    const [cardUI, setCardUI] = useState<Partial<CardUIConfig>>({});
    const [productDetail, setProductDetail] = useState<Partial<ProductDetailConfig>>({});
    const [displayRule, setDisplayRule] = useState<Partial<DisplayRules>>({});

    useEffect(() => {
        if (isOpen) {
            if (configId) {
                // Edit Mode
                setCardUI(data.cardUIConfig.find(c => c.Config_ID === configId) || {});
                setProductDetail(data.productDetailConfig.find(d => d.Config_ID === configId) || {});
                setDisplayRule(data.displayRules.find(r => r.Config_ID === configId) || {});
            } else {
                // Create Mode
                const newId = `CFG_NEW_${Math.floor(Math.random() * 10000)}`;
                setCardUI({ Config_ID: newId, Bg_Color: '#ffffff', Text_Color: '#1e293b' });
                setProductDetail({ Config_ID: newId });
                setDisplayRule({ Config_ID: newId, Priority: '10', User_Segment: 'All', Status: 'DRAFT' });
            }
            setActiveTab('info');
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
                Benefit_1: partner.Benefit_1 || cardUI.Benefit_1,
                Benefit_2: partner.Benefit_2 || cardUI.Benefit_2,
                Benefit_3: partner.Benefit_3 || cardUI.Benefit_3,
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
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            {['info', 'visual', 'benefits', 'details', 'rules'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                            {/* TAB: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Config ID</label>
                                            <input
                                                type="text"
                                                value={cardUI.Config_ID || ''}
                                                onChange={e => {
                                                    setCardUI({ ...cardUI, Config_ID: e.target.value });
                                                    setProductDetail({ ...productDetail, Config_ID: e.target.value });
                                                    setDisplayRule({ ...displayRule, Config_ID: e.target.value });
                                                }}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                disabled={!!configId} // Don't allow changing ID after creation
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Partner</label>
                                            <select
                                                value={cardUI.Partner_ID || ''}
                                                onChange={e => handlePartnerChange(e.target.value)}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">Select a partner...</option>
                                                {data.partnerMaster.map(p => (
                                                    <option key={p.Partner_ID} value={p.Partner_ID}>{p.Partner_Name} ({p.Partner_ID})</option>
                                                ))}
                                                <option value="ADD_NEW_PARTNER" className="text-blue-600 font-bold">--- + Add New Partner ---</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Service Group (Phân loại dịch vụ)</label>
                                        <select
                                            value={cardUI.Service_Group || 'Tất cả'}
                                            onChange={e => setCardUI({ ...cardUI, Service_Group: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Tất cả">Tất cả</option>
                                            <option value="Tài khoản">Tài khoản</option>
                                            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                            <option value="Vay tiêu dùng">Vay tiêu dùng</option>
                                            <option value="Bảo hiểm">Bảo hiểm</option>
                                            <option value="Tiện ích mở rộng">Tiện ích mở rộng</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Card Title</label>
                                        <input
                                            type="text"
                                            value={cardUI.Card_Title || ''}
                                            onChange={e => setCardUI({ ...cardUI, Card_Title: e.target.value })}
                                            placeholder="e.g. Vay tiêu dùng trực tuyến"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Card Subtitle</label>
                                        <input
                                            type="text"
                                            value={cardUI.Card_Subtitle || ''}
                                            onChange={e => setCardUI({ ...cardUI, Card_Subtitle: e.target.value })}
                                            placeholder="e.g. Cathay United Bank"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Badge Text (Optional)</label>
                                        <input
                                            type="text"
                                            value={cardUI.Badge_Text || ''}
                                            onChange={e => setCardUI({ ...cardUI, Badge_Text: e.target.value })}
                                            placeholder="e.g. HOT, ƯU ĐÃI"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: VISUAL */}
                            {activeTab === 'visual' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL</label>
                                        <input
                                            type="text"
                                            value={cardUI.Logo_URL || ''}
                                            onChange={e => setCardUI({ ...cardUI, Logo_URL: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                                        />
                                        {cardUI.Logo_URL && (
                                            <div className="w-16 h-16 border rounded-lg bg-white p-2 shadow-sm flex items-center justify-center">
                                                <img src={cardUI.Logo_URL} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Background Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={cardUI.Bg_Color || '#ffffff'}
                                                    onChange={e => setCardUI({ ...cardUI, Bg_Color: e.target.value })}
                                                    className="h-10 w-12 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={cardUI.Bg_Color || ''}
                                                    onChange={e => setCardUI({ ...cardUI, Bg_Color: e.target.value })}
                                                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Text Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={cardUI.Text_Color || '#000000'}
                                                    onChange={e => setCardUI({ ...cardUI, Text_Color: e.target.value })}
                                                    className="h-10 w-12 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={cardUI.Text_Color || ''}
                                                    onChange={e => setCardUI({ ...cardUI, Text_Color: e.target.value })}
                                                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: BENEFITS */}
                            {activeTab === 'benefits' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-4">
                                        <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                                            <CheckCircle2 size={16} /> Key Benefits (Bullet Points)
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 mb-1">Benefit 1</label>
                                            <input
                                                type="text"
                                                value={cardUI.Benefit_1 || ''}
                                                onChange={e => setCardUI({ ...cardUI, Benefit_1: e.target.value })}
                                                className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 mb-1">Benefit 2</label>
                                            <input
                                                type="text"
                                                value={cardUI.Benefit_2 || ''}
                                                onChange={e => setCardUI({ ...cardUI, Benefit_2: e.target.value })}
                                                className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 mb-1">Benefit 3</label>
                                            <input
                                                type="text"
                                                value={cardUI.Benefit_3 || ''}
                                                onChange={e => setCardUI({ ...cardUI, Benefit_3: e.target.value })}
                                                className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Card Button Label</label>
                                        <input
                                            type="text"
                                            value={cardUI.CTA_Label_Card || ''}
                                            onChange={e => setCardUI({ ...cardUI, CTA_Label_Card: e.target.value })}
                                            placeholder="e.g. Đăng ký"
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: DETAILS */}
                            {activeTab === 'details' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Hero Banner URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={productDetail.Hero_Banner_URL || ''}
                                            onChange={e => setProductDetail({ ...productDetail, Hero_Banner_URL: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Terms & Conditions</label>
                                        <textarea
                                            value={productDetail.TnC_Content || ''}
                                            onChange={e => setProductDetail({ ...productDetail, TnC_Content: e.target.value })}
                                            rows={4}
                                            placeholder="Markdown supported..."
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Step 1 Description</label>
                                            <input
                                                type="text"
                                                value={productDetail.Step_1_Desc || ''}
                                                onChange={e => setProductDetail({ ...productDetail, Step_1_Desc: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Step 2 Description</label>
                                            <input
                                                type="text"
                                                value={productDetail.Step_2_Desc || ''}
                                                onChange={e => setProductDetail({ ...productDetail, Step_2_Desc: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* FAQs Section */}
                                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mt-6 space-y-4">
                                        <h3 className="font-bold text-slate-800 text-sm">FAQs (Giải đáp thắc mắc - Tùy chọn)</h3>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-700">FAQ 1</label>
                                            <input type="text" value={productDetail.FAQ_1_Q || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_1_Q: e.target.value })} placeholder="Câu hỏi 1..." className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none" />
                                            <textarea value={productDetail.FAQ_1_A || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_1_A: e.target.value })} placeholder="Trả lời 1..." rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none resize-none" />
                                        </div>

                                        <div className="space-y-2 border-t border-slate-200 pt-4">
                                            <label className="block text-xs font-bold text-slate-700">FAQ 2</label>
                                            <input type="text" value={productDetail.FAQ_2_Q || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_2_Q: e.target.value })} placeholder="Câu hỏi 2..." className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none" />
                                            <textarea value={productDetail.FAQ_2_A || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_2_A: e.target.value })} placeholder="Trả lời 2..." rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none resize-none" />
                                        </div>

                                        <div className="space-y-2 border-t border-slate-200 pt-4">
                                            <label className="block text-xs font-bold text-slate-700">FAQ 3</label>
                                            <input type="text" value={productDetail.FAQ_3_Q || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_3_Q: e.target.value })} placeholder="Câu hỏi 3..." className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none" />
                                            <textarea value={productDetail.FAQ_3_A || ''} onChange={e => setProductDetail({ ...productDetail, FAQ_3_A: e.target.value })} placeholder="Trả lời 3..." rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-sm outline-none resize-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Action Type</label>
                                            <select
                                                value={productDetail.CTA_Action_Type || ''}
                                                onChange={e => setProductDetail({ ...productDetail, CTA_Action_Type: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="REDIRECT_WEB">Redirect to Website</option>
                                                <option value="DEEPLINK_APP">Deep Link to App</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Target Action URL</label>
                                            <input
                                                type="text"
                                                value={productDetail.Final_Target_URL || ''}
                                                onChange={e => setProductDetail({ ...productDetail, Final_Target_URL: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: RULES */}
                            {activeTab === 'rules' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">Target Audience</h3>
                                            <p className="text-xs text-slate-500 mt-1">Configure who sees this card and when it's active.</p>
                                        </div>
                                        {displayRule.Status === 'ACTIVE' && (
                                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold rounded-full">ACTIVE</span>
                                        )}
                                        {(displayRule.Status === 'DRAFT' || !displayRule.Status) && (
                                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-bold rounded-full">DRAFT</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">User Segment</label>
                                            <select
                                                value={displayRule.User_Segment || 'All'}
                                                onChange={e => setDisplayRule({ ...displayRule, User_Segment: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="All">All Users</option>
                                                <option value="New User">New User</option>
                                                <option value="Existing User">Existing User</option>
                                                <option value="VIP">VIP</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Priority Order (Higher = Top)</label>
                                            <input
                                                type="number"
                                                value={displayRule.Priority || '0'}
                                                onChange={e => setDisplayRule({ ...displayRule, Priority: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Start Date (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={displayRule.Start_Date || ''}
                                                onChange={e => setDisplayRule({ ...displayRule, Start_Date: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">End Date (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={displayRule.End_Date || ''}
                                                onChange={e => setDisplayRule({ ...displayRule, End_Date: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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

                                        {/* Top Banner Box */}
                                        <div className="px-4 py-2">
                                            <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden relative">
                                                <div className="font-bold">Mở tài khoản trong 5 phút</div>
                                                <img src="/logos/zalo_logo.svg" className="absolute -right-4 -bottom-4 w-20 h-20 opacity-20" alt="bg" />
                                            </div>
                                        </div>

                                        {/* Horizontal Navigator */}
                                        <div className="px-2 pb-2">
                                            <div className="flex overflow-x-auto gap-2 px-2 pb-2 scrollbar-hide">
                                                {['Tất cả', 'Tài khoản', 'Thẻ tín dụng', 'Vay tiêu dùng', 'Bảo hiểm'].map(tab => (
                                                    <div key={tab} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border ${tab === (cardUI.Service_Group || 'Tất cả') ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                        {tab}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 overflow-y-auto">
                                            <div
                                                className="relative rounded-2xl p-5 shadow-sm border border-black/5"
                                                style={{ backgroundColor: cardUI.Bg_Color || '#ffffff', color: cardUI.Text_Color || '#1e293b' }}
                                            >
                                                {cardUI.Badge_Text && (
                                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl">
                                                        {cardUI.Badge_Text}
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                                        {cardUI.Logo_URL ? (
                                                            <img src={cardUI.Logo_URL} alt="logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        ) : (
                                                            <Building2 size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight">{cardUI.Card_Title || 'Card Title'}</h3>
                                                        <p className="text-xs opacity-80 mt-0.5">{cardUI.Card_Subtitle || 'Subtitle'}</p>
                                                    </div>
                                                </div>

                                                <ul className="space-y-1.5 mb-4">
                                                    {[cardUI.Benefit_1, cardUI.Benefit_2, cardUI.Benefit_3].filter(Boolean).map((benefit, i) => (
                                                        <li key={i} className="text-xs flex items-start gap-1.5 opacity-90">
                                                            <CheckCircle2 size={14} className="shrink-0 mt-0.5 opacity-70" />
                                                            <span className="leading-tight">{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className="flex justify-end">
                                                    <div
                                                        className="bg-white/20 text-xs font-bold py-1.5 px-4 rounded-full backdrop-blur-sm"
                                                        style={{ color: cardUI.Text_Color || 'inherit' }}
                                                    >
                                                        {cardUI.CTA_Label_Card || 'Xem chi tiết'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-center mt-4">
                                                <button className="text-blue-600 text-xs font-medium flex items-center gap-1">
                                                    Xem thêm
                                                    <ChevronRight size={14} className="rotate-90" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bottom Navigator */}
                                        <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-1 shrink-0">
                                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                                <Activity size={20} />
                                                <span className="text-[9px] font-medium">Khám phá</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-blue-600">
                                                <div className="relative">
                                                    <Activity size={20} />
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                                                </div>
                                                <span className="text-[9px] font-bold">Mở thẻ & Vay</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                                <Activity size={20} />
                                                <span className="text-[9px] font-medium">Ưu đãi</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-slate-400">
                                                <Activity size={20} />
                                                <span className="text-[9px] font-medium">Quản lý</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PREVIEW: DETAIL */}
                                {previewScreen === 'detail' && (
                                    <div className="bg-white min-h-full flex flex-col">
                                        <div className="w-full h-40 bg-slate-100 relative">
                                            {productDetail.Hero_Banner_URL ? (
                                                <img src={productDetail.Hero_Banner_URL} alt="Hero" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200" style={{ backgroundColor: cardUI.Bg_Color }}>
                                                    <span className="text-sm font-medium" style={{ color: cardUI.Text_Color }}>Hero Banner Placeholder</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {cardUI.Logo_URL ? (
                                                        <img src={cardUI.Logo_URL} alt="logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={24} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h1 className="font-bold text-lg text-slate-900 leading-tight">{cardUI.Card_Title || 'Title'}</h1>
                                                    <p className="text-sm text-slate-500">{cardUI.Card_Subtitle || 'Subtitle'}</p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                                                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">Đặc quyền nổi bật</h3>
                                                <ul className="space-y-2">
                                                    {[cardUI.Benefit_1, cardUI.Benefit_2, cardUI.Benefit_3].filter(Boolean).map((benefit, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-2 text-blue-800">
                                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-blue-500" />
                                                            <span>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 mb-2">Điều khoản & Điều kiện</h3>
                                                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    {productDetail.TnC_Content || 'Chưa có thông tin điều khoản.'}
                                                </div>
                                            </div>

                                            {/* FAQs */}
                                            {(productDetail.FAQ_1_Q || productDetail.FAQ_2_Q || productDetail.FAQ_3_Q) && (
                                                <div className="mt-6">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-2">Giải đáp thắc mắc</h3>
                                                    <div className="space-y-2">
                                                        {[1, 2, 3].map(num => {
                                                            const q = productDetail[`FAQ_${num}_Q` as keyof ProductDetailConfig];
                                                            const a = productDetail[`FAQ_${num}_A` as keyof ProductDetailConfig];
                                                            if (!q) return null;
                                                            return (
                                                                <div key={num} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                    <div className="font-bold text-xs text-slate-800 mb-1">{q}</div>
                                                                    <div className="text-xs text-slate-600">{a}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Có thể bạn quan tâm */}
                                            <div className="mt-8 border-t border-slate-100 pt-6 px-1">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3">Có thể bạn quan tâm</h3>
                                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                                    {data?.cardUIConfig.slice(0, 3).map((item, idx) => (
                                                        <div key={idx} className="shrink-0 w-36 border border-slate-200 rounded-xl p-3 flex flex-col items-center bg-white shadow-sm">
                                                            <div className="w-10 h-10 rounded-full shadow-sm mb-2 overflow-hidden border border-slate-100">
                                                                {item.Logo_URL ? <img src={item.Logo_URL} className="w-full h-full object-cover" /> : <Building2 size={24} className="text-slate-300 m-auto mt-2" />}
                                                            </div>
                                                            <div className="text-xs font-bold text-center line-clamp-2 leading-tight">{item.Card_Title}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100 z-10">
                                            <button
                                                onClick={() => setPreviewScreen('steps')}
                                                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                                                style={{ backgroundColor: cardUI.Bg_Color || '#2563eb', color: cardUI.Text_Color || 'white' }}
                                            >
                                                {cardUI.CTA_Label_Card || 'Đăng ký ngay'}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* PREVIEW: STEPS */}
                                {previewScreen === 'steps' && (
                                    <div className="bg-white min-h-full flex flex-col">
                                        <div className="p-6 flex-1 pt-8">
                                            <div className="text-center mb-8">
                                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Smartphone size={28} className="text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-900">Chỉ 2 bước đơn giản</h3>
                                                <p className="text-sm text-slate-500 mt-1">Hoàn thành hồ sơ trong 5 phút</p>
                                            </div>

                                            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                                                <div className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white"></div>
                                                    <h4 className="font-bold text-sm text-slate-900 mb-1">Bước 1</h4>
                                                    <p className="text-sm text-slate-600">{productDetail.Step_1_Desc || '...'}</p>
                                                </div>
                                                <div className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white"></div>
                                                    <h4 className="font-bold text-sm text-slate-900 mb-1">Bước 2</h4>
                                                    <p className="text-sm text-slate-600">{productDetail.Step_2_Desc || '...'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 mt-auto border-t border-slate-100">
                                            <div className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 flex items-center justify-center gap-2">
                                                Tiếp tục sang đối tác
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
