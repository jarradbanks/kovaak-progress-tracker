"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeImage,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import fs from "fs";
import path from "path";
var chokidar = require("chokidar");
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
    frame: false,
    icon: nativeImage.createFromPath(__dirname + "/assets/icons/icon.ico"),
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

ipcMain.on("app:quit", () => {
  app.quit();
});

ipcMain.on("app:minimize", () => {
  win.minimize();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

/* Custom Event Listeners */

ipcMain.on("openPathDialog", (event, arg) => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then((data) => {
      if (data.filePaths.length > 0) {
        event.sender.send("close-path-dialog", data.filePaths[0]);
      }
    });
});

ipcMain.on("getScenarios", (event, data) => {
  var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream(
      path.join(
        "G:\\Steam\\steamapps\\common\\FPSAimTrainer\\FPSAimTrainer\\Saved\\SaveGames",
        "SteamWorkshop.cache"
      )
    ),
  });

  var scenarios = [];
  lineReader.on('line', function (line) {

    var split = line.slice(40).split("|;");

    if (split.length >= 1) {
      if (split[0] && split[1]) {
        scenarios.push({
          name: split[0],
          description: split[1]

        });
      }
    }
  });

  lineReader.on("close", () => {
    event.sender.send("gotScenarios", scenarios);
  });
});

ipcMain.on("getKovaakFile", (event, data) => {
  var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream(path.join(data.path, data.name)),
  });

  var parse1 = false,
    parse2 = false,
    parse3 = false;

  var parse1Arr = [],
    parse2Obj = {},
    parse3Obj = {
      Kills: null,
      Deaths: null,
      "Fight Time": null,
      "Avg TTK": null,
      "Damage Done": null,
      "Damage Taken": null,
      Midairs: null,
      Midaired: null,
      Directs: null,
      Directed: null,
      "Distance Traveled": null,
      Score: null,
      Scenario: null,
      Hash: null,
      "Game Version": null,
      "Input Lag": null,
      "Max FPS (config)": null,
      "Sens Scale": null,
      "Horiz Sens": null,
      "Vert Sens": null,
      FOV: null,
      "Hide Gun": null,
      Crosshair: null,
      "Crosshair Scale": null,
      "Crosshair Color": null,
    };

  lineReader.on("line", function(line) {
    var split = line.split(",");

    if (
      line.includes(
        "Kill #,Timestamp,Bot,Weapon,TTK,Shots,Hits,Accuracy,Damage Done,Damage Possible,Efficiency,Cheated"
      )
    ) {
      parse1 = true;
      return;
    } else if (
      line.includes(
        "Weapon,Shots,Hits,Damage Done,Damage Possible,,Sens Scale,Horiz Sens,Vert Sens,FOV,Hide Gun,Crosshair,Crosshair Scale,Crosshair Color,ADS Sens,ADS Zoom Scale"
      )
    ) {
      parse1 = false;
      parse2 = true;
      return;
    }
    if (parse1) {
      parse1Arr.push({
        "Kill #": split[0],
        Timestamp: split[1],
        Bot: split[2],
        Weapon: split[3],
        TTK: split[4],
        Shots: split[5],
        Hits: split[6],
        Accuracy: split[7],
        "Damage Done": split[8],
        "Damage Possible": split[9],
        Efficiency: split[10],
        Cheated: split[11],
      });
    } else if (parse2) {
      parse2Obj = {
        Weapon: split[0],
        Shots: split[1],
        Hits: split[2],
        "Damage Done": split[3],
        "Damage Possible": split[4],
        "Sens Scale": split[5],
        "Horiz Sens": split[6],
        "Vert Sens": split[7],
        FOV: split[8],
        "Hide Gun": split[9],
        Crosshair: split[10],
        "Crosshair Scale": split[11],
        "Crosshair Color": split[12],
        "ADS Sens": split[13],
        "ADS Zoom Scale": split[14],
      };

      parse2 = false;
      parse3 = true;
    } else if (parse3) {
      if (line.includes(",")) {
        if (split.length == 2) {
          parse3Obj[split[0].replace(":", "")] = split[1];
        }
      }
    }
  });

  lineReader.on("close", () => {
    event.sender.send("gotKovaakFile", {
      name: data.name,
      date: data.date,
      1: parse1Arr,
      2: parse2Obj,
      3: parse3Obj,
    });
  });
});

ipcMain.on("getKovaakData", (event, path) => {
  fs.readdir(path, (error, files) => {
    if (error) {
      return console.log(error);
    }

    var data = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      var scenario = file.split(" - Challenge - ").map(
        (stat) =>
          (stat = stat
            .trim()
            .replace(" Stats", "")
            .replace(".csv", ""))
      ); 
      
      if (scenario.length == 2) {
        var dateTime = scenario[1].split("-");

        if (dateTime.length == 2) {
          data.push({
            scenario: scenario[0],
            date: dateTime[0].split(".").join("-"),
            time: dateTime[1].split(".").join(":"),
            fileName: file,
          });
        }
      }
    }

    event.sender.send("gotKovaakData", data);
  });
});

ipcMain.on("chokidarWatch", (event, config) => {
  const watcher = chokidar.watch(".", { persistent: true, cwd: config.path });

  watcher
    .on("add", (path) => {
      console.log(`Found: ${path}`);

      var object = {};

      var data = path.split(" - Challenge - ").map(
        (stat) =>
          (stat = stat
            .trim()
            .replace(" Stats", "")
            .replace(".csv", ""))
      );

      if (data.length == 2) {
        var datetime = data[1].split("-");
        if (datetime.length == 2) {
          object = {
            scenario: data[0],
            date: datetime[0].split(".").join("-"),
            time: datetime[1].split(".").join(":"),
            fileName: path,
          };
        }
      }

      event.sender.send("chokidarAdd", object);
    })
    .on("unlink", (path) => {
      event.sender.send("chokidarRemove", path);
    })
    .on("ready", () => {
      event.sender.send("chokidarReady");
    });
});
///
/// Save configuration
///
ipcMain.on("saveConfig", (event, config) => {
  //save config
  fs.writeFileSync(
    path.join(app.getPath("userData"), "config.json"),
    JSON.stringify(config)
  );

  //return config
  event.reply("savedConfig", config);
});

///
/// Load configuration
///
ipcMain.on("loadConfig", (event) => {
  console.log("[Configuration] Loading.");
  //get app data path
  var appData = app.getPath("userData");

  var configPath = path.join(appData, "config.json");

  console.log("[Configuration] Path: " + configPath);

  if (fs.existsSync(configPath)) {
    //load config

    fs.readFile(configPath, function(err, data) {
      if (err) return console.error(err);

      console.log("[Configuration] Data: " + data.toString());

      //return config
      event.reply("loadedConfig", JSON.parse(data.toString()));
    });
  } else {
    event.reply("loadedConfig", null);
  }
});
