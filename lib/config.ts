export const siteConfig = {
  name: "RootDB",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  github: {
    org: "rootdb-xyz",
    dataRepo: "data",
    siteRepo: "rootdb",
    get dataRepoUrl() {
      return `https://github.com/${this.org}/${this.dataRepo}`;
    },
    get siteRepoUrl() {
      return `https://github.com/${this.org}/${this.siteRepo}`;
    },
    get issuesUrl() {
      return `${this.siteRepoUrl}/issues`;
    },
    get newDeviceUrl() {
      return `${this.dataRepoUrl}/new/main/data/devices`;
    },
    get newGuideUrl() {
      return `${this.dataRepoUrl}/new/main/data/guides`;
    },
  },
  description:
    "Crowdsourced Android root database. Verify rootability by exact model number — including tricky US carrier variants.",
};