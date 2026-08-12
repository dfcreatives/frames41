# Pushing to `dfcreatives/frames41`

## Current Remote
```bash
git remote -v
# origin  https://github.com/dfcreatives/frames41.git (fetch)
# origin  https://github.com/dfcreatives/frames41.git (push)
```

## Quick Push (using token inline)
If you get a "Repository not found" or authentication error, run:
```bash
git push https://dfcreatives:<YOUR_TOKEN>@github.com/dfcreatives/frames41.git main
```

> Replace `<YOUR_TOKEN>` with your actual GitHub personal access token.

## Push and Set Upstream
If this is a new branch or you need to set upstream tracking:
```bash
git push https://dfcreatives:<YOUR_TOKEN>@github.com/dfcreatives/frames41.git main -u
```

## Store Credentials (optional, for convenience)
To avoid typing the token every time, enable git credential storage:
```bash
git config credential.helper store
git push https://dfcreatives:<YOUR_TOKEN>@github.com/dfcreatives/frames41.git main
```
Git will save the credentials locally and future pushes can use:
```bash
git push origin main
```

## ⚠️ Security Note
- Never commit tokens or `.env` files to GitHub.
- If using `credential.helper store`, credentials are saved in plain text at `~/.git-credentials`.
- For better security, use `credential.helper osxkeychain` (macOS) or rotate tokens regularly.
