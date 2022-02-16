import { ChangeEvent, useRef } from "react";

export function useDebounce(fn: (event:ChangeEvent) => void, latency = 500){
    let tmr = useRef<NodeJS.Timer>()

    return function (event:ChangeEvent) {
        clearTimeout(tmr.current)
        tmr.current = setTimeout(() => fn(event), latency);
    }
}