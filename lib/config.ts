const isDev = process.env.NODE_ENV === "development";

export const siteConfig = {
  name: "RootDB",
  url: isDev ? "http://localhost:3000" : "https://rootdb.xyz",
  github: {
    org: "rootdb-xyz",
    dataRepo: "rootdb-data",
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