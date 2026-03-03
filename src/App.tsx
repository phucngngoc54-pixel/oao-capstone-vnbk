import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  LayoutDashboard,
  Settings2,
  Activity,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Building2,
  Search,
  Filter,
  X
} from 'lucide-react';

import {
  PartnerMaster,
  CardUIConfig,
  ProductDetailConfig,
  DisplayRules,
  ParsedData
} from './types';
import CardConfigModal from './components/CardConfigModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const PARTNER_MASTER_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRu49yPLpD0mYpHNBG8LOG3q-HuHyqoBT4T8Xyy2kKpX48z58eS4ZMIwOFYZW8rgBjO5-8Xg4yjkyUb/pub?gid=0&single=true&output=csv';
const CARD_UI_CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRu49yPLpD0mYpHNBG8LOG3q-HuHyqoBT4T8Xyy2kKpX48z58eS4ZMIwOFYZW8rgBjO5-8Xg4yjkyUb/pub?gid=1227981483&single=true&output=csv';
const PRODUCT_DETAIL_CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRu49yPLpD0mYpHNBG8LOG3q-HuHyqoBT4T8Xyy2kKpX48z58eS4ZMIwOFYZW8rgBjO5-8Xg4yjkyUb/pub?gid=1182916111&single=true&output=csv';
const DISPLAY_RULES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRu49yPLpD0mYpHNBG8LOG3q-HuHyqoBT4T8Xyy2kKpX48z58eS4ZMIwOFYZW8rgBjO5-8Xg4yjkyUb/pub?gid=2054737724&single=true&output=csv';

// --- Fallback Data ---
const FALLBACK_DATA: ParsedData = {
  partnerMaster: [
    {
      Partner_ID: 'PARTNER_CATHAY',
      Partner_Name: 'Cathay United Bank',
      Bank_Code: 'CATHAY',
      Category: 'BANK',
      Status: 'ACTIVE',
      Logo_URL: 'https://img.vietcetera.com/uploads/images/22-aug-2022/logo-cathay-1661159930776.jpg',
      Bg_Color: '#E8F5E9',
      Text_Color: '#1B5E20',
      Card_Title: 'Vay tiêu dùng Cathay',
      Card_Subtitle: 'Lãi suất từ 0.8%/tháng',
      Benefit_1: 'Giải ngân trong 24h',
      Benefit_2: 'Không gọi thân nhân',
      Benefit_3: 'Hạn mức lên đến 500tr'
    },
    {
      Partner_ID: 'PARTNER_CAKE',
      Partner_Name: 'CAKE by VPBank',
      Bank_Code: 'CAKE',
      Category: 'BANK',
      Status: 'ACTIVE',
      Logo_URL: 'https://atpsoftware.vn/wp-content/uploads/2021/04/ung-dung-ngan-hang-so-cake-la-gi.png',
      Bg_Color: '#FFF9C4',
      Text_Color: '#F57F17',
      Card_Title: 'Thẻ tín dụng Cake',
      Card_Subtitle: 'Mở thẻ 2 phút có dùng ngay',
      Benefit_1: 'Hoàn tiền 20% Shopee',
      Benefit_2: 'Miễn phí thường niên',
      Benefit_3: 'Tặng voucher 500k'
    }
  ],
  cardUIConfig: [
    {
      Config_ID: 'CFG_CATHAY_001',
      Partner_ID: 'PARTNER_CATHAY',
      Card_Title: 'Vay tiêu dùng',
      Card_Subtitle: 'Lãi suất ưu đãi',
      Logo_URL: 'https://img.vietcetera.com/uploads/images/22-aug-2022/logo-cathay-1661159930776.jpg',
      Badge_Text: 'HOT',
      Bg_Color: '#E8F5E9',
      Text_Color: '#1B5E20',
      Description: 'Giải ngân nhanh\nKhông phí hồ sơ\nHạn mức cao',
      CTA_Label_Card: 'Đăng ký',
      Has_Base_Card: true,
      Has_Explored_Card: true,
      Has_Freeze_Banner: false,
      Has_Hero_Banner: false,
      Has_Detail_Block: true
    }
  ],
  productDetailConfig: [
    {
      Config_ID: 'CFG_CATHAY_001',
      Hero_Banner_URL: '',
      TnC_Content: 'CCCD required. Age 20-60.',
      Step_1_Desc: 'Register via app',
      Step_2_Desc: 'Wait for approval',
      CTA_Action_Type: 'LINK',
      Final_Target_URL: 'https://zalo.me'
    }
  ],
  displayRules: [
    { Rule_ID: 'R_001', Config_ID: 'CFG_CATHAY_001', User_Segment: 'All', Min_Age: '20', Location: 'VN', Priority: '10' }
  ]
};

