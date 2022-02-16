import React, { useEffect, useState } from "react";

/**
 * 单独抽取出来的编辑器和结果显示的组件
 * @param param0 传递进来的输入状态更新和翻译结果
 * @returns 
 */
export function Editor({ setFrom, from, state }) {
    let [scrolling, setScrolling] = useState(null)

    useEffect(() => {
        // 注意 querySelector 获取到的是快照，所以每次 scrolling 改变都要重新获取
        // 如果不写在 useEffect 里，考虑写在依赖 scrolling 的 useMemo 里
        let em_from = document.querySelector("#from")
        let em_to = document.querySelector("#to")

        switch (scrolling) {
            case "from": {
                function handleScroll(event) {
                    // 根据剩余部分的长度计算滚动长度，而不是直接跟据内容的长度
                    let scale = (em_to.scrollHeight - em_to.clientHeight) / (em_from.scrollHeight - em_from.clientHeight)
                    em_to.scrollTo({ top: em_from.scrollTop * scale })
                }
                em_from.addEventListener("scroll", handleScroll)
                // 借助 useEffect 在进入不同窗口（并重新渲染完）后清除掉上次的监听器
                return () => em_from.removeEventListener("scroll", handleScroll)
            }
            case "to": {
                let scale = (em_from.scrollHeight - em_from.clientHeight) / (em_to.scrollHeight - em_to.clientHeight)
                function handleScroll(event) {
                    em_from.scrollTo({ top: em_to.scrollTop * scale })
                }
                em_to.addEventListener("scroll", handleScroll)
                return () => em_to.removeEventListener("scroll", handleScroll)
            }
        }
    }, [scrolling])

    /**
     * 监听输入文本事件，会触发 App.tsx 中的 effect
     * @param event 
     */
    function handleInput(event) {
        setFrom(event.target.value)
    }

    return (
        <div className="px-2 flex h-full overflow-auto">
            <textarea
                onChange={handleInput}
                onMouseEnter={_ => setScrolling("from")}
                id="from"
                className='rounded-md font-serif text-lg resize-none w-full p-2 border-2 border-blue-300 outline-none'
                value={from}
            ></textarea>
            <div className="w-2"></div>
            <p
                id="to"
                onMouseEnter={_ => setScrolling("to")}
                className='whitespace-pre-wrap break-words overflow-auto rounded-md font-serif text-lg resize-none w-full p-2 border-2 outline-none'
            >
                {state.result}
            </p>
        </div>
    )
}