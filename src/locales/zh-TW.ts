export default {
  common: {
    add: '新增',
    addSuccess: '新增成功',
    edit: '編輯',
    editSuccess: '編輯成功',
    delete: '刪除',
    deleteSuccess: '刪除成功',
    save: '儲存',
    sync: '儲存並同步所有人',
    test: '測試',
    saveSuccess: '儲存成功',
    reset: '重置',
    action: '操作',
    export: '匯出',
    exportSuccess: '匯出成功',
    import: '匯入',
    importSuccess: '匯入成功',
    clear: '清除',
    clearSuccess: '清除成功',
    yes: '是',
    no: '否',
    confirm: '確認',
    download: '下載',
    noData: '目前無資料',
    wrong: '發生錯誤，請稍後再試。',
    success: '操作成功',
    failed: '操作失敗',
    register: '註冊',
    login: '登錄',
    notLoggedIn: '登錄 / 註冊',
    logOut: '退出登錄',
    unauthorizedTips: '未經授權，請先進行驗證。',
    email: '電子郵件',
    password: '密碼',
    passwordConfirm: '確認密碼',
    resetPassword: '重置密碼',
    resetPasswordMail: '發送重置密碼郵件',
    auditTip: '敏感詞對管理員不生效',
    twoFA: '兩步驗證',
  },
  chat: {
    newChatButton: '新建對話',
    placeholder: '來說點什麼...（Shift + Enter = 換行，"/" 觸發提示詞）',
    placeholderMobile: '來說點什麼...',
    copy: '複製',
    copied: '複製成功',
    copyCode: '複製代碼',
    clearChat: '清除對話',
    clearChatConfirm: '是否清空對話?',
    exportImage: '儲存對話為圖片',
    exportImageConfirm: '是否將對話儲存為圖片?',
    exportSuccess: '儲存成功',
    exportFailed: '儲存失敗',
    usingContext: '上下文模式',
    turnOnContext: '啟用上下文模式，在此模式下，發送訊息會包含之前的聊天記錄。',
    turnOffContext: '關閉上下文模式，在此模式下，發送訊息不會包含之前的聊天記錄。',
    clickTurnOnContext: '點擊開啟包含上下文',
    clickTurnOffContext: '點擊停止包含上下文',
    showOnContext: '包含上下文',
    showOffContext: '不含上下文',
    deleteMessage: '刪除訊息',
    deleteMessageConfirm: '是否刪除此訊息?',
    deleteHistoryConfirm: '確定刪除此紀錄?',
    clearHistoryConfirm: '確定清除紀錄?',
    preview: '預覽',
    showRawText: '顯示原文',
    usageEstimate: '預估',
    usagePrompt: '提問',
    usageResponse: '回復',
    usageTotal: '總消耗 token',
    deleteUser: '刪除用戶',
    editUser: '編輯用戶',
    deleteUserConfirm: '你確定要刪除這個用戶嗎? 刪除後這個郵箱永遠無法註冊登錄',
    verifiedUser: '通過驗證',
    deleteKey: '刪除 Key',
    editKeyButton: '編輯 Key',
    deleteKeyConfirm: '你確定要刪除這個 key 嗎?',
    disable2FA: '禁用 2FA',
    disable2FAConfirm: '您確定要為此使用者禁用兩步驗證嗎？?',
  },
  setting: {
    overRide: '開啟覆寫',
    uploadgifts: '上傳兌換碼',
    announceConfig: '網站公告',
    announceEnabled: '打開公告',
    announceWords: '公告內容',
    globalAmount: '新使用者全域性次數設定',
    limit_switch: '開啟次數限制',
    redeemCardNo: '兌換碼卡號',
    useAmount: '可提問次數',
    setting: '設定',
    general: '總覽',
    advanced: '高級',
    statistics: '統計',
    config: '基本設定',
    chatRecord: '聊天紀錄',
    siteConfig: '網站配置',
    mailConfig: '郵箱配置',
    auditConfig: '敏感詞審覈',
    avatarLink: '頭貼連結',
    name: '名稱',
    description: '描述',
    role: '角色設定',
    temperature: '思維發散程度',
    top_p: 'Top_p',
    saveUserInfo: '儲存使用者資訊',
    chatHistory: '紀錄',
    theme: '主題',
    language: '語言',
    api: 'API',
    reverseProxy: '反向代理',
    timeout: '逾時(ms)',
    socks: 'Socks',
    socksAuth: 'Socks 授權',
    httpsProxy: 'HTTPS Proxy',
    balance: 'API余額',
    statisticsPeriod: '統計時間段',
    statisticsPeriodLastMonth: '上月',
    statisticsPeriodCurrentMonth: '本月',
    statisticsPeriodLast30Days: '最近30天',
    statisticsPrompt: '提問',
    statisticsCompletion: '回答',
    statisticsTotal: '總計',
    smtpHost: 'Host',
    smtpPort: 'Port',
    smtpTsl: 'Tsl',
    smtpUserName: '賬號',
    smtpPassword: '密碼/專用密碼',
    siteTitle: '網站標題',
    siteDomain: '域名 不含/',
    registerEnabled: '新使用者',
    registerReview: '新使用者審覈',
    registerMails: '後綴',
    registerReviewTip: '僅允許這些郵箱的後綴註冊本網站',
    apiBaseUrl: '介面地址',
    apiModel: '介面型別',
    accessToken: 'Access Token',
    loginEnabled: '註冊登錄',
    loginSalt: '登錄混淆鹽',
    loginSaltTip: '變更會導致已有登錄失效',
    monthlyUsage: '本月使用量',
    auditEnabled: '第三方',
    auditProvider: '提供商',
    auditApiKey: 'Api Key',
    auditApiSecret: 'Api Secret',
    auditTest: '測試文字',
    auditBaiduLabel: '二級分類',
    auditBaiduLabelTip: '英文逗號分割, 如果空, 僅政治',
    auditBaiduLabelLink: '檢視細分類型',
    auditCustomizeEnabled: '自定義',
    auditCustomizeWords: '敏感詞',
    accessTokenExpiredTime: '過期時間',
    userConfig: '用戶管理',
    keysConfig: 'Keys 管理',
    userRoles: '用戶權限',
    status: '狀態',
    chatModels: '對話模型',
    defaultChatModel: '預設對話模型',
    remark: '備註',
    email: '電子郵箱',
    password: '密碼',
    passwordConfig: '密碼',
    oldPassword: '舊密碼',
    newPassword: '新密碼',
    confirmNewPassword: '確認密碼',
    twoFAConfig: '兩步驗證',
    disable2FA: '禁用 2FA',
    enable2FA: '開啟 2FA',
    info2FA: '兩步驗證是一個額外的驗證步驟，可讓您的登錄體驗更加安全。開啟兩步驗證后，每次您要登錄到您的帳戶時，系統均提示您輸入動態驗證碼。',
    status2FA: '目前狀態',
    status2FAClosed: '關閉',
    status2FAOpened: '已開啟',
    info2FAStep1: '安裝身份驗證器App',
    info2FAStep1Desc: '安裝身份驗證器App，例如Google Authenticator、Microsoft Authenticator、Authy等',
    info2FAStep2: '配置產生驗證碼',
    info2FAStep2Desc: '打開身份驗證器 App，點選「掃瞄二維碼」掃瞄二維碼。',
    info2FAStep2Tip: '注意： 身份驗證器不能掃瞄驗證碼？ 手動新增以下賬戶',
    info2FAStep2TipAccount: '賬戶',
    info2FAStep2TipSecret: '金鑰',
    info2FAStep3: '驗證並開啟',
    info2FAStep3Desc: '請輸入身份驗證器 App 產生的 6 位動態驗證碼，開啟兩步驗證。',
    info2FAStep3Tip1: '注意：如何關閉兩步驗證？',
    info2FAStep3Tip2: '1. 登錄后，在 兩步驗證 頁面使用兩步驗證碼關閉。',
    info2FAStep3Tip3: '2. 聯繫管理員來關閉兩步驗證。',
    maxContextCount: '最大上下文數量',
    fastDelMsg: '快速刪除訊息',
  },
  store: {
    siderButton: '提示詞商店',
    local: '本機',
    online: '線上',
    title: '標題',
    description: '描述',
    clearStoreConfirm: '是否清除資料？',
    importPlaceholder: '請將 JSON 資料貼在此處',
    addRepeatTitleTips: '標題重複，請重新輸入',
    addRepeatContentTips: '內容重複：{msg}，請重新輸入',
    editRepeatTitleTips: '標題衝突，請重新修改',
    editRepeatContentTips: '內容衝突{msg} ，請重新修改',
    importError: '鍵值不符合',
    importRepeatTitle: '因標題重複跳過：{msg}',
    importRepeatContent: '因內容重複跳過：{msg}',
    onlineImportWarning: '注意：請檢查 JSON 檔案來源！',
    downloadError: '請檢查網路狀態與 JSON 檔案有效性',
  },
}
