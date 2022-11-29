# The Social Chef
[Design Brief](https://docs.google.com/document/d/1XavWZOlGL7jBrrykMamLBcF5EM_BlJkfgyi-KXZl2t8/edit)

## IDE
Highly Recommended to use VSCode because format settings are written in .vscode/settings.json.

## Getting started with Express app

### Clone the project
```
git clone https://github.com/YukiOkamoto0206/social-chef.git
```

### Install libraries from package.json
```
npm i
```

### Create a .env file.
DO NOT commit your environmental variables like api key or database password. If you do not know .env file, let me know or check .sample.env file.

### Run the project
```
// Encourage you to use this, because this command is hot-reload with nodemon.
npm run dev
```
Go http://localhost:3000/

## Work on the project

### Create a new branch

```
git checkout -b <new branch name>
```

### Add your code changes to the git staging area
```
git add 〇〇.js 〇〇.ejs
```

### Commit your changes
The commit message should be structured as follows:
#### Do NOT do huge commit
Small commit makes us
- Easy to check pull request
- Easy to revert
- Less bugs

more details [here](https://betterprogramming.pub/why-you-should-write-small-git-commits-c9a042737aa6)

#### Two types of prefix
- **feat** : new feature
- **fix** : bug fix
```
git commit -m "feat: fetch the recipes api"
```

### Push your changes
```
git push origin <branch name>
```

## Pull Request
After you push your changes to your branch, create Pull Request in the GitHub. If you don't know how to use it, check [here](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request?tool=webui).

## Check Pull Request
If somebody create a pull request or fix it, GitHub automatically send the message through the slack. The others can check it.

## How to change the branch from yours to others
Do not change the branch before commiting or stashing your current branch.

### Change the repository
```
// update new information from GitHub
$ git checkout main
$ git pull origin main
// change the branch that you want
$ git checkout <branch that you want to checkout>
// if somebody install new library, you need it.
$ npm i
// check whether it works or not
$ npm run dev
```

If you find something wrong, PLEASE comment in GitHub, if not, approve the pull request. If 3 of all(except for the person who create pull request) approve it, MEARGE the branch to main.

## Stash command
```
git stash -u
git stash list
git stash apply stash@{0}

```
