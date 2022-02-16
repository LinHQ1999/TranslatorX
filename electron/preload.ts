import { clipboard, contextBridge, ipcRenderer } from 'electron';
import { ApiKey } from './api_types';
import { store } from './translator';

declare global {
  interface Window {
    Main: typeof api;
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
    text: string, from: string, to: string,
    groupSize?: number
  ) => {
    return ipcRenderer.invoke("translate", text, from, to, groupSize)
  },
  setKey: (apikey: ApiKey) => {
    store.set("appID", apikey.appID)
    store.set("key", apikey.key)
  },
  getKey: () => { return { appID: store.get("appID"), key: store.get("key") } },
  resetKey: () => store.clear()
};
contextBridge.exposeInMainWorld('Main', api);