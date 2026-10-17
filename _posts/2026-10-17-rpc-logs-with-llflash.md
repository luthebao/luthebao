---
title: "Reading the wire — collecting MCGame data from RPC logs with Llflash"
date: 2026-10-17
tags: [flash, rtmp, go, rust, preservation]
summary: >-
  How to run the Flash client in the Llflash desktop player, record every RPC it
  sends and receives as a decoded transcript — against a local MCGame stack or
  the official game — and turn that transcript into data you can query.
---

[MCGame](/2026/10/06/mcgame/) only works if the server matches the Flash client exactly: the same RPC names, the same argument order, the same callback payloads. The decompiled client tells you what the code *could* do. A recording of the traffic tells you what it *actually* does: which RPCs fire when you click a button, in what order, with what values, and which callbacks the client waits for in return.

This post shows how to get that recording with [Llflash](/2026/05/21/long-live-flash/), the Rust Flash Player emulator I maintain, and how to turn it into structured data. The same recording works against two servers: a local MCGame stack, and the official game while it is still online — which is the reference MCGame has to reproduce. MCGame's own dispatcher logs cover the server side of the conversation.

> **Scope.** Record only sessions you are entitled to: your own MCGame stack, or the official game played with your own account. Recording is passive — the logger observes what the unmodified client does and never alters, replays, or injects calls. Treat every log as sensitive: it contains account names, credentials, session tokens, and character data.

## Where the logs come from

An RPC between the client and the server can be seen from two places:

| Source | Sees | Format | Where |
|---|---|---|---|
| **Llflash desktop** (`rtmp_audit`) | Client → server calls, server → client callbacks, connection status | One decoded line per event | `ruffle.log` in the Llflash cache directory, plus stdout |
| **MCGame dispatcher** | Client → server calls as they reach a handler, missing handlers, rejections and failures | Structured zap logs (console or JSON) | `docker logs mcgame-server` and `temp/mcgame-server.log` |

The client-side log is the more useful of the two for data collection. It sees **both directions**, including every callback the server pushes, and it works the same way against any RTMP server, not only MCGame. The server log adds what the client can't see: which calls reached a handler, which had no handler registered, and which failed.

## Part 1 — Client-side transcript with Llflash

### How it works

Llflash's desktop player doesn't hand RTMP traffic straight to its network client. `desktop/src/main.rs` installs three wrapper hooks from `desktop/src/rtmp_log.rs` (`connect`, `close`, `call`) as the `NetConnection` backend. Each outbound call goes through the wrapper, which decodes the AMF0 payload, writes one line, and then forwards the call to the real RTMP/RTMPE client. Inbound events are logged once per frame in `app.rs`, before they are dispatched into the ActionScript runtime.

The lines go to the tracing target `rtmp_audit` at `INFO`. The logger records:

- **outbound `connect`**: URL, SWF URL, page URL, and the extra connect arguments;
- **outbound `call`**: handle, transaction ID, method name, and decoded arguments;
- **inbound `status`**: `NetConnection` status codes such as `NetConnection.Connect.Success`;
- **inbound `server_call`**: the method name and decoded arguments of every server-initiated invoke.

Outbound `close` and inbound `call_result` are not logged. That matters less for MCGame than it sounds: the client mostly gets its data back through named callbacks (`onLogin`, `onChooseCharactor`, `onReadCharData`, …), which arrive as `server_call` and *are* logged.

### Build the desktop player

The RTMP logger is part of the desktop player, not the browser extension. The extension's native messaging host only logs connection-level events. Build the desktop app from the [`long-live-flash`](https://github.com/luthebao/long-live-flash) sources:

```bash
git clone https://github.com/luthebao/long-live-flash.git
cd long-live-flash

make check-deps      # cargo, wasm target, Java, …
make install-deps    # installs whatever is missing (except Java / Node)
make build-desktop   # cargo build --release -p llflash_desktop
```

The binary lands at `target/release/llflash_desktop` (`llflash_desktop.exe` on Windows). On Linux, install the system packages from the repository README first (`libasound2-dev`, `libudev-dev`, a JRE, …).

### Start MCGame

In the `mcgame` checkout:

```bash
make game setup   # first time only
make game up
```

The client loader is served by the nginx edge at `http://localhost:8888/s/sv/GameLoaders.swf`, and the client finds the RTMP server through `frontend/s/sv/profile/config.xml` (`<logic>127.0.0.1:1935/…</logic>`).

### Run the client with the audit log on

