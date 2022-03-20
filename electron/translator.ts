import axios from "axios"
import {error} from 'electron-log'
import Store from 'electron-store'
import {URL} from "url"
import {ApiKey, BaiduAPI} from "./apis/baidu"
import {md5, slice, sleep} from "./utils"

export interface API {
    q: string
    from: string
    to: string
}

export interface Translator {
    translate<T extends API>(from: string, lang: Config, appid: string, passwd: string, retry: number): Promise<T>
}

const store = new Store<ApiKey>({
    defaults: {
        appID: "",
        key: ""
    }
})

let trans_state = "0"
/**
 * 
 * @param from 待翻译文本
 * @param lang 翻译相关选项
 */
async function transBaidu(from: string, lang: Config, key:ApiKey, retry = 3): Promise<BaiduAPI> {
    if (retry < 0) {
        error("Maximum retry times!")
        throw new Error("Maximum retry times!")
    }
    try {
        let salt = new Date().getTime()
        let url = new URL("https://fanyi-api.baidu.com/api/trans/vip/translate")
        url.searchParams.set("q", from)
        url.searchParams.set("from", lang.from)
        url.searchParams.set("to", lang.to)
        url.searchParams.set("appid", key.appID)
        url.searchParams.set("salt", "" + salt)
        url.searchParams.set("sign", md5(key.appID + from + salt + key.key))
        let resp = await axios.get<BaiduAPI>(url.toString())
        // 空值重试
        if (!resp.data.trans_result || resp.data.trans_result.length == 0) {
            await sleep(1100)
            return transBaidu(from, lang, key, retry - 1)
        }
        return resp.data
    } catch (err) {
        await sleep(1100)
        error(err, `\n重试中 ${retry - 1}`)
        return transBaidu(from, lang, key, retry - 1)
    }
}

// 状态共享，方便取消
let working = [], send_count = 0

async function translate(
    from: string,
    lang: Config,
    groupSize = 1800
): Promise<string | void> {

    const chunks = slice(from.replace(/\n(?!\n)/g, ""), groupSize, lang.splitter)
    let res = ""

    // 尝试丢弃上次的结果
    working.length = 0
    trans_state = "0"
    send_count = 0

    for (let chunk of chunks) {
        working.push(transBaidu(chunk, lang, store.store, 3))
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

export  {store, trans_state, translate}
