# Impact India — Civic Issue Reporting Prototype

Built for Smart India Hackathon (TTS25-08 — Government of Jharkhand, Clean & Green Technology theme).

A multi-role civic reporting platform prototype: Citizen, Volunteer, Authority, and NGO views, with AI-simulated
issue classification, severity/impact scoring, duplicate clustering, a priority queue, and community action tracking.

> This is a frontend prototype. AI classification, severity estimation, and duplicate detection are simulated with
> rule-based logic, structured to be swapped for a real model + backend later.

## Push this to GitHub

From this folder:

```bash
git init
git add .
git commit -m "Initial commit: Impact India prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Get a live link (GitHub Pages)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys automatically
on every push to `main`.

One-time setup after your first push:
1. Go to your repo on GitHub → **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push again (or re-run the workflow from the **Actions** tab) if it doesn't trigger automatically.

Your live URL will be:
```
https://<your-username>.github.io/<your-repo>/
```

That link is what you should share — it opens the actual running app instead of raw code, the same way your
IKIP project is hosted.

## Local development

```bash
npm install
npm run dev
```

## Build locally

```bash
npm run build
npm run preview
```
