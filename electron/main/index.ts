import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import pkg from "electron-updater";
import { UpdateInfo } from "electron-updater";
const { autoUpdater } = pkg;
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "Todo Application",
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
console.log(1111111, autoUpdater.on);
// 触发检查更新(此方法用于被渲染线程调用，例如页面点击检查更新按钮来调用此方法)
ipcMain.on("check-for-update", () => {
  console.log("触发检查更新");
  autoUpdater.checkForUpdates();
});

// 设置自动下载为false(默认为true，检测到有更新就自动下载)
autoUpdater.autoDownload = false;
// 检测下载错误
autoUpdater.on("error", (error) => {
  console.error("更新异常", error);
});

// 检测是否需要更新
autoUpdater.on("checking-for-update", () => {
  console.log("正在检查更新……");
});
// 检测到可以更新时
autoUpdater.on("update-available", (releaseInfo: UpdateInfo) => {
  console.log("检测到新版本，确认是否下载");
  const releaseNotes = releaseInfo.releaseNotes;
  let releaseContent = "";
  if (releaseNotes) {
    if (typeof releaseNotes === "string") {
      releaseContent = <string>releaseNotes;
    } else if (releaseNotes instanceof Array) {
      releaseNotes.forEach((releaseNote) => {
        releaseContent += `${releaseNote}\n`;
      });
    }
  } else {
    releaseContent = "暂无更新说明";
  }
  // 弹框确认是否下载更新（releaseContent是更新日志）
  dialog
    .showMessageBox({
      type: "info",
      title: "应用有新的更新",
      detail: releaseContent,
      message: "发现新版本，是否现在更新？",
      buttons: ["否", "是"],
    })
    .then(({ response }) => {
      if (response === 1) {
        // 下载更新
        autoUpdater.downloadUpdate();
      }
    });
});
// 检测到不需要更新时
autoUpdater.on("update-not-available", () => {
  console.log("现在使用的就是最新版本，不用更新");
});
// 更新下载进度
autoUpdater.on("download-progress", (progress) => {
  console.log("下载进度", progress);
});
// 当需要更新的内容下载完成后
autoUpdater.on("update-downloaded", () => {
  console.log("下载完成，准备更新");
  dialog
    .showMessageBox({
      title: "安装更新",
      message: "更新下载完毕，应用将重启并进行安装",
    })
    .then(() => {
      // 退出并安装应用
      setImmediate(() => autoUpdater.quitAndInstall());
    });
});
