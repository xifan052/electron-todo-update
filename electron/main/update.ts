import { app, ipcMain } from "electron";
import { createRequire } from "node:module";
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from "electron-updater";

const { autoUpdater } = createRequire(import.meta.url)("electron-updater");

export function update(win: Electron.BrowserWindow) {
  win?.webContents.send(
    "main-process-message",
    "start update",
    app.getVersion()
  );

  // When set to false, the update download will be triggered through the API
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  // start check
  autoUpdater.on("checking-for-update", function () {
    win?.webContents.send("main-process-message", "checking-for-update");
  });
  // update available
  autoUpdater.on("update-available", (arg: UpdateInfo) => {
    win?.webContents.send(
      "main-process-message",
      `getVersion`,
      app.getVersion()
    );
    win.webContents.send("update-can-available", {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });
  // update not available
  autoUpdater.on("update-not-available", (arg: UpdateInfo) => {
    win?.webContents.send(
      "main-process-message",
      "update-can-available - getVersion",
      app.getVersion()
    );
    win.webContents.send("update-can-available", {
      update: false,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  // Checking for updates
  ipcMain.handle("check-update", async () => {
    win?.webContents.send("main-process-message", "check-update");
    if (!app.isPackaged) {
      const error = new Error(
        "The update feature is only available after the package."
      );
      console.error("Update check failed:", error.message);
      return { message: error.message, error };
    }

    try {
      console.log("Checking for updates...");
      const result = await autoUpdater.checkForUpdatesAndNotify();
      console.log("Update check result:", result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Network error during update check:", error.message);
      } else {
        console.error("Network error during update check:", error);
      }
      return { message: "Network error", error };
    }
  });

  // Start downloading and feedback on progress
  ipcMain.handle("start-download", (event: Electron.IpcMainInvokeEvent) => {
    win?.webContents.send("main-process-message", "start-download");
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send("update-error", { message: error.message, error });
          win?.webContents.send("main-process-message", "update-error", {
            message: error.message,
            error,
          });
        } else {
          // feedback update progress message
          event.sender.send("download-progress", progressInfo);
          win?.webContents.send(
            "main-process-message",
            "download-progress",
            progressInfo
          );
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send("update-downloaded");
        win?.webContents.send(
          "main-process-message",
          "main-process-message",
          "update-downloaded"
        );
      }
    );
  });

  // Install now
  ipcMain.handle("quit-and-install", () => {
    win?.webContents.send(
      "main-process-message",
      "main-process-message",
      "quit-and-install"
    );
    autoUpdater.quitAndInstall(false, true);
  });
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void
) {
  autoUpdater.on("download-progress", (info: ProgressInfo) =>
    callback(null, info)
  );
  autoUpdater.on("error", (error: Error) => callback(error, null));
  autoUpdater.on("update-downloaded", complete);
  autoUpdater.downloadUpdate();
}
