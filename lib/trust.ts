import fs from "fs";
import path from "path";

const TRUST_DIR = path.join(process.cwd(), "data", "users");

export interface TrustProfile {
  github_id: string;
  github_username: string;
  trust_score: number;
  badges: string[];
  contributions: {
    devices_added: number;
    guides_written: number;
    downloads_submitted: number;
    votes_cast: number;
    edits_approved: number;
  };
  is_trusted: boolean;
  created_at: string;
  updated_at: string;
}

const TRUSTED_THRESHOLD = 100;

const SCORE_VALUES = {
  device_approved: 10,
  guide_approved: 15,
  download_approved: 5,
  edit_approved: 3,
  vote_cast: 1,
};

export function getProfile(githubId: string): TrustProfile | null {
  try {
    const raw = fs.readFileSync(path.join(TRUST_DIR, `${githubId}.json`), "utf-8");
    return JSON.parse(raw);
  } catch { return null; }
}

export function upsertProfile(githubId: string, githubUsername: string): TrustProfile {
  const existing = getProfile(githubId);
  if (existing) return existing;

  const profile: TrustProfile = {
    github_id: githubId,
    github_username: githubUsername,
    trust_score: 0,
    badges: ["newcomer"],
    contributions: { devices_added: 0, guides_written: 0, downloads_submitted: 0, votes_cast: 0, edits_approved: 0 },
    is_trusted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveProfile(profile);
  return profile;
}

export function addContribution(githubId: string, type: keyof typeof SCORE_VALUES): TrustProfile | null {
  const profile = getProfile(githubId);
  if (!profile) return null;

  profile.trust_score += SCORE_VALUES[type];
  profile.updated_at = new Date().toISOString();

  switch (type) {
    case "device_approved": profile.contributions.devices_added++; break;
    case "guide_approved": profile.contributions.guides_written++; break;
    case "download_approved": profile.contributions.downloads_submitted++; break;
    case "edit_approved": profile.contributions.edits_approved++; break;
    case "vote_cast": profile.contributions.votes_cast++; break;
  }

  const totalApproved =
    profile.contributions.devices_added + profile.contributions.guides_written +
    profile.contributions.downloads_submitted + profile.contributions.edits_approved;

  if (totalApproved >= 1 && !profile.badges.includes("first_contribution")) profile.badges.push("first_contribution");
  if (totalApproved >= 10 && !profile.badges.includes("contributor")) profile.badges.push("contributor");
  if (totalApproved >= 50 && !profile.badges.includes("power_contributor")) profile.badges.push("power_contributor");
  if (profile.contributions.votes_cast >= 25 && !profile.badges.includes("active_voter")) profile.badges.push("active_voter");

  profile.is_trusted = profile.trust_score >= TRUSTED_THRESHOLD;
  if (profile.is_trusted && !profile.badges.includes("trusted")) profile.badges.push("trusted");

  saveProfile(profile);
  return profile;
}

function saveProfile(profile: TrustProfile) {
  fs.mkdirSync(TRUST_DIR, { recursive: true });
  fs.writeFileSync(path.join(TRUST_DIR, `${profile.github_id}.json`), JSON.stringify(profile, null, 2));
}

export function getAllProfiles(): TrustProfile[] {
  try {
    return fs.readdirSync(TRUST_DIR).filter((f) => f.endsWith(".json")).map((f) => {
      try { return JSON.parse(fs.readFileSync(path.join(TRUST_DIR, f), "utf-8")); }
      catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}