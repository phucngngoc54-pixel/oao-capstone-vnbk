export type PartnerMaster = {
    Partner_ID: string;
    Partner_Name: string;
    Bank_Code: string;
    Category: string;
    Status: string;
    // Preset fields for auto-fill
    Logo_URL?: string;
    Bg_Color?: string;
    Text_Color?: string;
    Benefit_1?: string;
    Benefit_2?: string;
    Benefit_3?: string;
    Card_Title?: string;
    Card_Subtitle?: string;
};

export type GuidanceItem = {
    id: string;
    content: string;
    image_url: string;
};

export type SubContentItem = {
    id: string;
    type: string; // e.g., 'HYPER_LINK'
    label: string;
    code?: string;
    cta_name?: string;
    pre_icon_url?: string;
    post_icon_url?: string;
    zpi_link?: string;
    zpa_link?: string;
};

export type MainCtaItem = {
    id: string;
    condition: string; // e.g. CONFIRM_CONDITION, NOT_ELIGIBLE
    name: string;
    action_type: string;
    description?: string;
    primary_url?: string;
    secondary_url?: string;
    extra_info_json?: string;
};

export type CardUIConfig = {
    Config_ID: string;
    Partner_ID: string;

    // Feature Toggles (Phase 8)
    Has_Freeze_Banner?: boolean;
    Has_Hero_Banner?: boolean;
    Has_Base_Card?: boolean;
    Has_Explored_Card?: boolean;
    Has_Detail_Block?: boolean;

    // Component - Basic Info (Internal)
    Config_Name?: string; // New field for internal tracking mapped to Name
    Bank_Code?: string;
    Extra_Info?: string;

    // Component - Card Block (Base Card)
    Card_Title: string;
    Card_Subtitle: string;
    Logo_URL: string;
    // Component - Explored Card (Benefits)
    Badge_Text: string;
    Description?: string; // Single text area string taking over Benefits[]
    Benefit_1?: string; // Deprecated but kept for CSV compatibility for now
    Benefit_2?: string;
    Benefit_3?: string;
    CTA_Label_Card: string;
    Service_Group?: string;
    // Extended Visuals
    Title_Color?: string;
    Subtitle_Color?: string;
    Content_Color?: string;
    Bg_Color?: string;
    Text_Color?: string;
    Background_Image_URL?: string;
    Right_Faded_Logo_URL?: string;
};

export type ProductDetailConfig = {
    Config_ID: string;

    // Detail Block Features
    Top_Image_URL?: string;
    Detail_Contents?: string; // New string to map to old step desc logic

    Hero_Banner_URL: string;
    TnC_Content: string;
    Step_1_Desc: string;
    Step_2_Desc: string;
    CTA_Action_Type: string;
    Final_Target_URL: string; // Generic / Fallback
    ZPA_Link?: string; // App native link
    ZPI_Link?: string; // Mini App link

    // Banners
    Freeze_Title?: string;
    Freeze_Subtitle?: string;
    Freeze_Banner_Content?: string; // Legacy
    Hero_Title?: string;
    Hero_Subtitle?: string;
    FAQ_1_Q?: string;
    FAQ_1_A?: string;
    FAQ_2_Q?: string;
    FAQ_2_A?: string;
    FAQ_3_Q?: string;
    FAQ_3_A?: string;

    // Phase 9 - New Detail Screen Structure
    Detail_Header_Title?: string;
    Detail_Header_Image_URL?: string;
    Guidances?: GuidanceItem[];
    Sub_Contents?: SubContentItem[];
    Main_CTAs?: MainCtaItem[];
};

export type Operator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';

export type TargetingRule = {
    id: string;
    field: string;
    operator: Operator;
    value: any;
    isExcluded?: boolean;
};

export type SegmentBundle = {
    id: string;
    name: string;
    category: 'Bank' | 'Loan' | 'Insurance' | 'Investment' | 'Custom';
    description?: string;
    rules: TargetingRule[];
    logicOperator: 'AND' | 'OR';
    isActive: boolean;
};

export type Variant = {
    id: string;
    name: string;
    weight: number;
    segment_bundle_snapshot: SegmentBundle;
    overrides?: Partial<CardUIConfig>;
};

export type ExperimentStatus = 'Draft' | 'Running' | 'Paused' | 'Ended';

export type Experiment = {
    id: string;
    name: string;
    description?: string;
    status: ExperimentStatus;
    variants: Variant[];
    createdAt: string;
    updatedAt: string;
};

export type ExperimentLog = {
    userId: string;
    experimentId: string;
    variantId: string;
    eventType: 'Exposure' | 'Click' | 'Conversion';
    timestamp: string;
    metadata?: Record<string, any>;
};

export type DisplayRules = {
    Rule_ID: string;
    Config_ID: string;
    Priority: string;
    User_Segment: string;
    Status?: 'DRAFT' | 'ACTIVE';
    Min_Age?: string;
    Location?: string;
    Start_Date?: string;
    End_Date?: string;
    Test_Group?: 'Control' | 'Variant A' | 'Variant B' | 'All';
    experiment_id?: string;
    target_bundle_id?: string;
};

export type UserPersona = {
    userId: string;
    age: number;
    location: string;
    salary: number;
    hasLoan: boolean;
    segment: string;
};

export type CardPerformance = {
    configId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    convRate: number;
    bounceRate: number;
    avgAttentionTime: number;
    shares: number;
    returnRate: number;
    impactScore: number;
    status: 'good' | 'warn' | 'critical';
};

export type ParsedData = {
    partnerMaster: PartnerMaster[];
    cardUIConfig: CardUIConfig[];
    productDetailConfig: ProductDetailConfig[];
    displayRules: DisplayRules[];
    segmentBundles: SegmentBundle[];
    experiments: Experiment[];
};

