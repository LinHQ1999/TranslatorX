import {faLeftRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

export function LangSwitcher({lang, setLang}) {
    // 取句末
    let wordbreaks = [
        {
            v: ".",
            d: "西文"
        },
        {
            v: "。",
            d: "中文"
        }
    ]
    let langlist = [
        {
            v: "zh",
            d: "中文"
        },
        {
            v: "jp",
            d: "日文"
        },
        {
            v: "en",
            d: "英文"
        },
        {
            v: "ru",
            d: "俄文"
        }
    ]
    return (
        <div>
            <select value={lang.splitter} className="select" onChange={event => setLang({...lang, splitter: event.target.value})} name="splitter">
                {wordbreaks.map(wb =>
                    <option key={wb.v} value={wb.d}>{wb.d}</option>
                )}
            </select>
            <select value={lang.from} className="select" onChange={event => setLang({...lang, from: event.target.value})} name="from">
                {langlist.map(opt =>
                    <option key={opt.v} value={opt.v} className="option">
                        {opt.d}
                    </option>
                )}
            </select>
            <button title="交换" onClick={() => setLang({from: lang.to, to: lang.from})}>
                <FontAwesomeIcon icon={faLeftRight} />
            </button>
            <select value={lang.to} className="select" onChange={event => setLang({...lang, to: event.target.value})} name="to">
                {langlist.map(opt =>
                    <option key={opt.v} value={opt.v} className="option">
                        {opt.d}
                    </option>
                )}
            </select>
        </div>
    )
}
