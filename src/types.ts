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

export type DisplayRules = {
    Rule_ID: string;
    Config_ID: string;
    User_Segment: string;
    Min_Age: string;
    Location: string;
    Priority: string;
    Status?: string;
    Start_Date?: string;
    End_Date?: string;
};

export type ParsedData = {
    partnerMaster: PartnerMaster[];
    cardUIConfig: CardUIConfig[];
    productDetailConfig: ProductDetailConfig[];
    displayRules: DisplayRules[];
};