export default function App() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App State
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  // Navigation State
  const [activeView, setActiveView] = useState<'configs' | 'analytics' | 'partners'>('configs');
  // Dashboard Filters & Sort
  const [userSegment, setUserSegment] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'Config_ID' | 'Priority'>('Priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Mobile Preview State
  const [mobileScreen, setMobileScreen] = useState<'listing' | 'detail' | 'steps'>('listing');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mobileActiveCategory, setMobileActiveCategory] = useState('Tất cả');
  const [mobileActiveNav, setMobileActiveNav] = useState('Mở thẻ & Vay');
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const fetchData = async () => {
      console.log('CSV Loader: Starting fetches...');
      try {
        const fetchCSV = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Fetch failed for ${url}`);
          const text = await res.text();
          const parsed = Papa.parse<any>(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim()
          });
          return parsed.data.map((row: any) => {
            const cleanRow: any = {};
            for (const key in row) {
              if (row.hasOwnProperty(key)) {
                cleanRow[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
              }
            }
            return cleanRow;
          }).filter((row: any) => Object.keys(row).some(k => row[k]));
        };

        const [rawPartnerMaster, cardUIConfig, productDetailConfig, displayRules] = await Promise.all([
          fetchCSV(PARTNER_MASTER_URL),
          fetchCSV(CARD_UI_CONFIG_URL),
          fetchCSV(PRODUCT_DETAIL_CONFIG_URL),
          fetchCSV(DISPLAY_RULES_URL)
        ]);

        const partnerMaster = rawPartnerMaster.length > 0 && typeof rawPartnerMaster[0].Partner_ID !== 'undefined'
          ? rawPartnerMaster
          : FALLBACK_DATA.partnerMaster;

        console.log(`CSV Loader: Final Counts - PM: ${partnerMaster.length} (raw: ${rawPartnerMaster.length}), CUI: ${cardUIConfig.length}, PDC: ${productDetailConfig.length}, DR: ${displayRules.length}`);

        if (cardUIConfig.length === 0) {
          throw new Error('No configuration data found in CSV sections');
        }

        setData({
          partnerMaster,
          cardUIConfig,
          productDetailConfig,
          displayRules
        });
        setLoading(false);
      } catch (err: any) {
        console.warn('CSV Loader: Error encountered, using Fallback Data.', err.message);
        setData(FALLBACK_DATA);
        setError(null); // Clear error since we have fallback
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Derived Data for Dashboard ---
  const dashboardRows = useMemo(() => {
    if (!data) return [];
    let rows = data.cardUIConfig.map(config => {
      const partner = data.partnerMaster.find(p => p.Partner_ID === config.Partner_ID);
      const rule = data.displayRules.find(r => r.Config_ID === config.Config_ID);
      return {
        ...config,
        Partner_Name: partner?.Partner_Name || 'Unknown',
        Status: partner?.Status || (partner ? 'INACTIVE' : 'ACTIVE'),
        Priority: rule?.Priority || '0',
        User_Segment: rule?.User_Segment || 'All'
      };
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        r.Config_ID.toLowerCase().includes(term) ||
        r.Partner_Name.toLowerCase().includes(term) ||
        r.Card_Title.toLowerCase().includes(term)
      );
    }

    rows.sort((a, b) => {
      if (sortField === 'Priority') {
        const diff = parseInt(a.Priority, 10) - parseInt(b.Priority, 10); // Priority 1 is highest
        return sortOrder === 'desc' ? -diff : diff;
      }
      const diff = a.Config_ID.localeCompare(b.Config_ID);
      return sortOrder === 'asc' ? diff : -diff;
    });

    return rows;
  }, [data, searchTerm, sortField, sortOrder]);

  // --- Derived Data for Mobile Preview ---
  const mobileCards = useMemo(() => {
    if (!data) return [];

    // 1. Filter by Active Status in Partner Master
    const activePartners = new Set(
      data.partnerMaster
        .filter(p => !p.Status || p.Status.toUpperCase() === 'ACTIVE')
        .map(p => p.Partner_ID)
    );

    let cards = data.cardUIConfig.filter(c => activePartners.has(c.Partner_ID));

    // 2. Filter by User Segment (Rule Matching)
    cards = cards.filter(c => {
      // If segment is "All", show everything active
      if (userSegment === 'All') return true;

      const rules = data.displayRules.filter(r => r.Config_ID === c.Config_ID);
      if (rules.length === 0) return true; // Show if no rules
      return rules.some(r => r.User_Segment === 'All' || r.User_Segment === userSegment);
    });

    // 2.5 Filter by Category (Mobile Preview Tabs)
    if (mobileActiveCategory !== 'Tất cả') {
      cards = cards.filter(c => c.Service_Group === mobileActiveCategory);
    }

    // 3. Sort by Priority (Low number = High priority, e.g., 1 is top)
    cards.sort((a, b) => {
      const ruleA = data.displayRules.find(r => r.Config_ID === a.Config_ID);
      const ruleB = data.displayRules.find(r => r.Config_ID === b.Config_ID);
      const prioA = parseInt(ruleA?.Priority || '999', 10);
      const prioB = parseInt(ruleB?.Priority || '999', 10);
      return prioA - prioB;
    });

    return cards;
  }, [data, userSegment, mobileActiveCategory]);

  const handlePreviewClick = (configId: string) => {
    console.log('UI: Selecting config for preview:', configId);
    setSelectedConfigId(configId);
    setMobileScreen('listing');
    setActiveCardId(null);
  };

  const handleCardClick = (configId: string) => {
    console.log('UI: Navigating to card details:', configId);
    setActiveCardId(configId);
    setMobileScreen('detail');
  };

  const openCreateModal = () => {
    setEditingConfigId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (configId: string) => {
    setEditingConfigId(configId);
    setIsModalOpen(true);
  };

  const handleSaveConfig = (cardUI: CardUIConfig, detail: ProductDetailConfig, rule: DisplayRules) => {
    console.log('UI: Saving configuration', cardUI.Config_ID);
    if (!data) return;

    // Deep clone data to trigger reliable re-renders
    const newData = { ...data };

    // Update or Insert
    const uiIndex = newData.cardUIConfig.findIndex(c => c.Config_ID === cardUI.Config_ID);
    if (uiIndex >= 0) newData.cardUIConfig[uiIndex] = cardUI;
    else newData.cardUIConfig.push(cardUI);

    const detailIndex = newData.productDetailConfig.findIndex(d => d.Config_ID === detail.Config_ID);
    if (detailIndex >= 0) newData.productDetailConfig[detailIndex] = detail;
    else newData.productDetailConfig.push(detail);

    const ruleIndex = newData.displayRules.findIndex(r => r.Config_ID === rule.Config_ID);
    if (ruleIndex >= 0) newData.displayRules[ruleIndex] = rule;
    else newData.displayRules.push(rule);

    setData(newData);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zalo-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-red-600">
        Error loading configuration: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* --- Left Sidebar --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <img src="/logos/zalopay_logo.png" alt="ZaloPay" className="h-8 object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveView('configs'); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium ${activeView === 'configs' ? 'bg-zalo-primary/10 text-zalo-primary' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Configurations
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveView('analytics'); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium ${activeView === 'analytics' ? 'bg-zalo-primary/10 text-zalo-primary' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Activity size={20} />
            Activity & Analytics
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveView('partners'); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium ${activeView === 'partners' ? 'bg-zalo-primary/10 text-zalo-primary' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Building2 size={20} />
            Partner Configuration
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
            <Settings2 size={20} />
            OAO Decision
          </a>
        </nav>
        <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
          ZaloPay Internal Tool
        </div>
      </aside>

      {/* --- Main Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'configs' ? (
          <>
            <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">ZaloPay Affiliate Finance Cards</h1>
                <p className="text-slate-500 text-sm mt-1">Manage OAO Hub configurations and display rules.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setUserSegment('All')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userSegment === 'All' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setUserSegment('New User')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userSegment === 'New User' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    New User
                  </button>
                  <button
                    onClick={() => setUserSegment('Existing User')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userSegment === 'Existing User' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Existing User
                  </button>
                </div>
                <button
                  onClick={openCreateModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  + Add New Card
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search configurations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                      <th
                        className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                          if (sortField === 'Config_ID') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortField('Config_ID'); setSortOrder('asc'); }
                        }}
                      >Config ID {sortField === 'Config_ID' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="px-6 py-4 font-medium">Partner Name</th>
                      <th className="px-6 py-4 font-medium">Card Title</th>
                      <th
                        className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                          if (sortField === 'Priority') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortField('Priority'); setSortOrder('desc'); }
                        }}
                      >Priority {sortField === 'Priority' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dashboardRows.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handlePreviewClick(row.Config_ID)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedConfigId === row.Config_ID ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {row.Config_ID}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                          <Building2 size={16} className="text-slate-400" />
                          {row.Partner_Name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {row.Card_Title}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                            {row.Priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.Status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                            {row.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(row.Config_ID); }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePreviewClick(row.Config_ID); }}
                            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 inline-flex"
                          >
                            <Smartphone size={16} />
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dashboardRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No configurations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                <p>Total Cards Loaded: <span className="font-bold text-slate-600">{data?.cardUIConfig.length || 0}</span></p>
                <p>Active Logic: <span className="font-bold text-slate-600">{userSegment}</span></p>
              </div>
            </div>
          </>
        ) : activeView === 'analytics' ? (
          <AnalyticsDashboard data={data} />
        ) : activeView === 'partners' ? (
          <PartnerManager data={data} onUpdateData={(newData) => setData(newData)} />
        ) : null}
      </main>

      {/* --- Preview Area (Mobile Phone Frame) --- */}
      <aside className="w-[400px] bg-slate-800 border-l border-slate-700 flex flex-col items-center justify-center p-8 relative shadow-2xl z-10">
        <div className="absolute top-4 left-4 text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live Preview
        </div>

        {/* Phone Frame */}
        <div className="w-[320px] h-[650px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-900 relative flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-50"></div>

          {/* Status Bar */}
          <div className="h-12 bg-white w-full flex justify-between items-end px-6 pb-2 text-[10px] font-medium text-slate-800 z-40">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-2.5 bg-slate-800 rounded-sm"></div>
              <div className="w-3 h-2.5 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-2.5 border border-slate-800 rounded-sm relative">
                <div className="absolute inset-0.5 bg-slate-800 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Mobile Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-6 scrollbar-hide">

            {/* SCREEN 1: LISTING PAGE */}
            {mobileScreen === 'listing' && (
              <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Horizontal Navigator */}
                <div className="px-2 pb-2 mt-4">
                  <div className="flex overflow-x-auto gap-2 px-2 pb-2 scrollbar-hide">
                    {['Tất cả', 'Tài khoản', 'Thẻ tín dụng', 'Vay tiêu dùng', 'Bảo hiểm'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => { setMobileActiveCategory(tab); setVisibleCount(2); }}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${mobileActiveCategory === tab ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4 pt-1">
                  <div className="flex justify-between items-end mb-1 px-1">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">Mở thẻ & Vay</h2>
                      <p className="text-[10px] text-slate-500">Ưu đãi dành riêng cho bạn</p>
                    </div>
                  </div>

                  {mobileCards.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      Không có thẻ nào phù hợp với danh mục này.
                    </div>
                  ) : (
                    mobileCards.slice(0, visibleCount).map((card) => {
                      const detail = data.productDetailConfig.find(d => d.Config_ID === card.Config_ID);
                      return (
                        <div key={card.Config_ID} className="space-y-4">
                          {/* PREVIEW: Freeze Banner (Listing) */}
                          {card.Has_Freeze_Banner && (
                            <div className="bg-blue-600 text-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                              <div>
                                <h5 className="text-[10px] font-bold uppercase opacity-80">{detail?.Freeze_Title || 'Mở tài khoản nhanh'}</h5>
                                <p className="text-xs font-medium">{detail?.Freeze_Subtitle || 'Chỉ 5 phút có ngay tài khoản'}</p>
                              </div>
                              <ChevronRight size={16} />
                            </div>
                          )}

                          {/* PREVIEW: Hero Banner (Listing) */}
                          {card.Has_Hero_Banner && (
                            <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-slate-200">
                              {detail?.Hero_Banner_URL ? (
                                <img src={detail.Hero_Banner_URL} className="w-full h-full object-cover" alt="Hero" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-4 text-center">
                                  <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">{detail?.Hero_Title || 'Chi tiêu trước, trả tiền sau'}</span>
                                  <span className="text-[8px] text-slate-400">{detail?.Hero_Subtitle || 'Đăng ký thẻ tín dụng ngay để nhận ưu đãi'}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* PREVIEW: Card Block */}
                          {card.Has_Base_Card && (
                            <div
                              onClick={() => handleCardClick(card.Config_ID)}
                              className={`relative rounded-2xl p-5 cursor-pointer transition-transform active:scale-95 shadow-sm border border-black/5 overflow-hidden ${selectedConfigId === card.Config_ID ? 'ring-2 ring-zalo-primary ring-offset-2' : ''}`}
                              style={{
                                backgroundColor: card.Bg_Color || '#ffffff',
                                backgroundImage: card.Background_Image_URL ? `url(${card.Background_Image_URL})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: card.Text_Color || '#1e293b'
                              }}
                            >
                              {card.Right_Faded_Logo_URL && (
                                <img src={card.Right_Faded_Logo_URL} alt="" className="absolute -bottom-4 -right-4 w-32 h-32 object-contain opacity-10 pointer-events-none" />
                              )}

                              {card.Badge_Text && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl z-20">
                                  {card.Badge_Text}
                                </div>
                              )}

                              <div className="flex items-start gap-3 mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-slate-50">
                                  {card.Logo_URL ? (
                                    <img src={card.Logo_URL} alt="logo" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                  ) : (
                                    <Building2 size={20} className="text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm leading-tight" style={{ color: card.Title_Color || 'inherit' }}>{card.Card_Title}</h3>
                                  <p className="text-xs mt-0.5" style={{ color: card.Subtitle_Color || card.Text_Color || 'inherit', opacity: card.Subtitle_Color ? 1 : 0.8 }}>{card.Card_Subtitle}</p>
                                </div>
                              </div>

                              {card.Has_Explored_Card && (
                                <ul className="space-y-1.5 mb-4 relative z-10">
                                  {(card.Description || '').split('\n').filter(Boolean).map((benefit, i) => (
                                    <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: card.Content_Color || card.Text_Color || 'inherit', opacity: card.Content_Color ? 1 : 0.9 }}>
                                      <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-1.5 opacity-70" />
                                      <span className="leading-tight">{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="flex justify-end relative z-10">
                                <div
                                  className="bg-white/30 text-[10px] font-bold py-1.5 px-4 rounded-full backdrop-blur-sm shadow-sm border border-white/20"
                                  style={{ color: card.Text_Color || 'inherit' }}
                                >
                                  {card.CTA_Label_Card || 'Mở ngay'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {visibleCount < mobileCards.length && (
                    <div className="flex justify-center mt-6 pb-4">
                      <button
                        onClick={() => setVisibleCount(mobileCards.length)}
                        className="text-blue-600 text-xs font-medium flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        Xem thêm
                        <ChevronRight size={14} className="rotate-90" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Navigator */}
                <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-1 shrink-0">
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
            )}

            {/* SCREEN 2: PRODUCT DETAIL */}
            {mobileScreen === 'detail' && activeCardId && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300 bg-white min-h-full flex flex-col">
                {(() => {
                  const card = data.cardUIConfig.find(c => c.Config_ID === activeCardId);
                  const detail = data.productDetailConfig.find(d => d.Config_ID === activeCardId);

                  if (!card || !detail) return <div className="p-4 text-center text-sm">Config not found</div>;

                  return (
                    <>
                      {/* Header */}
                      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                        <button onClick={() => setMobileScreen('listing')} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                          <ArrowLeft size={20} className="text-slate-700" />
                        </button>
                        <h2 className="font-bold text-slate-900 text-sm truncate">{card.Card_Title}</h2>
                      </div>

                      {/* Hero Banner / Header Image */}
                      <div className="w-full h-40 bg-slate-100 relative">
                        {detail.Detail_Header_Image_URL || detail.Top_Image_URL ? (
                          <img src={detail.Detail_Header_Image_URL || detail.Top_Image_URL} alt="Header" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200" style={{ backgroundColor: card.Bg_Color, backgroundImage: card.Background_Image_URL ? `url(${card.Background_Image_URL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <span className="text-sm font-medium z-10 p-2 bg-white/50 rounded" style={{ color: card.Text_Color }}>Header Image Placeholder</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {card.Logo_URL ? (
                              <img src={card.Logo_URL} alt="logo" className="w-full h-full object-contain p-1" />
                            ) : (
                              <Building2 size={24} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h1 className="font-bold text-lg text-slate-900 leading-tight">{detail.Detail_Header_Title || card.Card_Title}</h1>
                            <p className="text-sm text-slate-500">{card.Card_Subtitle}</p>
                          </div>
                        </div>

                        {detail.Sub_Contents && detail.Sub_Contents.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {detail.Sub_Contents.map(sub => (
                              <span key={sub.id} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
                                {sub.label} <ExternalLink size={10} />
                              </span>
                            ))}
                          </div>
                        )}

                        {card.Has_Detail_Block ? (
                          <div className="bg-zalo-primary/10 rounded-xl p-4 mb-6 border border-zalo-primary/20">
                            <h3 className="text-xs font-bold text-zalo-dark uppercase tracking-wider mb-3">Quyền lợi / Tiêu điểm</h3>
                            <ul className="space-y-2">
                              {(detail.Detail_Contents || '').split('\n').filter(Boolean).map((benefit, i) => (
                                <li key={i} className="text-sm flex items-start gap-2 text-zalo-primary">
                                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-zalo-primary/80" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                              {!(detail.Detail_Contents) && [card.Benefit_1, card.Benefit_2, card.Benefit_3].filter(Boolean).map((benefit, i) => (
                                <li key={i} className="text-sm flex items-start gap-2 text-zalo-primary">
                                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-zalo-primary/80" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-xl mb-6 text-center border-2 border-dashed border-slate-200">
                            <p className="text-xs text-slate-400">Detail Block is Disabled</p>
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-2">Điều khoản & Điều kiện</h3>
                          <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {detail.TnC_Content || 'Chưa có thông tin điều khoản.'}
                          </div>
                        </div>

                        {/* FAQs */}
                        {(detail.FAQ_1_Q || detail.FAQ_2_Q || detail.FAQ_3_Q) && (
                          <div className="mt-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-2">Giải đáp thắc mắc</h3>
                            <div className="space-y-2">
                              {[1, 2, 3].map(num => {
                                const q = detail[`FAQ_${num}_Q` as keyof ProductDetailConfig];
                                const a = detail[`FAQ_${num}_A` as keyof ProductDetailConfig];
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

                      {/* Sticky Bottom CTA */}
                      <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button
                          onClick={() => setMobileScreen('steps')}
                          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                          style={{ backgroundColor: card.Bg_Color || '#006AF5', color: card.Text_Color || 'white' }}
                        >
                          {card.CTA_Label_Card || 'Đăng ký ngay'}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* SCREEN 3: DETAILED STEPS */}
            {mobileScreen === 'steps' && activeCardId && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300 bg-white min-h-full flex flex-col">
                {(() => {
                  const card = data.cardUIConfig.find(c => c.Config_ID === activeCardId);
                  const detail = data.productDetailConfig.find(d => d.Config_ID === activeCardId);

                  if (!card || !detail) return null;

                  return (
                    <>
                      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                        <button onClick={() => setMobileScreen('detail')} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                          <ArrowLeft size={20} className="text-slate-700" />
                        </button>
                        <h2 className="font-bold text-slate-900 text-sm">Hướng dẫn mở thẻ</h2>
                      </div>

                      <div className="p-6 flex-1">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-zalo-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Smartphone size={28} className="text-zalo-primary" />
                          </div>
                          <h3 className="font-bold text-lg text-slate-900">Chỉ 2 bước đơn giản</h3>
                          <p className="text-sm text-slate-500 mt-1">Hoàn thành hồ sơ trong 5 phút</p>
                        </div>

                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                          {(detail.Guidances && detail.Guidances.length > 0 ? detail.Guidances : [{ content: 'Hướng dẫn đang được cập nhật...', image_url: '' }]).map((step, idx) => (
                            <div key={idx} className="relative pl-6">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zalo-primary ring-4 ring-white"></div>
                              <h4 className="font-bold text-sm text-slate-900 mb-1">Bước {idx + 1}</h4>
                              <p className="text-sm text-slate-600">{step.content}</p>
                              {step.image_url && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                  <img src={step.image_url} alt={`Hướng dẫn bước ${idx + 1}`} className="w-full object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 mt-auto space-y-3">
                        {detail.Main_CTAs && detail.Main_CTAs.length > 0 ? (
                          detail.Main_CTAs.map(cta => (
                            <button
                              key={cta.id}
                              onClick={() => {
                                alert(`[CHUYỂN HƯỚNG ĐỐI TÁC]\n\nAction: ${cta.action_type}\nURL: ${cta.primary_url}\nCondition: ${cta.condition}`);
                              }}
                              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-opacity ${cta.action_type === 'DEEPLINK' || cta.condition === 'CONFIRM_CONDITION'
                                  ? 'text-white'
                                  : 'bg-white text-slate-700 border border-slate-200'
                                }`}
                              style={
                                (cta.action_type === 'DEEPLINK' || cta.condition === 'CONFIRM_CONDITION')
                                  ? { backgroundColor: card.Bg_Color || '#006AF5', color: card.Text_Color || 'white', backgroundImage: card.Background_Image_URL ? `url(${card.Background_Image_URL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }
                                  : {}
                              }
                            >
                              {cta.name || 'Hành động'}
                              {(cta.action_type === 'DEEPLINK' || cta.action_type === 'OPEN_KYC_FLOW') && <ExternalLink size={16} />}
                            </button>
                          ))
                        ) : (
                          <button
                            onClick={() => {
                              alert(`[CHUYỂN HƯỚNG ĐỐI TÁC]\n\nAction: ${detail.CTA_Action_Type}\nFallback URL: ${detail.Final_Target_URL}\nZPA Link: ${detail.ZPA_Link || '(Trống)'}\nZPI Link: ${detail.ZPI_Link || '(Trống)'}`);
                            }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: card.Bg_Color || '#006AF5', color: card.Text_Color || 'white', backgroundImage: card.Background_Image_URL ? `url(${card.Background_Image_URL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                          >
                            Tiếp tục sang đối tác
                            <ExternalLink size={16} />
                          </button>
                        )}
                        <p className="text-[10px] text-center text-slate-400 mt-2 px-4">
                          Bằng việc tiếp tục, bạn đồng ý chuyển sang trang web của đối tác để hoàn tất thủ tục.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

          </div>

          {/* Home Indicator */}
          <div className="h-6 bg-white w-full flex items-center justify-center absolute bottom-0 z-40">
            <div className="w-1/3 h-1 bg-slate-900 rounded-full"></div>
          </div>
        </div>
      </aside >

      {/* --- Modals --- */}
      {
        data && (
          <CardConfigModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            configId={editingConfigId}
            data={data}
            onSave={handleSaveConfig}
            onRedirectToPartners={() => {
              setIsModalOpen(false);
              setActiveView('partners');
            }}
          />
        )
      }
    </div >
  );
}

// --- Partner Management Components ---

function PartnerManager({ data, onUpdateData }: { data: ParsedData, onUpdateData: (d: ParsedData) => void }) {
  const [editingPartner, setEditingPartner] = useState<PartnerMaster | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSavePartner = (partner: PartnerMaster) => {
    const newPartnerMaster = [...data.partnerMaster];
    const index = newPartnerMaster.findIndex(p => p.Partner_ID === partner.Partner_ID);
    if (index >= 0) newPartnerMaster[index] = partner;
    else newPartnerMaster.push(partner);

    onUpdateData({ ...data, partnerMaster: newPartnerMaster });
    setIsFormOpen(false);
    setEditingPartner(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partner Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage partner information and preset card configurations.</p>
        </div>
        <button
          onClick={() => { setEditingPartner(null); setIsFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          + Add New Partner
        </button>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Partner ID</th>
                <th className="px-6 py-4 font-medium">Partner Name</th>
                <th className="px-6 py-4 font-medium">Bank Code</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.partnerMaster.map((partner) => (
                <tr key={partner.Partner_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{partner.Partner_ID}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {partner.Logo_URL ? (
                        <img src={partner.Logo_URL} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={16} className="text-slate-400" />
                      )}
                    </div>
                    {partner.Partner_Name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{partner.Bank_Code}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.Status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                      {partner.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => { setEditingPartner(partner); setIsFormOpen(true); }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit Presets
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <PartnerFormModal
          partner={editingPartner}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePartner}
        />
      )}
    </div>
  );
}

function PartnerFormModal({ partner, onClose, onSave }: { partner: PartnerMaster | null, onClose: () => void, onSave: (p: PartnerMaster) => void }) {
  const [formData, setFormData] = useState<PartnerMaster>(partner || {
    Partner_ID: '',
    Partner_Name: '',
    Bank_Code: '',
    Category: 'BANK',
    Status: 'ACTIVE',
    Logo_URL: '',
    Bg_Color: '#ffffff',
    Text_Color: '#1e293b',
    Card_Title: '',
    Card_Subtitle: '',
    Benefit_1: '',
    Benefit_2: '',
    Benefit_3: ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{partner ? 'Edit Partner Presets' : 'Add New Partner'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Partner ID</label>
              <input
                type="text"
                value={formData.Partner_ID}
                onChange={e => setFormData({ ...formData, Partner_ID: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                disabled={!!partner}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Partner Name</label>
              <input
                type="text"
                value={formData.Partner_Name}
                onChange={e => setFormData({ ...formData, Partner_Name: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Bank Code</label>
              <input
                type="text"
                value={formData.Bank_Code}
                onChange={e => setFormData({ ...formData, Bank_Code: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.Status}
                onChange={e => setFormData({ ...formData, Status: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider">Card UI Presets (Auto-fill)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Default Logo URL</label>
                <input
                  type="text"
                  value={formData.Logo_URL}
                  onChange={e => setFormData({ ...formData, Logo_URL: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Card Title Preset</label>
                  <input
                    type="text"
                    value={formData.Card_Title}
                    onChange={e => setFormData({ ...formData, Card_Title: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Card Subtitle Preset</label>
                  <input
                    type="text"
                    value={formData.Card_Subtitle}
                    onChange={e => setFormData({ ...formData, Card_Subtitle: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={formData.Bg_Color}
                    onChange={e => setFormData({ ...formData, Bg_Color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={formData.Text_Color}
                    onChange={e => setFormData({ ...formData, Text_Color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Benefit Presets</label>
                <input
                  type="text"
                  value={formData.Benefit_1}
                  onChange={e => setFormData({ ...formData, Benefit_1: e.target.value })}
                  placeholder="Benefit 1"
                  className="w-full p-2 border border-slate-200 rounded text-sm"
                />
                <input
                  type="text"
                  value={formData.Benefit_2}
                  onChange={e => setFormData({ ...formData, Benefit_2: e.target.value })}
                  placeholder="Benefit 2"
                  className="w-full p-2 border border-slate-200 rounded text-sm"
                />
                <input
                  type="text"
                  value={formData.Benefit_3}
                  onChange={e => setFormData({ ...formData, Benefit_3: e.target.value })}
                  placeholder="Benefit 3"
                  className="w-full p-2 border border-slate-200 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm">Save Partner</button>
        </div>
      </div>
    </div>
  );
}
