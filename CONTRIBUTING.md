# Contributing

## Quick Ways to Help

| What | Where | Difficulty |
|---|---|---|
| Add a device | [rootdb.xyz/submit/device](https://rootdb.xyz/submit/device) | Easy |
| Create a guide | [rootdb.xyz/editor](https://rootdb.xyz/editor) | Medium |
| Upload a tool | [rootdb.xyz/upload](https://rootdb.xyz/upload) → [submit links](https://rootdb.xyz/submit) | Easy |
| Fix data | Edit YAML → open PR | Medium |
| Fix code | Fork → fix → PR | Harder |

## Device YAML

``` yaml
# data/devices/[brand]/[series]/[codename].yml
name: Galaxy S10
soc: Exynos 9820
ram: 8GB
launch_os: Android 9

variants:
  - model: SM-G973F
    soc: Exynos 9820
    region_id: global
    tags: [unlockable_bootloader, magisk, kernelsu]
    guide_ids: [magisk-samsung-exynos]

  - model: SM-G973U
    soc: Snapdragon 855
    region_id: us_carrier
    tags: [locked_bootloader]
```

## Rules

1. One variant per model number — Exynos ≠ Snapdragon
2. No hardcoded strings — use dictionary slugs
3. No step numbers in blocks — the engine numbers them
4. Run `npm run build` before opening a PR

## Trust Score

| Action | Points |
|---|---|
| Device approved | +10 |
| Guide approved | +15 |
| Download submitted | +5 |
| Edit approved | +3 |
| Vote cast | +1 |

100 points = Trusted Contributor (bypass mod review).

## Development

``` bash
git clone https://github.com/rootdb-xyz/rootdb.git
cd rootdb && npm install
cp .env.local.example .env.local
npm run dev
```