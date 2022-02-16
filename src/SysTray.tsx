import { faCubes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useInterval } from "./hooks/useInterval";

export function SysTray({ loading }) {
    // 设为 0 将不会更新
    let [state, setState] = useState(0)

    useInterval(() => {
        window.Main.state().then((data: number) => {
            setState(data)
        })
    }, 1000, loading)

    return (
        <div className='flex-grow flex items-center' id="sys_tray">
            <span><FontAwesomeIcon title="分块处理进度" icon={faCubes}/>: {state}%</span>
        </div>
    )
}