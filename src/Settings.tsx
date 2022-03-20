import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"

/**
 * 当然也可以通过状态提升实现
 * @returns 
 */
export function Settings() {
    let [api, setApi] = useState({appID: "", key: ""})
    let [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        console.log("Repaint")
        setApi(window.Main.getKey())
    }, [submitted])

    function handleInput(event) {
        let target = event.target
        setApi({
            ...api,
            [target.name]: target.value
        })
    }

    function handleSubmit() {
        window.Main.setKey(api)
        setSubmitted(!submitted)
    }

    function handleReset() {
        window.Main.resetKey()
        setSubmitted(!submitted)
    }

    return (
        <div className="p-3 h-screen w-1/2 mx-auto flex items-center">
            <form className="flex flex-col mb-3 justify-start w-full">
                <label className="my-3" htmlFor="appID">
                    你的 AppID:
                </label>
                <input className="form-input" onChange={handleInput} name="appID" type="text" value={api.appID} />
                <label className="my-3" htmlFor="key">
                    你的 Key:
                </label>
                <input className="form-input mb-2" onChange={handleInput} name="key" type="text" value={api.key} />
                <div className="flex flex-row-reverse items-center">
                    {submitted ?
                        <button className="button text-base m-0 ml-2 bg-red-500 hover:ring-red-300 text-white" onClick={handleReset}>重设</button>
                        :
                        <button className="button text-base m-0 ml-2 bg-blue-500 hover:ring-blue-300 text-white" onClick={handleSubmit}>提交</button>
                    }
                    <Link to="/" className="text-sm text-blue-300 hover:text-blue-400">点此返回主页面</Link>
                </div>
            </form>
        </div>
    )
}
