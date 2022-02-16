interface BaiduResultGroup {
    src: string
    dst: string
}

interface BaiduAPI {
    from: string
    to: string
    trans_result: BaiduResultGroup[]
    error_code?: number
    /**
     * 以下字段仅开通了词典、TTS用户可见
     */
    src_tts?: string
    dst_tts?: string
    dict?: string
}

interface ApiKey {
    appID: string
    key: string
}

export type { BaiduAPI, BaiduResultGroup, ApiKey }