The audit target is **off by default**. With no `RUST_LOG`, Llflash uses `warn,ruffle=info,avm_trace=info`, and `rtmp_audit` isn't included. When you set `RUST_LOG` yourself, Llflash adds `rtmp_audit=info` to it automatically, so any value works:

```bash
RUST_LOG=warn ./target/release/llflash_desktop \
  "http://localhost:8888/s/sv/GameLoaders.swf?isExpand=true"
```

On Windows (PowerShell):

```powershell
$env:RUST_LOG = "warn"
.\target\release\llflash_desktop.exe "http://localhost:8888/s/sv/GameLoaders.swf?isExpand=true"
```

To turn the transcript off again while keeping other logs, say so explicitly. If your filter mentions `rtmp_audit`, your setting wins: `RUST_LOG=warn,rtmp_audit=off`.

Log in, pick a line, choose a character, and do whatever you want to record: open a shop, start a fight, claim a reward.

### Find the log file

Lines are printed to stdout and written to a file under the cache directory:

| OS | Default log directory |
|---|---|
| macOS | `~/Library/Caches/ruffle/log/` |
| Linux | `~/.cache/ruffle/log/` |
| Windows | `%LOCALAPPDATA%\ruffle\log\` |

Pass `--cache-directory <dir>` to put it somewhere else. By default the file is a single `ruffle.log` that is **truncated on every launch**. To keep one file per session, open the preferences dialog and set **Log Filename** to the timestamped pattern. The files are then named `ruffle_YYYY-MM-DD_HH-MM-SS.log`.

### What a transcript looks like

A short excerpt (illustrative and trimmed; the real payloads are longer):

```text
2026-10-17T08:01:02.123Z  INFO rtmp_audit: OUTBOUND rtmp connect: handle=1 url="rtmpe://127.0.0.1:1935/master/test/" swf_url="http://localhost:8888/s/sv/GameLoaders.swf" page_url="" extra_args=[…]
2026-10-17T08:01:02.300Z  INFO rtmp_audit: INBOUND  rtmp status: handle=1 code="NetConnection.Connect.Success" level="status"
2026-10-17T08:01:05.410Z  INFO rtmp_audit: OUTBOUND rtmp call: handle=1 txid=4 method="chooseCharactor" args=[1024]
2026-10-17T08:01:05.452Z  INFO rtmp_audit: INBOUND  rtmp server_call: handle=1 method="onChooseCharactor" args=[{…}]
2026-10-17T08:01:06.002Z  INFO rtmp_audit: OUTBOUND rtmp call: handle=1 txid=5 method="checkNetDelay" args=[1760688066002 /* 2026-10-17T08:01:06.002Z */]
```

A few details make the lines easier to read:

- AMF0 objects render as `{key: value, …}` and arrays as `[…]`, all on one line.
- Whole-number doubles print without `.0`. Every AMF0 number is a `float64` on the wire, which is why MCGame handlers type-switch on their arguments.
- Numbers that look like Unix milliseconds get an ISO date comment, which helps with time-sync RPCs.
- Method names keep the client's spelling, typos included (`chooseCharactor`). Copy them exactly.

The renderer also has **truncation limits**. Every log line stays readable, but each line is a summary, not a full dump:

- at most **12** values per payload, object, or array, then `…`;
- strings longer than **96** characters are cut, with a `…(+N)` count of the hidden characters;
- if decoding fails partway, the values that did decode are kept, followed by `…(+N raw bytes)`.

If you need a full payload, such as a large inventory list, use the transcript to find the RPC, then read the full response on the server side (Part 3) or in the handler code.

## Part 2 — Reference sessions from the official game

The most useful transcript is often the one recorded against the original server: it shows exactly which callbacks the real server sends, with which payloads, in which order. Because the logger sits in the client, the same Llflash build works unchanged — only the URL differs.

### Open the account's launch link

The official portal starts the game with a launch link that carries the account credentials as query parameters, for example:

```text
https://s3-vuaphapthuat.goplay.vn/s/s12/GameLoader.swf?user=ABCXYZ&pass=123456
```

- `s12` is the game server the account plays on; use the one from your own link.
- `user` and `pass` are handed to the loader as FlashVars, so the client logs in without a login screen.

Open that link in Llflash with the audit log enabled. Quote the URL: an unquoted `&` would make the shell cut the command in two.

```bash
RUST_LOG=warn ./target/release/llflash_desktop \
  "https://s3-vuaphapthuat.goplay.vn/s/s12/GameLoader.swf?user=ABCXYZ&pass=123456"
