import {MD5} from 'crypto-js'
/**
 * 生成签名
 */
function md5(text: string): string {
    return MD5(text).toString()
}

/**
 * 将长文本进行分块处理
 * @param txt 原始文本
 * @param groupSize 分块大小
 * @param breakPoint 分组依据，默认从句子处断开
 * @returns 分块后句子组
 */
function slice(txt: string, groupSize: number, breakPoint:string): string[] {
    // 性能提升
    if (txt.length <= groupSize) return [txt]

    let res: string[] = []
    let tmpgroup = ""

    let chunks = txt.split(new RegExp(`[${breakPoint}]`))

    for (let chunk of chunks) {
        let wordlen = chunk.length
        if (tmpgroup.length + wordlen <= groupSize) {
            tmpgroup += chunk + breakPoint
        } else {
            // 提交长句，然后重置临时字符串
            res.push(tmpgroup)
            tmpgroup = chunk + breakPoint
        }
    }
    // 推入剩下的临时字符串
    res.push(tmpgroup)
    return res
}

export {md5, slice}
