import {API} from "../translator"
/**
 * 等待重构
*/
interface BaiduResultGroup {
    src: string
    dst: string
}

interface BaiduAPI extends API {
    trans_result: BaiduResultGroup[]
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

export type {BaiduAPI, BaiduResultGroup, ApiKey}
