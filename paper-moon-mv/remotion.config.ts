/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

// Remotion's own Chrome download is unusably slow behind this machine's proxy (~2.8 MB/min for ~150 MB),
// so reuse the Chrome Headless Shell playwright already installed. Guarded by existsSync: on a machine
// where that path is absent (or in CI) this line is skipped and Remotion falls back to its own browser.
const localChrome =
  process.env.REMOTION_CHROME ??
  "C:\\Users\\Lenovo\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1243\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
if (existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