```

On Windows (PowerShell), use single quotes:

```powershell
$env:RUST_LOG = "warn"
.\target\release\llflash_desktop.exe 'https://s3-vuaphapthuat.goplay.vn/s/s12/GameLoader.swf?user=ABCXYZ&pass=123456'
```

The loader reads its profile configuration from the official host, so the `connect` line shows the official RTMP endpoint instead of `127.0.0.1:1935`. Everything else from Part 1 — log location, line format, and truncation limits — is the same.

Only the client-side half is available here; the dispatcher logs in Part 3 exist only on your own server. In practice that is enough, because the client transcript already contains every callback the server pushes.

### Keep the credentials out of anything you share

The launch link is equivalent to the account password, and it ends up in the transcript in two places: the `swf_url` on the `connect` line carries the full query string, and the login handshake (`["G", user, pass, time, session, hash]`) carries the username and password-derived values. Before you attach a transcript to an issue, paste it into a chat, or commit it anywhere, redact it:

```bash
U='ABCXYZ'; P='123456'
sed -E \
  -e 's/(user|pass)=[^&" ]*/\1=REDACTED/g' \
  -e "s/${U}/REDACTED_USER/g" \
  -e "s/${P}/REDACTED_PASS/g" \
  ruffle.log > ruffle.redacted.log
```

Escape any regular-expression characters in the username or password, then read the `connect` line and the handshake once by hand to confirm nothing slipped through. Keep the raw log on your own machine, and remember that a launch link typed on the command line also lands in your shell history.

### Compare the official session with MCGame

The point of a reference session is the diff. Perform the same action — the same panel, the same button — once against the official server and once against your local stack, then compare the call sequences with `rpclog` from Part 4:

```bash
bin/rpclog < official.log | jq -r '"\(.direction) \(.method)"' > official.seq
bin/rpclog < local.log    | jq -r '"\(.direction) \(.method)"' > local.seq
diff official.seq local.seq
```

An `in` line present only in `official.seq` is a callback MCGame does not send yet. An `out` line present only there is a call the client never reaches locally, usually because an earlier callback was missing or malformed. Once the method sequence matches, compare the `args` of each pair to check the payloads.

## Part 3 — Server-side view from the MCGame dispatcher

Every RPC that reaches MCGame goes through `internal/infrastructure/rtmp/dispatcher.go`. The dispatcher writes:

- `RPC call received`, with `conn_id`, `method`, `arg_count`, and the **full** decoded `args` (no truncation);
- `Method not found`, when the client called something with no handler registered;
- `RPC call rejected` (expected errors, `WARN`) and `RPC call failed` (unexpected errors, `ERROR`), with the duration and the error.

Follow the logs live:

```bash
docker logs -f mcgame-server
```

The same output is also written to `temp/mcgame-server.log` in the repository, because the container mounts `../temp` at `/app/temp`. To make it machine-readable, set the format to JSON in `docker/.env` and redeploy:

```bash
GAME_LOG_FORMAT=json
GAME_LOG_LEVEL=debug
```

```bash
make game up
```

You can then query it with `jq`:

```bash
# Every RPC with no server handler yet: your to-do list
jq -r 'select(.msg == "Method not found") | .method' temp/mcgame-server.log | sort | uniq -c | sort -rn

# Full arguments of one method
jq -c 'select(.msg == "RPC call received" and .method == "chooseCharactor") | .args' temp/mcgame-server.log
```

### The `quietMethods` caveat

Some methods are deliberately **not** logged on the server. The dispatcher has a `quietMethods` map that silences chatty or already-verified RPCs (`checkNetDelay`, `sceneLogin`, `chooseCharactor`, `getShopConfig`, and others) so Docker logs stay readable. Those methods still appear in the Llflash transcript, which sits on the client and ignores that map. To see one on the server too, set its entry to `false` in `dispatcher.go`, rebuild with `make game up`, and switch it back once you're done.

## Part 4 — Turning the transcript into data

A text log is fine for reading through a single session. For anything bigger, such as comparing sessions, counting calls, or building a list of every callback a feature uses, convert it to JSON Lines. Here is a small standalone Go program that reads an Llflash log on stdin and writes one JSON object per call or callback:

```go
package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strconv"
)

type Event struct {
	Time      string `json:"time"`
	Direction string `json:"direction"`
	Handle    int    `json:"handle"`
	TxID      int    `json:"txid,omitempty"`
	Method    string `json:"method"`
	Args      string `json:"args"`
}

var (
	outbound = regexp.MustCompile(`^(\S+)\s+INFO rtmp_audit: OUTBOUND rtmp call: handle=(\d+) txid=(\d+) method=("(?:[^"\\]|\\.)*") args=(.*)$`)
	inbound  = regexp.MustCompile(`^(\S+)\s+INFO rtmp_audit: INBOUND  rtmp server_call: handle=(\d+) method=("(?:[^"\\]|\\.)*") args=(.*)$`)
)

