const fs = require("fs");
const path = require("path");

const GITHUB_USER = "JamilCPU";
const OUT_FILE = path.join(__dirname, "..", "src", "data", "repos.json");

async function fetchRepos() {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=owner`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "jamilwhitehead.dev",
      },
    },
  );

  if (!res.ok) {
    console.error(`GitHub API returned ${res.status}: ${res.statusText}`);
    process.exit(1);
  }

  const allRepos = await res.json();

  const repos = allRepos
    .filter((r) => !r.fork && !r.archived && r.name !== "jamilwhitehead.dev")
    .map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      updated_at: r.updated_at,
    }))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), repos }, null, 2));

  console.log(`Wrote ${repos.length} repos to ${OUT_FILE}`);
}

fetchRepos();
