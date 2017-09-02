# maintainerd

Maintaining a successful OSS project _takes time_, and will often involve a lot of repetitive chores.  But why should we do busy work when we can automate all that pain away?  We're engineers, after all!

Meet `maintainerd`: your OSS maintenance [daemon][1].  Think of it as your own personal minion, dedicated to dotting all the I's and crossing all the T's behind the scenes, leaving you with more time to do the work you'd prefer to be doing.

This project was born out of my need to streamline the maintenance process for my OSS projects: primarily [freactal](https://github.com/FormidableLabs/freactal), [Rapscallion](https://github.com/FormidableLabs/rapscallion), and [GitSavvy](https://github.com/divmain/GitSavvy).  Before I published more of the projects in my queue, it seemed prudent to ensure I wouldn't get overloaded.

One quick note: I wrote `maintainerd` to solve my own problems, but I'm making it available to the rest of the developer community too.  If you want to help pay for server costs, or just want to show your appreciation, you can make a donation [here](https://donorbox.org/maintainerd).  Thanks in advance!

[1]: https://en.wikipedia.org/wiki/Daemon_(computing)


## How does it work?

1. [Install the GitHub integration](https://github.com/apps/maintainerd).
2. Add a `.maintainerd` file to the root of your project (see below for details).
3. Sit back and let `maintainerd` do its thing!


## Configuration

The `.maintainerd` file is used by the service to determine which actions to take and when.  The file is in YAML format, and supports the following settings:

```yaml
# maintainerd can keep a log of all interactions with the Pull Request
# integrations as a comment in your PR.
log: true
# This contains all pull request related config options.
pullRequest:
  # maintainerd will insert checkboxes and other information for the
  # PR submitter to interact with.  The preamble is the text inserted
  # before all of that.
  preamble: >
    The maintainers of this repo require that all pull request submitters agree and adhere
    to the following:
  # Check boxes that will be inserted into the PR description.
  items:
    - prompt: >
        I have read the [Contributor License Agreement](http://google.com), and indicate
        my agreement by checking this box.
      # If `default` is true, it will start in the checked state.
      default: false
      # If `required` is true, the PR will not be allowed to be merged before
      # the checkbox is checked.
      required: true
    - prompt: All related documentation has been updated to reflect the changes made.
      default: false
      required: true
    - prompt: My commit messages are cleaned up and ready to merge.
      default: false
      required: true
  # maintainerd can ask the submitter whether the pull request represents a
  # "major", "minor", "patch", or "documentation only" level change
  semver:
    enabled: true
# maintainerd can also enforce certain rules on the commits that are submitted
commit:
  subject:
    # Length restrictions for the first line in each commit.
    mustHaveLengthBetween: [8, 72]
    # Regular expressions that must match the first line in each commit.
    mustMatch:
      - !!js/regexp /.*/
    # Regular expressions that must NOT match the first line in each commit.
    mustNotMatch:
      - !!js/regexp /^fixup!/
  # More rules for other lines in a commmit message.
  message:
    maxLines: 20
    minLines: 1
    enforceEmptySecondLine: true
    linesMustHaveLengthBetween: [0, 72]
# maintainerd can also help you with managing issues.
issue:
  # When a label is added to an issue...
  onLabelAdded:
    # And that label is equal to "not-enough-information"...
    not-enough-information:
      # A comment will be added to the issue...
      action: comment
      # With the following content.
      data: |
        This issue has been tagged with the `not-enough-information` label.
        In order for us to help you, please respond with the following
        information:

        - A description of the problem, including any relevant error output...
        - blah, blah, blah

        If we receive no response to this issue within 2 weeks, the issue will
        be closed.  If that happens, feel free to re-open with the requested
        information.  Thank you!
```

## Semantic Versioning

One of the options that `maintainerd` can insert into each pull request is [semantic version](http://semver.org) selection.  However, this option isn't very useful unless the selection that was made is easily accessible outside of the PR (in a script, for example).  `maintainerd` provides a simple API for that purpose:

`GET https://maintainerd.divmain.com/api/semver?repoPath=XYZ&prNumber=XYZ&installationId=XYZ`

You need to provide three options:

- `repoPath`: The combination of owner and repository name, e.g. `divmain/maintainerd`.
- `prNumber`: The number of the pull request in that repository.
- `installationId`: The ID for your GitHub installation of `maintainerd`.  This can be found by browsing [here](https://github.com/settings/installations), finding `maintainerd` in the list, and clicking the `Configure` button next to it.  The installation ID will be the last segment of the URL.

The response will be a 200 with a text body containing one of:

- `major`
- `minor`
- `patch`
- `documentation only`

More selections may be added in the future.


### npm Packages

Should you desire to do so, you can use the above API to auto-publish npm packages at the granularity of a pull request.

To accomplish this, add something like the following to the `deploy` stage of your CI of choice:

```sh
#!/usr/bin/env bash

PULL_REQUEST_NUMBER=$(git show HEAD --format=format:%s | sed -nE 's/Merge pull request #([0-9]+).*/\1/p')

if [ -z "$PULL_REQUEST_NUMBER" ]; then
    echo "No pull request number found; aborting publish."
    exit 0
fi

echo "Detected pull request #$PULL_REQUEST_NUMBER."
SEMVER_CHANGE=$(curl "https://maintainerd.divmain.com/api/semver?repoPath=abc/xyz&installationId=55555&prNumber=$PULL_REQUEST_NUMBER")
if [ -z "$SEMVER_CHANGE" ]; then
    echo "No semver selection found; aborting publish."
    exit 0
fi

echo "Detected semantic version change of $SEMVER_CHANGE."

# CI might leave the working directory in an unclean state.
git reset --hard

git config --global user.name "My Bot User"
git config --global user.email "my-bot@user.com"

eval npm version "$SEMVER_CHANGE"
npm publish

git remote add origin-deploy https://${GH_TOKEN}@github.com/abc/xyz.git > /dev/null 2>&1
git push --quiet --tags origin-deploy master

echo "Done!"

```

### Git Tags

If you use Git tags for version tracking, you can auto-increment and push those tags back to GitHub, too.

```sh
#!/usr/bin/env bash

PULL_REQUEST_NUMBER=$(git show HEAD --format=format:%s | sed -nE 's/Merge pull request #([0-9]+).*/\1/p')

if [ -z "$PULL_REQUEST_NUMBER" ]; then
    echo "No pull request number found; aborting publish."
    exit 0
fi

echo "Detected pull request #$PULL_REQUEST_NUMBER."
SEMVER_CHANGE=$(curl "https://maintainerd.divmain.com/api/semver?repoPath=abc/xyz&installationId=55555&prNumber=$PULL_REQUEST_NUMBER")
if [ -z "$SEMVER_CHANGE" ]; then
    echo "No semver selection found; aborting publish."
fi

echo "Detected semantic version change of $SEMVER_CHANGE."
MOST_RECENT_TAG=$(git describe --abbrev=0)
VERSION_ARRAY=( ${MOST_RECENT_TAG//./ } )

if [ "$SEMVER_CHANGE" == "major" ]; then
    ((VERSION_ARRAY[0]++))
    VERSION_ARRAY[1]=0
    VERSION_ARRAY[2]=0
elif [ "$SEMVER_CHANGE" == "minor" ]; then
    ((VERSION_ARRAY[1]++))
    VERSION_ARRAY[2]=0
elif [ "$SEMVER_CHANGE" == "patch" ]; then
    ((VERSION_ARRAY[2]++))
else
    echo "Matching semantic version not found; aborting publish."
    exit 1
fi

git config --global user.name "My Bot User"
git config --global user.email "my-bot@user.com"

# CI might leave the working directory in an unclean state.
git reset --hard
git tag -a "${VERSION_ARRAY[0]}.${VERSION_ARRAY[1]}.${VERSION_ARRAY[2]}" -m "v${VERSION_ARRAY[0]}.${VERSION_ARRAY[1]}.${VERSION_ARRAY[2]}"

git remote add origin-deploy https://${GH_TOKEN}@github.com/abc/xyz.git > /dev/null 2>&1
git push --quiet --tags origin-deploy master

echo "Done!"
```


## Development

Once you've made the change, run lint and start the application to ensure your code is clear of errors.

```bash
npm run lint
npm run start
```

## License

This project is published under the MIT license.

If you do find it useful, please consider contributing your changes back and/or making a donation [here](https://donorbox.org/maintainerd) to cover server costs.
