<div align="center">

# RootDB

**Can you root it?**

Crowdsourced Android root database. Search by exact model number. Know instantly if your variant is rootable.

[rootdb.xyz](https://rootdb.xyz) · [Report Bug](https://github.com/rootdb-xyz/rootdb/issues) · [Add a Device](https://rootdb.xyz/submit/device)

</div>

---

## What

Every Android phone has multiple variants. The Galaxy S10 `SM-G973F` (Exynos, Global) is fully rootable. The `SM-G973U` (Snapdragon, US Carrier) is permanently locked. RootDB tracks every variant separately so you don't waste money on the wrong one.

- **Search** by model number, codename, or device name
- **Per-variant** SoC, root score (0–100), and bootloader status
- **Interactive guides** that adapt to your Android/OneUI version
- **Community votes** — "Works" / "Bootloops" / "Partial" per variant
- **Free file hosting** — upload tools to Catbox/Gofile from your browser
- **Trust system** — earn points, bypass mod review at 100

Built with Next.js 15, Tailwind v4 (Catppuccin), YAML data, Vercel KV. Built with the assistance of AI (Claude).

## Quick Start

``` bash
git clone https://github.com/rootdb-xyz/rootdb.git
cd rootdb && npm install
cp .env.local.example .env.local
npm run dev
```

Auth is optional for dev. See [DEPLOY.md](./DEPLOY.md) for production.

## Structure

```
data/           YAML device/guide/block files (the database)
app/            Next.js pages and API routes
components/     React components
lib/            Data engine, utils, store, auth
```

## License

Code: [AGPL-3.0](./LICENSE) · Data: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

<sub>Not affiliated with Google, Samsung, or Magisk. Root at your own risk.</sub>

<sub>RootDB has been made almost entirely by AI</sub>