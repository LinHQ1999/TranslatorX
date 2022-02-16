import { faClipboard, faGear, faThumbTack, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { count } from '@wordpress/wordcount';
import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from './Editor';
import { LangSwitcher } from './LangSwitcher';
import { SysTray } from './SysTray';

interface LoadState {
  result?: string
  loading: boolean
}

enum Actions {
  "Err",
  "Loading",
  "Loaded",
  "Default"
}

interface Action {
  type: Actions
  payload?: string
}

function stateReducer(state: LoadState, action: Action): LoadState {
  switch (action.type) {
    case Actions.Loading: {
      return { result: action.payload, loading: true }
    }
    case Actions.Loaded: {
      return { result: action.payload, loading: false }
    }
    case Actions.Err: {
      return { result: "出错了", loading: false }
    }
    default: {
      return { result: "", loading: false }
    }
  }
}

function App() {
  let [from, setFrom] = useState("")
  let [lang, setLang] = useState({ from: "en", to: "zh" })
  let [top, setTop] = useState(false)
  let [state, dispatch] = useReducer(stateReducer, { result: "", loading: false })
  let nav = useNavigate()

  let chars = count(from, "characters_including_spaces")
  let words = count(from, "words")
  let tlchars = count(state.result, "characters_including_spaces")

  /**
   * 此处实现 debounce
   */
  useEffect(() => {
    // 防止组件刚挂载的时候执行
    if (from.length > 2) {
      let tmr = setTimeout(() => {
        dispatch({ type: Actions.Loading, payload: "正在加载……" })
        window.Main.trans(from, lang.from, lang.to)
          .then((txt: string) => {
            if (txt) {
              dispatch({ type: Actions.Loaded, payload: txt })
            }
            else {
              dispatch({ type: Actions.Err })
            }
          })
      }, 800)
      return () => clearTimeout(tmr)
    }
  }, [from, lang])

  function handleCopy() {
    window.Main.copy(state.result)
  }

  function handleAlwaysOnTop() {
    setTop(!top)
    window.Main.top(!top)
  }

  return (
    <div className='h-screen flex flex-col justify-stretch'>
      <div className='flex border-b-2 p-1 my-2 items-center'>
        <button
          onClick={_ => {
            dispatch({ type: Actions.Default })
            setFrom("")
          }}
          className='button bg-red-500 text-white hover:ring-red-300' name='clear'
          title='清空输入信息'
        ><FontAwesomeIcon icon={faTrashCan} /></button>
        <button
          onClick={handleCopy}
          className='button bg-blue-500 text-white hover:ring-blue-300' name='copy'
          title="复制译文到剪贴板"
        ><FontAwesomeIcon icon={faClipboard} /></button>
        <button
          onClick={handleAlwaysOnTop}
          className={top ? 'button bg-slate-600 text-slate-200' : 'button text-slate-600 bg-slate-200'}
        >
          <FontAwesomeIcon icon={faThumbTack} />
        </button>
        <div className=' flex-grow'></div>
        <button
          onClick={() => nav("/conf")}
          className='button bg-purple-500 text-white hover:ring-purple-300' name='conf'
          title='打开设置界面'
        ><FontAwesomeIcon icon={faGear} /></button>
        <LangSwitcher lang={lang} setLang={setLang} />
      </div>
      <Editor setFrom={setFrom} from={from} state={state}  />
      <div className='flex px-2 flex-row-reverse items-center'>
        <span className='text-sm ml-2'>字符数：{chars}</span>
        <span className='text-sm ml-2'>词数：{words}</span>
        <span className='text-sm ml-2'>已翻译：{tlchars}</span>
        <SysTray loading={state.loading} />
      </div>
    </div >
  )
}

export default App;
