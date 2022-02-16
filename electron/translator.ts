import axios from "axios"
import { MD5 } from "crypto-js"
import { error } from 'electron-log'
import { URL } from "url"
import { ApiKey, BaiduAPI } from "./api_types"
import Store from 'electron-store'

export const store = new Store<ApiKey>({defaults: {
    appID: "",
    key: ""
}})

export let trans_state = "0"

/**
 * 将长文本进行分块处理
 * @param txt 原始文本
 * @param groupSize 分块大小
 * @param breakPoint 分组依据，默认从句子处断开
 * @returns 分块后句子组
 */
function slice(txt: string, groupSize: number, breakPoint = "."): string[] {
    // 性能提升
    if (txt.length <= groupSize) return [txt]

    let res: string[] = []
    let tmpgroup = ""
    let chunks = txt.split(breakPoint)

    for (let chunk of chunks) {
        let wordlen = chunk.length
        if (tmpgroup.length + wordlen <= groupSize) {
            tmpgroup += chunk + breakPoint
        } else {
            // 提交长句，然后重置临时字符串
            res.push(tmpgroup.trim())
            tmpgroup = chunk + breakPoint
        }
    }
    // 推入剩下的临时字符串
    res.push(tmpgroup)
    return res
}

/**
 * 生成签名
 */
function md5(text: string): string {
    return MD5(text).toString()
}

/**
 * 
 * @param text 待翻译文本
 * @param from 源语言
 * @param to 结果语言 
 */
async function transBaidu(text: string, from: string, to: string, appid: string, passwd: string, retry = 3): Promise<BaiduAPI> {
    if (retry < 0) {
        throw new Error("Maximum retry times!")
    }
    try {
        let salt = new Date().getTime()
        let url = new URL("https://fanyi-api.baidu.com/api/trans/vip/translate")
        url.searchParams.set("q", text)
        url.searchParams.set("from", from)
        url.searchParams.set("to", to)
        url.searchParams.set("appid", appid)
        url.searchParams.set("salt", "" + salt)
        url.searchParams.set("sign", md5(appid + text + salt + passwd))
        let resp = await axios.get<BaiduAPI>(url.toString())
        // 空值重试
        if (!resp.data.trans_result || resp.data.trans_result.length == 0) {
            await sleep(1100)
            return transBaidu(text, from, to, appid, passwd, retry - 1)
        }
        return resp.data
    } catch (err) {
        await sleep(1100)
        error(err, `\n重试中 ${retry - 1}`)
        return transBaidu(text, from, to, appid, passwd, retry - 1)
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

async function translate(
    text: string, from: string, to: string,
    groupSize = 1800
): Promise<string> {
    let chunks = slice(text, groupSize)
    let res = ""
    let working = []
    let send_count = 0
    trans_state = ""

    for (let chunk of chunks) {
        working.push(transBaidu(chunk, from, to, store.get("appID"), store.get("key"), 3))
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

export { translate }

