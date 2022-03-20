import {clipboard, contextBridge, ipcRenderer} from 'electron';
import {ApiKey} from './apis/baidu';
import {store} from './translator';

declare global {
    interface Window {
        Main: typeof api;
    }
    /**
     * 一些额外的调整参数
    */
    interface Config {
        from: string
        to: string
        splitter: string
    }
}

/**
 * 就算 expose 了，也只能调用支持 Render 层面的操作，比如 ipcRender 或者 clipboard
 */
export const api = {
    /**
     * Here you can expose functions to the renderer process
     * so they can interact with the main (electron) side
     * without security problems.
     *
     * The function below can accessed using `window.Main.sayHello`
     */
    sendMessage: (message: string) => {
        ipcRenderer.send('message', message);
    },
    /**
     * Provide an easier way to listen to events
     */
    on: (channel: string, callback: (data: any) => void) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
    /**
     * 我的 API
     */
    copy: clipboard.writeText,
    top: (onTop: boolean) => {
        return ipcRenderer.invoke("ontop", onTop)
    },
    state: () => {
        return ipcRenderer.invoke("trans_state")
    },
    trans: (
        from: string,
        lang: Config,
        groupSize?: number
    ) => {
        return ipcRenderer.invoke("translate", from, lang, groupSize)
    },
    setKey: (apikey: ApiKey) => {
        store.set("appID", apikey.appID)
        store.set("key", apikey.key)
    },
    getKey: () => store.store,
    resetKey: () => store.clear()
};
contextBridge.exposeInMainWorld('Main', api);
