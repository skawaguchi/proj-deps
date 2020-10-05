# Project Dependency CLI

This CLI leverages the GitHub API to get package.json files to pull dependencies. This is useful for pulling quick reports on the source code being packaged in your products.

If you do not understand the difference between `dependencies`, `devDependencies`, and `peerDependencies` in `package.json`, the [npm documentation](https://docs.npmjs.com/files/package.json#dependencies) explains the nuances.

Similarly, it is helpful to know the difference between `^`, `~`, and modules without any leading character. You can read about it in the npm docs for [tilde](https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1) and [caret](https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004) ranges, or try it out using the [npm semver calculator](https://semver.npmjs.com/).

## Prerequisites

Please consider using [nvm](https://github.com/nvm-sh/nvm) if you aren't already.

If it is installed, run `nvm use` to set your node to the version used in this project. Or refer to `package.json` > `engines` to find the correct version to use.

## Installation

Install the CLI globally.

```sh
npm i proj-deps -g
```

## Setup

Before you are able to use the CLI, you must do some configuration:

- Set up a token so that your queries to the GitHub API are accepted.
- Set up a project config to identify the repos you would like to query.

### Authentication

You must have a GitHub Token to access any repository through the GitHub API. If you don't already have one, follow [these instructions](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token). This CLI will work with any repo that you have access to.

You must define a `.env` with a variable, such as `GITHUB_TOKEN`. You will need to get this from your GitHub account. This ensures that you have access to the repo(s) you're trying to pull from. Your file should look like this:

```env
GITHUB_TOKEN=yourToken
```

The `.env` file is local and you should be the only one with access to it. It is in `.gitignore` because it should never be committed.

### Project Configuration

Refer to `./config/example-config.json`. Copy it and modify it for the repositories you would like to pull `package.json` from. **You can only query one npm registry at a time.**

`githubAPI` is the GraphQL URL for the registry you are targeting. Usually, you will simply append `/graphql` to the GitHub URL you use.

#### Configuration JSON Structure

- `githubAPI`: The path to the GitHub registry you want to query.
- `githubTokenName`: Your personal access token to the repository.
- `repositories`: An array of repositories within the GitHub registry that you would like to query.

  - `owner` and `name`: The repository identifiers which should appear in its URL: `https://<registry>/<owner>/<name>`
  - `packages`: An array of the `package.json` files you would like to query.

    - `branch`: The git branch you are targeting. The most likely one you are after is `master`.
    - `filepath`: The path from the branch root to the `package.json`. For a root level reference, exclude `./` and just use `package.json`.

## Usage

Once your auth token and configuration are set up, you can attempt to use the CLI. Run this command to print out the example config:

```sh
projdeps report
```

You should see a file generated at `./dependendcy-report.md` and console output similar to this:

```md
# Project Dependencies

Generated: 2020-10-05T06:49:15.299Z

## carbon-components-react

### carbon-components-react

* @carbon/icons-react: ^0.0.1-beta.4
* classnames: 2.2.6
* downshift: ^1.31.14
* flatpickr: 4.5.5
* focus-trap-react: ^6.0.0
* invariant: ^2.2.3
* lodash.debounce: ^4.0.8
* lodash.isequal: ^4.5.0
* lodash.omit: ^4.5.0
* react-is: ^16.8.6
* warning: ^3.0.0
* window-or-global: ^1.0.1
```

You must pass the path to a config JSON file that follows the structure defined below.

```sh
projdeps report --path <path to config file from your current directory>
```

## Testing

Verify all checks pass (linting + unit tests):

```sh
npm run verify
```

Run linting:

```sh
npm run lint
```

Run unit tests:

```sh
npm run test
```

Run in watch mode:

```sh
npm run test:watch
```

Generate an HTML coverage report:

```sh
npm run test:coverage
```

## Note on Rate Limits

This hasn't been tested, but there are rate limits to calls to GitHub. It's unlikely that you'll run into these, but you should be aware that they exist. Refer to the [GitHub docs](https://docs.github.com/en/free-pro-team@latest/developers/apps/rate-limits-for-github-apps#user-to-server-requests).
