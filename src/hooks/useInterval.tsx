import { useEffect, useRef } from "react";

/**
 * 重复执行某个动作的钩子（也考虑下 useReducer）
 * @param fn 需要循环执行的函数
 * @param delay 延迟时间
 * @param deps 触发重新计时的依赖
 */
export function useInterval(fn: () => void, delay: number, ...deps: any[]) {
    let curr = useRef<Function>()

    useEffect(() => {
        curr.current = fn
    }, [fn])

    useEffect(() => {
        let [loading] = deps
        if (loading) {
            let tmr = setInterval(() => curr.current(), delay)
            return () => clearInterval(tmr)
        }
        // loading 触发计时器取消，所以需要 ...deps
    }, [delay, ...deps])
}