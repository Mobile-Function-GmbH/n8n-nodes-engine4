# Contributing

This document is for developers working on `n8n-nodes-engine4`. For using the node, see the [README](README.md).

## Prerequisites

- Node.js 24 (LTS) and npm
- Access to an ENGINE4 instance with the External API enabled, for testing
- Write access to this repository

## Setup

```powershell
npm ci
```

```powershell
npm run dev
```

`npm run dev` builds the node, starts a local n8n with the node installed and rebuilds on every change (initial start takes some time). Open n8n in the browser, create an **ENGINE4 API** credential and add the **ENGINE4** node to a workflow.

## Scripts

| Command            | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `npm run dev`      | Start a local n8n with the node and rebuild on changes             |
| `npm run build`    | Build the node into `dist`                                         |
| `npm run lint`     | Check the code with the n8n lint rules                             |
| `npm run lint:fix` | Fix lint issues that can be fixed automatically                    |
| `npm run scan`     | Build and check the package with the n8n community package scanner |

## Project structure

```
credentials/
  Engine4Api.credentials.ts   ENGINE4 API credential (login, token, credential test)
nodes/
  Engine4/
    Engine4.node.ts           Node definition and router for all actions
    Engine4.node.json         Codex file (category, documentation links)
    engine4.svg, .dark.svg    Node icons
    actions/record/           One file per action (fields + execute function)
      index.ts                Operation dropdown, exports all actions
  helpers/
    api.ts                    All requests to the ENGINE4 External API
    fields.ts                 Reusable UI fields (entity, view, filters, ...)
    functions.ts              Dropdown, search and field mapping methods
    records.ts                Saving records (Create, Create in View, Update)
    types.ts                  Types of the ENGINE4 API
.github/workflows/
  ci.yml                      Lint and build on every pull request and push to main
  publish.yml                 Publishes to npm when a version tag is pushed
  scan.yml                    Runs the n8n community package scanner (manual)
.agents/                      Guidelines for building n8n nodes (also used by AI agents)
```

## Adding an action

1. Create a new file in `nodes/Engine4/actions/record/`, e.g. `{{actionName}}.ts`. It exports:
   - `description`: the fields of the action, built with the helpers from `nodes/helpers/fields.ts` and `showFor('record', ['actionName'])`
   - `execute`: the function that runs the action for one item
2. Add the operation to the dropdown in `actions/record/index.ts` and export the new file there.
3. Add a `case 'record:actionName'` to the router in `Engine4.node.ts`.
4. Put new API requests into `nodes/helpers/api.ts`.
5. Describe the action in the README and add it to the CHANGELOG.

## Guidelines

- Follow the n8n [UX guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/) and [verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/). They are required for the node to stay verified.
- All texts in the node and the documentation are in English.
- No runtime dependencies, no access to environment variables or files.
- `npm run lint` and `npm run build` must pass without errors before a pull request is merged.
- Changes that break existing workflows (renamed or moved parameters, changed output) need a new node version. See [.agents/versioning.md](.agents/versioning.md).

## Workflow

1. Create a branch from `main`.
2. Make your changes and test them with `npm run dev`.
3. Open a pull request to `main`. The CI workflow runs lint and build.
4. Merge once CI is green and the change is reviewed.

## Releasing

Releases are published to npm by GitHub Actions with npm provenance, which n8n requires for verified nodes. Never publish from your own machine.

1. Create a release branch from `main`.

2. Set the new version in `package.json` and `package-lock.json` (replace `1.2.3` with the new version):

   ```powershell
   npm version 1.2.3 --no-git-tag-version
   ```

3. _(Optional)_ Scan the package locally, so problems show up before anything is published:

   ```powershell
   npm run scan
   ```

   The scan must end with `✅ … has passed the security checks that run before publishing`. The provenance and source checks are skipped, because they only work for a published version. They run in step 9.

4. Commit, open a pull request to `main` and merge it once CI is green.

5. Update your local `main`:

   ```powershell
   git checkout main
   ```

   ```powershell
   git pull
   ```

6. Create the tag. It must match the version exactly:

   ```powershell
   git tag 1.2.3
   ```

7. Push the tag. This starts the **Publish** workflow:

   ```powershell
   git push origin 1.2.3
   ```

8. On GitHub under **Actions**, check that the **Publish** workflow is green.

9. Run **Actions → Scan community package → Run workflow** and check that the scan passes.

10. Check that npm serves the new version:

```powershell
npm view n8n-nodes-engine4 dist-tags
```

`latest` must show the new version.

Do not use `npm run release`. It only works directly on `main`, overwrites the CHANGELOG with generated text and needs a `GITHUB_TOKEN`.

### If the Publish workflow fails

Nothing was published, so the version number can be used again. Fix the problem on a branch, merge it to `main`, then move the tag to the new commit:

```powershell
git tag -d 1.2.3
```

```powershell
git push origin :refs/tags/1.2.3
```

Then repeat steps 5 to 10.

If the version was already published, it can never be published again. Release the fix as the next patch version instead.