func main() {
	summary := flag.Bool("summary", false, "print call counts per method instead of JSONL")
	flag.Parse()

	counts := map[string]int{}
	enc := json.NewEncoder(os.Stdout)
	sc := bufio.NewScanner(os.Stdin)
	sc.Buffer(make([]byte, 1024*1024), 1024*1024)

	for sc.Scan() {
		var ev Event
		line := sc.Text()
		if m := outbound.FindStringSubmatch(line); m != nil {
			ev = Event{Time: m[1], Direction: "out", Method: unquote(m[4]), Args: m[5]}
			ev.Handle, _ = strconv.Atoi(m[2])
			ev.TxID, _ = strconv.Atoi(m[3])
		} else if m := inbound.FindStringSubmatch(line); m != nil {
			ev = Event{Time: m[1], Direction: "in", Method: unquote(m[3]), Args: m[4]}
			ev.Handle, _ = strconv.Atoi(m[2])
		} else {
			continue
		}
		counts[ev.Direction+" "+ev.Method]++
		if !*summary {
			enc.Encode(ev)
		}
	}

	if *summary {
		keys := make([]string, 0, len(counts))
		for k := range counts {
			keys = append(keys, k)
		}
		sort.Slice(keys, func(i, j int) bool { return counts[keys[i]] > counts[keys[j]] })
		for _, k := range keys {
			fmt.Printf("%6d  %s\n", counts[k], k)
		}
	}
}

func unquote(s string) string {
	if u, err := strconv.Unquote(s); err == nil {
		return u
	}
	return s
}
```

Save it as `main.go` in an empty directory, run `go mod init rpclog`, then:

```bash
go build -o bin/rpclog .

# One JSON object per call / callback
bin/rpclog < ~/.cache/ruffle/log/ruffle.log > session.jsonl

# Which RPCs did this session use, and how often?
bin/rpclog -summary < ~/.cache/ruffle/log/ruffle.log
```

`args` stays a string on purpose: it is the renderer's summary format, not JSON, and may be truncated. Use it to compare values and spot patterns, not as a full copy of the payload.

## A workflow for collecting a feature's data

Putting the pieces together, this is how I capture a single feature, for example a shop or a daily reward panel:

1. **Start clean.** Set **Log Filename** to the timestamped pattern so every session gets its own file, then launch Llflash with `RUST_LOG=warn`.
2. **Record the reference.** While the official game is online, open your account's launch link and perform only the action you are studying, then quit. Short transcripts are much easier to read than an evening of play.
3. **Extract the sequence.** Run `rpclog` on the session file and read the `out` → `in` pairs in order. That sequence is the contract: the method the client sends, its argument order and types, and the callbacks it expects.
4. **Replay it locally.** Perform the same action against your MCGame stack and diff the two sequences, as in Part 2.
5. **Cross-check with the client.** Find each callback name in `docs/client/system/CallBack.as` or `CallBackGlobal.as` to see which payload keys the client actually reads.
6. **Cross-check with the server.** In `temp/mcgame-server.log`, look for `Method not found` (not implemented yet) and `RPC call failed` (implemented but broken), and read the untruncated `args`.
7. **Write it down.** Record what you learned in the feature's `docs/memory/<feature>.md` in the MCGame repository, with redacted transcript excerpts, so the next person doesn't have to capture it again.

## Troubleshooting

- **No `rtmp_audit` lines at all.** `RUST_LOG` isn't set (the default filter leaves the target off), or your filter contains `rtmp_audit=off`. Also check that you are running the desktop player and not the browser extension.
- **The log file is empty after a restart.** The single-file pattern truncates `ruffle.log` on every launch. Switch to the timestamped pattern.
- **The official launch link opens a blank or partial window.** Check that the whole URL, including `&pass=…`, reached Llflash — an unquoted `&` drops everything after it. An expired or changed link fails the same way; get a fresh one from the portal.
- **`connect` is logged, but there is no `Connect.Success`.** Check that the compose stack is up (`make game up`), that port `1935` is free, and that `config.xml` points at the right host.
- **A call shows up in Llflash but not in the server log.** It is probably in `quietMethods`. If it isn't, check for a `Rate limited` warning: some high-frequency methods (`udcr`, `udcp`, `cbom`) are dropped silently when they hit their rate limit.

With both logs running, you can see every RPC from both ends of the connection, and in most cases that tells you what a feature needs before you open the decompiled client.
