# Impact India — Civic Issue Reporting Prototype

Impact India is a civic issue-reporting platform prototype developed for **Smart India Hackathon (TTS25-08)** under the Government of Jharkhand's Clean and Green Technology theme.

The prototype presents role-based experiences for citizens, volunteers, authorities, and NGOs to support civic issue reporting and community action.

## Problem space

Civic issues can be difficult to report, prioritize, track, and coordinate across the people and organizations involved. This prototype explores a shared workflow for organizing reports and making their status and priority easier to understand.

## Prototype capabilities

- Separate views for citizens, volunteers, authorities, and NGOs.
- Issue classification using simulated, rule-based logic.
- Severity and impact scoring using simulated logic.
- Duplicate-issue clustering using simulated logic.
- A priority queue for organizing reported issues.
- Community action tracking.

## Important implementation note

**This repository is a frontend prototype.** The README and project implementation describe AI classification, severity estimation, and duplicate detection as simulated/rule-based functionality. These should not be represented as a deployed AI model or production backend.

## Technology

The package manifest identifies:

- React
- Vite
- Recharts
- Lucide React
- Tailwind CSS tooling

## Getting started

### Prerequisites
- Node.js
- npm

### Install dependencies
```bash
npm install
```

### Run locally
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview the build
```bash
npm run preview
```

## Deployment

The repository includes a GitHub Actions deployment workflow according to the existing project documentation. Configure the repository's Pages settings to use GitHub Actions before relying on a public deployment URL. Verify the workflow run and published URL in GitHub before sharing them.

## Future improvements

- Connect reporting and status workflows to a persistent backend.
- Replace simulated classification and scoring with validated services or models.
- Add tests for issue submission, prioritization, and role-based flows.
- Include verified screenshots and a deployment link.
- Document the data model, limitations, and privacy considerations.
