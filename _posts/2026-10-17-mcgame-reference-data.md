---
title: "Collecting reference data from the official server for MCGame"
date: 2026-10-17
tags: [flash, rtmp, preservation, mcgame]
summary: >-
  A high-level guide to recording what the official game server actually sends,
  and turning those recordings into contributions to the MCGame project.
---

[MCGame](/2026/10/06/mcgame/) is only as good as its fidelity to the original game. Every RPC name, argument, and callback payload has to match what the unmodified Flash client expects. The decompiled client shows what the code *can* do; only the official server shows what actually happens in practice — which callbacks arrive, in what order, and with what data.

This post outlines how to collect that reference data from the official server and turn it into useful contributions to the [mcgame repository](https://github.com/luthebao/mcgame). It is deliberately an overview rather than a step-by-step manual: the tools evolve, but the workflow stays the same.

> **Ground rules.** Use only your own account. Record passively: observe what the unmodified client does, and never modify, replay, or inject calls against the official server. Treat every recording as sensitive, because it contains your credentials, session tokens, and character data.

## Why reference data matters

Most MCGame features start from a gap: a panel that opens empty, a button that does nothing, a callback the client waits for and never receives. Closing that gap requires three things the client code alone cannot reliably provide:

- **The sequence** — which calls the client makes for a given action, and which callbacks the server answers with.
- **The shape** — argument order and types, and the exact payload keys the client reads.
- **Realistic values** — item IDs, rewards, configuration, and timing that make the feature behave like the original.

A recording of a real session against the official server provides all three.

## Where to observe the traffic

The client talks to the server over encrypted RTMP (RTMPE) with AMF0 payloads, so network sniffing tools see only ciphertext. The practical vantage point is the **client itself**: run the game in a Flash runtime that can log RPCs after decryption and decoding.

[Llflash](/2026/05/21/long-live-flash/), the Rust Flash Player emulator I maintain, does this in its desktop build. With its RPC audit log enabled, it writes one decoded line for every outbound call and every inbound server callback. Because the logger lives in the client, it works the same against the official server and against a local MCGame stack — which is exactly what makes comparisons possible.

## Starting a session with your own account

The official portal launches the game through a link that carries the account's credentials as query parameters, for example:

```text
https://s3-vuaphapthuat.goplay.vn/s/s12/GameLoader.swf?user=ABCXYZ&pass=123456
```

Here `s12` identifies the game server, and `user` / `pass` let the loader sign in directly. Opening your own launch link in the logging-enabled runtime produces a transcript of the whole session, from the connection handshake onward.

Treat that link as a password. It ends up in the recording — in the connection details and the login handshake — so redact the username, password, and session tokens before sharing a transcript anywhere, and keep raw recordings on your own machine.

## Recording sessions that are useful

A good recording is short and focused. In practice:

- **One feature per session.** Log in, perform only the action you are studying — open a shop, claim a reward, start a fight — and quit.
- **Cover the variations.** Record the success case, then the edge cases: insufficient currency, a full inventory, an already-claimed reward. Error callbacks are part of the contract too.
- **Note the context.** Write down what you did and what the screen showed, so the transcript can be read later without guessing.

## Comparing against MCGame

The most valuable step is the comparison. Perform the same action against a local MCGame stack, record it the same way, and compare the two call sequences:

- A **callback present only in the official recording** is one MCGame does not send yet.
- A **call present only in the official recording** is one the client never reaches locally, usually because an earlier callback was missing or malformed.
- When the sequences match, compare the **payloads** pair by pair to find wrong keys, types, or values.

MCGame's own server logs complement this view: they show which calls reached a handler, which had no handler registered, and which failed.

## Turning findings into a contribution

Reference data is most useful once it is written down where others can build on it. The mcgame repository has a place for each stage:

1. **Research notes** — what you observed, with redacted transcript excerpts, go under `docs/research/` following the repository's naming convention.
2. **An issue** — describe the gap between the official behaviour and MCGame, and link the research note. This is the best place to discuss scope before writing code.
3. **A pull request** — implement the missing handler or fix the payload, following the conventions in the repository's contributing guidelines: method names exactly as the client spells them, payload keys as the client expects, and long SQL in Postgres functions.
4. **Feature memory** — once a feature works, record what you learned in its `docs/memory/` entry so the next contributor does not have to capture it again.

Partial contributions are welcome. A clean, redacted recording of a single feature, with notes on what it shows, is already valuable — someone else can pick up the implementation.

## Closing

The official servers will not be online forever, and every session recorded now is data that cannot be recovered later. If you still play, a few focused recordings — collected carefully and shared responsibly — are one of the most effective ways to help MCGame stay faithful to the original game.
