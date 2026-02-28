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

export type CardUIConfig = {
    Config_ID: string;
    Partner_ID: string;
    Card_Title: string;
    Card_Subtitle: string;
    Logo_URL: string;
    Badge_Text: string;
    Bg_Color: string;
    Text_Color: string;
    Benefit_1: string;
    Benefit_2: string;
    Benefit_3: string;
    CTA_Label_Card: string;
};

export type ProductDetailConfig = {
    Config_ID: string;
    Hero_Banner_URL: string;
    TnC_Content: string;
    Step_1_Desc: string;
    Step_2_Desc: string;
    CTA_Action_Type: string;
    Final_Target_URL: string;
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
