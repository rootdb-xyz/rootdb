import jwt from "jsonwebtoken";

const GITHUB_ORG = "rootdb-xyz";
const DATA_REPO = "data";

const APP_ID = process.env.GITHUB_APP_ID;
const PRIVATE_KEY = (process.env.GITHUB_APP_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n"
);
const INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID;

export function isGitHubAppConfigured(): boolean {
  return !!(APP_ID && PRIVATE_KEY && INSTALLATION_ID);
}

// ── Generate a JWT signed with the App's private key ──
function generateJWT(): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iat: now - 60, // issued 60s ago to account for clock drift
      exp: now + 600, // expires in 10 minutes
      iss: APP_ID,
    },
    PRIVATE_KEY,
    { algorithm: "RS256" }
  );
}

// ── Exchange JWT for a short-lived installation token ──
async function getInstallationToken(): Promise<string> {
  const jwtToken = generateJWT();

  const res = await fetch(
    `https://api.github.com/app/installations/${INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get installation token: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.token;
}

// ── GitHub API helper ──
async function githubApi(
  endpoint: string,
  token: string,
  options?: { method?: string; body?: unknown }
) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${DATA_REPO}${endpoint}`,
    {
      method: options?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  return res.json();
}

// ── Create a PR with files ──

interface CreatePROptions {
  title: string;
  body: string;
  branch: string;
  files: { path: string; content: string }[];
}

export async function createDataPR({
  title,
  body,
  branch,
  files,
}: CreatePROptions): Promise<{ pr_url: string; pr_number: number }> {
  if (!isGitHubAppConfigured()) {
    throw new Error("GitHub App not configured");
  }

  // Get a fresh installation token (expires in 1 hour)
  const token = await getInstallationToken();

  // 1. Get the SHA of main branch
  const mainRef = await githubApi("/git/ref/heads/main", token);
  const mainSha = mainRef.object.sha;

  // 2. Create a new branch from main
  try {
    await githubApi("/git/refs", token, {
      method: "POST",
      body: { ref: `refs/heads/${branch}`, sha: mainSha },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes("422"))) throw err;
    // 422 = branch exists, that's fine
  }

  // 3. Create/update each file on the new branch
  for (const file of files) {
    let existingSha: string | undefined;
    try {
      const existing = await githubApi(
        `/contents/${file.path}?ref=${branch}`,
        token
      );
      existingSha = existing.sha;
    } catch {
      // File doesn't exist — creating new
    }

    await githubApi(`/contents/${file.path}`, token, {
      method: "PUT",
      body: {
        message: `Add ${file.path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
      },
    });
  }

  // 4. Create the pull request
  const pr = await githubApi("/pulls", token, {
    method: "POST",
    body: {
      title,
      body,
      head: branch,
      base: "main",
    },
  });

  return { pr_url: pr.html_url, pr_number: pr.number };
}