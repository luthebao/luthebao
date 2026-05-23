---
title: "Llflash — A Flash Player emulator in Rust, with a one-line RTMP host install"
date: 2026-05-21
---

**Llflash** is an Adobe Flash Player emulator written in [Rust](https://www.rust-lang.org/), targeting both desktop and the web via WebAssembly. It's a fork of [Ruffle](https://ruffle.rs/) with one headline addition: **RTMP support**, delivered through a small native messaging host that pairs with the browser extension. The rest of the runtime tracks upstream — ActionScript 1, 2, and 3 are all supported, enough to bring most legacy `.swf` content back to life: games, animations, learning tools, and the multiplayer-streaming SWFs that vanilla Ruffle can't reach because browsers don't expose raw TCP.

Desktop builds and the RTMP native messaging host are published on the [`llflash` release](https://github.com/luthebao/luthebao/releases/tag/llflash). Questions, bug reports, and feature requests go through the [luthebao discussions tab](https://github.com/luthebao/luthebao/discussions) — there's no public issue tracker.

## Setup in three steps

1. **Install the browser extension.** *Coming soon* — the Chrome Web Store / Firefox Add-ons listing isn't published yet. Until then, you can side-load the unpacked extension from the [release page](https://github.com/luthebao/luthebao/releases/tag/llflash).
2. **Install the RTMP native messaging host** with the one-liner for your OS (see below). This is the small out-of-process helper that lets SWFs reach `rtmp://` servers.
3. **Visit any page that uses Flash.** The extension picks up `.swf` embeds automatically and routes RTMP traffic through the host you just installed — no per-site configuration.

## Install the RTMP native messaging host

Llflash plays static SWFs entirely in the browser, but **RTMP-based content** (legacy live-streaming SWFs, multiplayer games that talk to `rtmp://` servers) needs an out-of-process helper — browsers can't open raw TCP sockets. The **RTMP native messaging host** is a small Rust binary the browser extension launches over Chrome / Firefox's native-messaging protocol. Once registered, RTMP traffic inside any SWF is routed through it transparently.

Pick the line that matches your OS.

### macOS / Linux

```bash
curl -fsSL https://github.com/luthebao/luthebao/releases/download/llflash/rtmp-host-install.sh | bash
```

Supports **macOS (Apple Silicon)** and **Linux x86_64**. The script downloads the latest release tarball, drops the binary under `~/.llflash/rtmp-host/`, and writes the native-messaging manifest (`com.longliveflash.rtmp_host`) into the right per-browser directory. Default target is Chrome — pass a browser name to install for a different one:

```bash
# chrome | chromium | edge | brave | firefox | all
curl -fsSL https://github.com/luthebao/luthebao/releases/download/llflash/rtmp-host-install.sh | bash -s -- firefox
```

### Windows

In **PowerShell**:

```powershell
irm https://github.com/luthebao/luthebao/releases/download/llflash/rtmp-host-install.ps1 | iex
```

Same behaviour as the bash version: pulls the latest zip, extracts to `%LOCALAPPDATA%\LongLiveFlash\rtmp-host\`, and registers the native-messaging manifest. To pass a browser argument, save the script first and run it locally:

```powershell
$u = 'https://github.com/luthebao/luthebao/releases/download/llflash/rtmp-host-install.ps1'
iwr $u -OutFile rtmp-host-install.ps1
PowerShell -ExecutionPolicy Bypass -File .\rtmp-host-install.ps1 all
```

After install, restart your browser and reload the extension — the host appears under `chrome://extensions/` (or the Firefox equivalent) and RTMP-backed SWFs should connect straight away.

### Environment overrides

Both scripts honour the same overrides if you need to pin a specific release or change the install location:

| Variable              | Default                                                                            |
|-----------------------|------------------------------------------------------------------------------------|
| `LLFLASH_REPO`        | `luthebao/luthebao`                                                                |
| `LLFLASH_TAG`         | `llflash`                                                                          |
| `LLFLASH_INSTALL_DIR` | `~/.llflash/rtmp-host` (Unix) / `%LOCALAPPDATA%\LongLiveFlash\rtmp-host` (Windows) |

## Desktop builds

Standalone desktop builds are listed on the [release page](https://github.com/luthebao/luthebao/releases/tag/llflash) alongside the install scripts:

- `llflash-rtmp-host-1.1.0-macOS-arm64.tar.gz`
- `llflash-rtmp-host-1.1.0-Linux-x64.tar.gz`
- `llflash-rtmp-host-1.1.0-Windows-x64.zip`

Each archive contains the host binary plus the install script for that platform — useful if you'd rather audit the script and run it offline instead of piping from `curl`.

## Relationship to Ruffle

Llflash is a fork of [Ruffle](https://github.com/ruffle-rs/ruffle), not a rewrite. The AVM1/AVM2 interpreters, the renderer, and the SWF parser are Ruffle's work — credit and thanks go to that project and its contributors. What this fork adds is the `rtmp://` path: the `llflash-rtmp-host` binary you just installed terminates the RTMP/RTMPE/RTMPT protocols outside the browser sandbox, and a thin bridge inside the wasm module forwards `NetConnection` / `NetStream` traffic to it. With that in place, SWFs that depend on Flash Media Server, Wowza, or any RTMP origin keep working — which is the gap that kept a noticeable slice of legacy Flash content from running under stock Ruffle.

Everything else — including most ActionScript edge cases, codec coverage, and the desktop player — behaves like upstream Ruffle. Questions, bug reports, and feature requests live on the [luthebao discussions tab](https://github.com/luthebao/luthebao/discussions) (the source repo is private, so there's no public issue tracker)

## Privacy

Long Live Flash respects user privacy. The browser extension searches website HTML for embedded Flash content without storing or transmitting browsing activity.

Flash content may store data locally using browser LocalStorage APIs and make network requests to third-party servers, potentially transmitting personally identifiable or "fingerprintable" information. The `llflash-rtmp-host` extends that surface in one direction only: when a SWF opens an `rtmp://` connection, the host establishes a TCP connection to that origin on the SWF's behalf. Llflash itself does not inspect, log, or retain RTMP payloads — they pass through the host and back to the wasm runtime — but the destination server will see traffic from your IP address, exactly as it would have under the original Flash Player.

LLFlash stores settings locally via the browser's extension storage API. These settings don't contain identifying information and aren't transmitted to servers.

When errors occur, users can optionally submit crash reports through the [luthebao discussions tab](https://github.com/luthebao/luthebao/discussions). These reports include browser and site information but aren't stored or transmitted without explicit user consent.

The project is a fork of [Ruffle](https://github.com/ruffle-rs/ruffle), which is open-source; LLflash's additions are distributed via the [release page](https://github.com/luthebao/luthebao/releases/tag/llflash) above.

Users should exercise caution with untrusted content. LLflash isn't responsible for third-party privacy practices, and we encourage reviewing the applicable privacy policies and terms of the websites and services visited.
