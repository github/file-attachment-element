## Contributing

[fork]: https://github.com/github/file-attachment-element/fork
[pr]: https://github.com/github/file-attachment-element/compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE).

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Submitting a pull request

0. [Fork][fork] and clone the repository
0. Configure and install the dependencies: `script/bootstrap`
0. Make sure the tests pass on your machine: `rake`
0. Create a new branch: `git checkout -b my-branch-name`
0. Make your change, add tests, and make sure the tests still pass
0. Push to your fork and [submit a pull request][pr]
0. Pat your self on the back and wait for your pull request to be reviewed and merged.

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Write tests.
- Keep your change as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

## Publishing

Publishing requires write access to the repository.

### Creating a release

1. Run `npm version <version> --no-git-tag-version` to update the version in `package.json` and `package-lock.json`.
2. Open a pull request with the version change and merge it into the default branch.
3. Create a GitHub release from the merged commit, using the new version as the tag (for example, `3.3.0`).
4. Confirm that the [Publish workflow](https://github.com/github/file-attachment-element/actions/workflows/publish.yml) completes successfully. Creating the release triggers this workflow, which publishes the package to npm.

### Publishing manually

To publish an existing version tag without creating another release:

1. Open the [Publish workflow](https://github.com/github/file-attachment-element/actions/workflows/publish.yml).
2. Select **Run workflow**.
3. Enter the existing version tag in **Existing tag version to publish** and run the workflow.
4. Confirm that the workflow completes successfully.

The same workflow can be started with GitHub CLI:

```sh
gh workflow run publish.yml --field tag_version=<version>
```

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [GitHub Help](https://help.github.com)
