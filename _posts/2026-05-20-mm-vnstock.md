---
title: "MMStock — Native terminal for the Vietnamese stock-futures market"
date: 2026-05-20
tags: [odin, trading, desktop]
summary: >-
  A native desktop terminal for the Vietnamese stock-futures market, written in
  Odin — charts, indicators, and a real-time VPS feed with no backend in between.
---

**MMStock** is a native desktop terminal for the Vietnamese stock-futures market. It connects directly to the VPS data feed (`web7.vps.com.vn`), with no intermediate backend, and renders charts, indicators, and the real-time price stream entirely on the client.

The app is written in [Odin](https://odin-lang.org/) on top of [Sokol](https://github.com/floooh/sokol), [Dear ImGui](https://github.com/ocornut/imgui), and [ImPlot](https://github.com/epezent/implot). Builds are available for macOS (Apple Silicon and Intel), Linux x86_64, and Windows x86_64.

<figure>
  <img src="{{ '/assets/img/posts/mmstock/terminal.png' | relative_url }}" alt="MMStock terminal showing two side-by-side chart panels with candlesticks, VPVR volume-by-price overlays, BLT-MACD and BLT-RSI indicator subpanels, and a multi-timeframe table">
  <figcaption>MMStock — two chart panels with VPVR overlays and the BLT-MACD/RSI indicators</figcaption>
</figure>

## Download

[**Download MMStock**](https://github.com/luthebao/luthebao/releases/tag/mmstock) — macOS and Windows builds available on the release page.

### One-liner install

**macOS / Linux:**

```sh
curl -fsSL https://github.com/luthebao/luthebao/releases/download/mmstock/install.sh | sh
```

**Windows (PowerShell):**

```powershell
irm https://github.com/luthebao/luthebao/releases/download/mmstock/install.ps1 | iex
```

## What it does

- **Charts** — candlestick, line, and Heiken Ashi, across multiple timeframes (1m, 5m, 15m, 30m, 1H, 4H, 8H, 1D, 1W, 1M).
- **Real-time stream** — live prices over WSS, historical bars over HTTPS, both from VPS directly.
- **Drawing tools** — per-chart horizontal line, rectangle, and point-line annotations.
- **Indicators**
  - **VPVR** — volume-by-price overlay.
  - **BLT-ID-RSI** — a Pine-script port combining RSI with Fast (RMA 5) and Slow (WMA 45) moving averages, regular and hidden bull/bear divergence detection, a VMC gold buy signal, a Stoch-RSI sell signal, and a configurable multi-timeframe table.

## Architecture

MMStock is a single Odin binary containing the user interface (ImGui and ImPlot rendered through Sokol), the VPS HTTPS and WSS client, and a local SQLite store for cached bars. There is no server-side component to deploy: the terminal is the entire application, and updates are delivered as new binaries.

## Why a native client

There are two reasons. First, rendering tens of thousands of bars at 60 fps with smooth pan and zoom is straightforward with ImPlot but difficult in a browser. Second, connecting directly to the market data feed removes an entire infrastructure layer — no API gateway, backend cache, or message queue — leaving fewer components to fail and nothing to host.

## Status

MMStock is under active development. The Vietnamese stock-futures market is a specialised audience, so the product is shaped primarily around my own trading workflow, with the aim of making it equally useful to anyone with similar needs.
