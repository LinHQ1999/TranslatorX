import axios from "axios"
import {error} from 'electron-log'
import Store from 'electron-store'
import {URL} from "url"
import {ApiKey, BaiduAPI} from "./apis/baidu"
import {md5, slice} from "./utils"

export interface API {
    q: string
    from: string
    to: string
}

export interface Translator {
    translate<T extends API>(text: string, lang: Config, appid: string, passwd: string, retry: number): Promise<T>
}

export const store = new Store<ApiKey>({
    defaults: {
        appID: "",
        key: ""
    }
})

export let trans_state = "0"
/**
 * 
 * @param text 待翻译文本
 * @param from 源语言
 * @param to 结果语言 
 */
async function transBaidu(text: string, lang:Config, appid: string, passwd: string, retry = 3): Promise<BaiduAPI> {
    if (retry < 0) {
        throw new Error("Maximum retry times!")
    }
    try {
        let salt = new Date().getTime()
        let url = new URL("https://fanyi-api.baidu.com/api/trans/vip/translate")
        url.searchParams.set("q", text)
        url.searchParams.set("from", lang.from)
        url.searchParams.set("to", lang.to)
        url.searchParams.set("appid", appid)
        url.searchParams.set("salt", "" + salt)
        url.searchParams.set("sign", md5(appid + text + salt + passwd))
        let resp = await axios.get<BaiduAPI>(url.toString())
        // 空值重试
        if (!resp.data.trans_result || resp.data.trans_result.length == 0) {
            await sleep(1100)
            return transBaidu(text, lang, appid, passwd, retry - 1)
        }
        return resp.data
    } catch (err) {
        await sleep(1100)
        error(err, `\n重试中 ${retry - 1}`)
        return transBaidu(text, lang, appid, passwd, retry - 1)
    }
}

/**
 * 暂停执行
 * 
 * @param ms 睡眠时间
 * @returns 
 */
function sleep(ms: number) {
    return new Promise((res, _) => {
        setTimeout(res, ms)
    })
}

// 状态共享，方便取消
let working = [], send_count = 0

export async function translate(
    from: string,
    lang: Config,
    groupSize = 1800
): Promise<string | void> {

    let chunks = slice(from.replaceAll(lang.splitter, ""), groupSize)
    let res = ""

    // 尝试丢弃上次的结果
    working.length = 0
    trans_state = "0"
    send_count = 0

    for (let chunk of chunks) {
        working.push(transBaidu(chunk, lang, store.get("appID"), store.get("key"), 3))
        send_count++
        // 更新状态变量
        trans_state = ((send_count / chunks.length) * 100).toFixed(1)
        await sleep(1500)
    }

    let transed = await Promise.allSettled<BaiduAPI>(working)
    for (let trans of transed) {
        if (trans.status == "fulfilled") {
            for (let group of trans.value.trans_result) {
                // 分段格式保留
                res += group.dst + "\n\n"
            }
        } else {
            error(trans.reason)
        }
    }
    return res
}

