import fs from "node:fs/promises";
import path from "node:path";

const graphqlUrl = process.env.GH_GRAPHQL_API_URL
const token = process.env.GH_AUTHORIZATION_TOKEN;
const username = process.env.GH_USERNAME;
const topic = process.env.GH_TOPIC;
const outputFile = process.env.GH_REPOS_OUTPUT_FILE;

const gqlPath = path.resolve(process.cwd(), "resources/getProjects.gql");
const rawGql = await fs.readFile(gqlPath, "utf8");
const query = rawGql.
  replace("<GH_USERNAME>", username).
  replace("<GH_TOPIC>", topic);

function Project(name, description, languages, url, homepageUrl, release, isArchived) {
    this.name=name // string
    this.description=description // string
    this.languages=languages // languages.nodes.foreach(name)
    this.url=url // string --> see project
    this.homepageUrl=homepageUrl // string --> live version
    this.release=release // string | null - release.url --> latest version (installers)
    this.isArchived=isArchived // bool
}

const response = await fetch(graphqlUrl, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "build-time-repo-fetcher"
  },
  body: JSON.stringify({ query })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`${response.status}: Error getting Github projects - `, errorText);
  process.exit(1);
}

const payload = await response.json();

if (payload.errors) {
  console.error("Error fetching projects: ", payload.errors);
  process.exit(1);
}

const rawNodes = payload.data?.search?.nodes ?? [];

// Limpiamos y normalizamos los datos para el frontend vanilla
const repos = rawNodes.map(repo => {
  const languages = repo.languages.nodes.map(lang => lang.name)
  const release = repo.latestRelease?.url || ""

  return new Project(
    repo.name,
    repo.description,
    languages,
    repo.url,
    repo.homepageUrl,
    release,
    repo.isArchived
  );
});

const output = {
  generatedAt: new Date().toISOString(),
  count: repos.length,
  repos
};

const resolvedPath = path.resolve(process.cwd(), "out", outputFile);
await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
await fs.writeFile(resolvedPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`${outputFile} generated. ${repos.length} repositories found`);
