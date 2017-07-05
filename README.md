# maintainerd

Maintaining a successful OSS project _takes time_, and will often involve a lot of repetitive chores.  But should we do busy work when we can automate all that pain away?  We're engineers, after all!

Meet `maintainerd`: your OSS maintenance [daemon][1].  Think of it as your own personal minion, dedicated to dotting all the I's and crossing all the T's behind the scenes, leaving you with more time to do the work you'd prefer to be doing.

This project was born out of my need to streamline the maintenance process for my OSS projects: primarily [freactal](https://github.com/FormidableLabs/freactal), [Rapscallion](https://github.com/FormidableLabs/rapscallion), and [GitSavvy](https://github.com/divmain/GitSavvy).  Before I published more of the projects in my queue, it seems prudent to ensure I don't get overloaded.

One quick note: I wrote `maintainerd` to solve my problems, but I'm making it available to the rest of the developer community too.  If you want to help pay for server costs, or just want to say thanks, you can make a donation [here](https://donorbox.org/maintainerd).  Thanks in advance!

[1]: https://en.wikipedia.org/wiki/Daemon_(computing)


## Features

The list is ever growing, but here's a list of the things that `maintainerd` can do for you:

- stuff
- things


## How does it work?

1. [Install the GitHub integration](https://github.com/apps/maintainerd).
2. Add a `.maintainerd` file to the root of your project (see below for details).
3. Sit back and let `maintainerd` do its thing!


## Configuration

The `.maintainerd` file is used by the service to determine which actions to take and when.  The file is in YAML format, and supports the following settings:

### `pullRequest`

This is a top-level category for pull request management.

```yaml
log: true
pullRequest:
  preamble: >
    The maintainers of this repo require that all pull request submitters agree and adhere
    to the following:
  items:
    - prompt: >
        I have read the [Contributor License Agreement](http://google.com), and indicate
        my agreement by checking this box.
      default: false
      required: true
    - prompt: All related documentation has been updated to reflect the changes made.
      default: false
      required: true
    - prompt: My commit messages are cleaned up and ready to merge.
      default: false
      required: true
  semver:
    enabled: true
    autodetect: true
commit:
  subject:
    mustHaveLengthBetween: [8, 72]
    mustMatch:
      - !!js/regexp /.*/
    mustNotMatch:
      - !!js/regexp /^fixup!/
  message:
    maxLines: 20
    minLines: 1
    enforceEmptySecondLine: true
    linesMustHaveLengthBetween: [0, 72]
issue:
  onLabelAdded:
    not-enough-information:
      action: comment
      data: >
        This issue has been tagged with the `not-enough-information` label.  In order for us to help you, please respond with the following information:

        - A description of the problem, including any relevant error output that you find in the Sublime console.
        - blah, blah, blah

        If we receive no response to this issue within 2 weeks, the issue will be closed.  If that happens, feel free to re-open with the requested information.  Thank you!
```

## Semantic Versioning

One of the options that `maintainerd` supplies is a [semver](http://semver.org) selection.  However, this option isn't very useful unless that information is easily accessible.  `maintainerd` provides a simple API for that purpose:

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

More selections may be added in the future.More selections may be added in the future.


#### NPM Packages

Should you desire to do so, you can use the above API to auto-publish NPM packages at the granularity of a pull request.

To accomplish this, you can add something like the following to the `deploy` stage of your CI of choice:

```sh
#!/usr/bin/env bash

PULL_REQUEST_NUMBER=$(git show HEAD --format=format:%s | sed -nE 's/Merge pull request #([0-9]+).*/\1/p')

if [ -z "$PULL_REQUEST_NUMBER" ]; then
    echo "No pull request number found; aborting publish."
else
    echo "Detected pull request #$PULL_REQUEST_NUMBER."
    SEMVER_CHANGE=$(curl "https://maintainerd.divmain.com/api/semver?repoPath=abc/xyz&installationId=55555&prNumber=$PULL_REQUEST_NUMBER")
    if [ -z "$SEMVER_CHANGE" ]; then
        echo "No semver selection found; aborting publish."
    else
        echo "Detected semantic version change of $SEMVER_CHANGE."

        # CI might leave the working directory in an unclean state.
        git reset --hard

        eval npm version "$SEMVER_CHANGE"
        npm publish

        git config --global user.name "My Bot User"
        git config --global user.email "my-bot@user.com"

        git remote add origin-deploy https://${GH_TOKEN}@github.com/abc/xyz.git > /dev/null 2>&1
        git push --quiet --tags origin-deploy master

        echo "Done!"
    fi
fi
```

#### Git Tags

If you use Git tags for version tracking, you can auto-increment and push those tags back to GitHub.

```sh
#!/usr/bin/env bash

PULL_REQUEST_NUMBER=$(git show HEAD --format=format:%s | sed -nE 's/Merge pull request #([0-9]+).*/\1/p')

if [ -z "$PULL_REQUEST_NUMBER" ]; then
    echo "No pull request number found; aborting publish."
else
    echo "Detected pull request #$PULL_REQUEST_NUMBER."
    SEMVER_CHANGE=$(curl "https://maintainerd.divmain.com/api/semver?repoPath=abc/xyz&installationId=55555&prNumber=$PULL_REQUEST_NUMBER")
    if [ -z "$SEMVER_CHANGE" ]; then
        echo "No semver selection found; aborting publish."
    else
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
        fi

        git config --global user.name "My Bot User"
        git config --global user.email "my-bot@user.com"

        # CI might leave the working directory in an unclean state.
        git reset --hard
        git tag -a "${VERSION_ARRAY[0]}.${VERSION_ARRAY[1]}.${VERSION_ARRAY[2]}" -m "v${VERSION_ARRAY[0]}.${VERSION_ARRAY[1]}.${VERSION_ARRAY[2]}"

        git remote add origin-deploy https://${GH_TOKEN}@github.com/abc/xyz.git > /dev/null 2>&1
        git push --quiet --tags origin-deploy master

        echo "Done!"
    fi
fi
```


