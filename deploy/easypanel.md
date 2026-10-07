# Private GitHub deployment with Easypanel

## Publish the source

Create an empty PRIVATE GitHub repository named `benj-fitness`. Do not initialize it with a README. In the local project folder, run:

```powershell
git add .
git diff --cached --stat
git commit -m "Initial Benj Fitness app"
git remote add origin https://github.com/YOUR_USERNAME/benj-fitness.git
git push -u origin main
```

Review the staged files before committing. Never publish journal exports, access keys, certificates, or server backups. The ignore rules exclude common secret/data paths but cannot identify every manually named export. GitHub Desktop can publish the existing local repository instead; leave the private-repository option enabled.

## Easypanel settings

1. Source: GitHub. Configure access to the private repository using a narrowly scoped GitHub credential. Repository: `YOUR_USERNAME/benj-fitness`, branch: `main`, build path: `/`.
2. Build: Dockerfile, path: `Dockerfile`. Do not select the inline Dockerfile SOURCE tab.
3. Environment: set the following values in Easypanel, not GitHub:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=4173
PUBLIC_ORIGIN=https://fitness.benedictjan.com
FITNESS_DATA_DIR=/data
FITNESS_ACCESS_KEY=REPLACE_WITH_A_RANDOM_SECRET
```

Generate the secret on a trusted machine with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Store it in a password manager; do not paste it into chat or commit it. Leave Create env file disabled; the application reads environment variables directly.

4. Storage: add a named volume at `/data`. The runtime user has UID/GID 1000. Verify it can write the mounted directory; fix only this dedicated volume's ownership if necessary. Do not switch the whole container to root or use chmod 777.
5. Domains: `fitness.benedictjan.com`, internal HTTP, target port `4173`, HTTPS enabled. Remove any automatic public service domain. Leave published ports empty.
6. Resources: start with 256 MB memory and 0.5 CPU limits. Use ONE replica and disable overlapping/zero-downtime deployments: the JSON storage does not support multiple writer processes. Export a backup before deployments.
7. Deploy and review logs. Confirm `/api/health` reports `storageConfigured: true`, then verify private saves and a journal reload after restarting the service. Turn on auto deploy only after this first deployment succeeds.

## Cloudflare and migration

Keep the fitness A record proxied. Use a valid origin certificate and Full (strict) SSL for this hostname, without disrupting the main site's settings. Protect the fitness hostname with Cloudflare Access restricted to your email. Orange-cloud DNS alone does not prevent direct origin access: enforce origin protection separately through Access-token validation, appropriately scoped proxy/firewall rules, or a Tunnel. Do not apply broad firewall changes without checking the other apps and administrator access.

Export the localhost journal, import it at the hosted address, then connect the app's private key. Never add the journal to GitHub. Back up the volume outside the VPS and test restoring a backup. A Git rollback does not roll back journal data.

## Updates

```powershell
npm.cmd test
git add .
git diff --cached --stat
git commit -m "Describe the update"
git push
```

Deploy the new commit manually in Easypanel, or use its GitHub auto-deploy integration after reviewing changes. Keep base images and Easypanel updated. This container is non-root and copies only runtime files, but deployment hardening is not a substitute for securing the VPS.

Reference: https://easypanel.io/docs/services/app
