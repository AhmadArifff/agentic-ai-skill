# stack-diagram

[![Release](https://img.shields.io/github/v/release/caru-ini/stack-diagram)](https://github.com/caru-ini/stack-diagram/releases/latest)
[![License](https://img.shields.io/github/license/caru-ini/stack-diagram)](LICENSE)
[![skills.sh](https://skills.sh/b/caru-ini/stack-diagram)](https://skills.sh/caru-ini/stack-diagram)

Describe your stack in a sentence. Get an architecture diagram with official logos.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/hero-dark.png">
  <img src="docs/hero.png" alt="Architecture diagram: a user reaches Next.js on Vercel over HTTPS; Next.js calls a Hono API in the same Vercel deployment over RPC; Hono queries Neon over SQL and calls Clerk for sessions and Stripe for checkout; GitHub Actions deploys" width="100%">
</picture>

> Diagram our stack: Next.js and a Hono API on Vercel. Postgres on Neon, auth with Clerk, payments with Stripe. GitHub Actions deploys.

```bash
npx skills add caru-ini/stack-diagram
```

Works with Claude Code, Codex, Cursor and [other agents that support skills](https://agentskills.io). In the Claude apps, upload `stack-diagram.zip` from [Releases](https://github.com/caru-ini/stack-diagram/releases/latest) as a skill.

## More examples

<table>
  <tr>
    <td width="50%" valign="top">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/tooling-dark.png">
        <img src="docs/tooling.png" alt="Monorepo tooling diagram: a developer pushes to GitHub Actions, which runs Turborepo and publishes to npm; inside the pnpm workspace, Lefthook runs Biome before each commit and Turborepo runs Biome and Vitest" width="100%">
      </picture>
      <p><b>Dev tooling, not just clouds</b></p>
      <blockquote>Draw our monorepo tooling: a pnpm workspace with Turborepo, Biome, Vitest and Lefthook. GitHub Actions runs CI and publishes to npm.</blockquote>
    </td>
    <td width="50%" valign="top">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/ai-dark.png">
        <img src="docs/ai.png" alt="AI app diagram: a user asks Next.js on Vercel, which runs a vector search on Supabase pgvector and sends a prompt to Claude; Inngest syncs Notion docs every night and stores embeddings in Supabase" width="100%">
      </picture>
      <p><b>AI apps</b></p>
      <blockquote>Draw our docs chatbot: Next.js on Vercel searches Supabase pgvector and answers with Claude. Inngest syncs Notion every night.</blockquote>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/aws-dark.png">
        <img src="docs/aws.png" alt="AWS diagram: a user reaches CloudFront over HTTPS; CloudFront serves static paths from S3 and sends API paths to an ALB in a VPC's public subnet; the ALB forwards to Fargate in a private subnet, which queries RDS over SQL and uses ElastiCache as a cache" width="100%">
      </picture>
      <p><b>AWS, with AWS's own icons</b></p>
      <blockquote>Draw our app on AWS: CloudFront in front of S3 and an ALB in a public subnet. Fargate, RDS and ElastiCache sit in a private subnet.</blockquote>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/gcp-dark.png">
        <img src="docs/gcp.png" alt="Google Cloud diagram: a user reaches Cloud Load Balancing over HTTPS; the load balancer serves static paths from Cloud Storage and sends API paths to GKE in one region of a VPC; GKE queries Cloud SQL over SQL and uses Memorystore as a cache" width="100%">
      </picture>
      <p><b>Google Cloud, with Google's own icons</b></p>
      <blockquote>Draw our app on Google Cloud: a global load balancer in front of Cloud Storage and GKE. GKE, Cloud SQL and Memorystore run in one region of a VPC.</blockquote>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/azure-dark.png">
        <img src="docs/azure.png" alt="Azure diagram: a user reaches Azure Front Door over HTTPS; Front Door serves static paths from Azure Blob Storage and sends API paths to Azure App Service in the Japan East region; App Service queries Azure SQL Database over SQL and uses Azure Managed Redis as a cache, both through private endpoints in a virtual network" width="100%">
      </picture>
      <p><b>Azure, with Microsoft's own icons</b></p>
      <blockquote>Draw our app on Azure: Front Door in front of Blob Storage and App Service. App Service reaches Azure SQL and Managed Redis through private endpoints in a VNet.</blockquote>
    </td>
  </tr>
</table>

## Light and dark

Every diagram is rendered in both themes. Tiles stay white so logos keep their own colors, and group labels switch to the brand's dark-theme logo.

<img src="docs/light-dark.png" alt="The monorepo tooling diagram cut diagonally: light theme on the upper left, dark theme on the lower right" width="100%">

## Share it as an artifact

The diagram is one HTML file with its fonts and logos inlined, so it renders anywhere without a network. Publish it as a Claude artifact and share the link, or drop it into a repo or wiki. The PNGs and the React component are rendered from the same file.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/html-page-dark.png">
  <img src="docs/html-page.png" alt="The docs chatbot diagram as an HTML page in a browser window, with a title, a short description, the diagram, a legend and a footer" width="100%">
</picture>

## Share it to the gallery

After drawing, the agent offers once to post the diagram to the public gallery at https://stacks.caru.moe. It shows what will be public (the light and dark PNGs, an English title, the tech stack and a display name) and posts only after you say yes twice. Your prompt is never sent. A GitHub login is optional and never shown; it only lets you delete the post later. The site's source is in [`site/`](site).

## What you get

- **Official logos, fetched for you.** From [svgl](https://svgl.app), then [devicon](https://devicon.dev), then [gilbarbara/logos](https://github.com/gilbarbara/logos), or the brand's own repository. AWS, Google Cloud, Azure and Kubernetes icons come from each vendor's own package: [AWS](https://aws.amazon.com/architecture/icons/), [Google Cloud](https://cloud.google.com/icons), [Azure](https://learn.microsoft.com/en-us/azure/architecture/icons/), [Kubernetes](https://github.com/kubernetes/community/tree/master/icons). Never recolored or redrawn.
- **No arrows through text.** Lines are routed around labels, and the agent renders the diagram and checks it before handing it over.
- **The format you need.** A self-contained HTML file (default), PNG, a dependency-free React component, or an Artifact.

Requires Python 3.9+ and network access for the logos. PNG export uses Playwright with Chromium.

## Star history

<a href="https://www.star-history.com/?repos=caru-ini%2Fstack-diagram&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=caru-ini/stack-diagram&type=date&theme=dark&legend=top-left">
    <img src="https://api.star-history.com/chart?repos=caru-ini/stack-diagram&type=date&legend=top-left" alt="Chart of GitHub stars for caru-ini/stack-diagram over time" width="100%">
  </picture>
</a>

## Licenses and trademarks

- Code and docs: MIT — see `LICENSE`.
- Bundled fonts: SIL Open Font License 1.1 — see `skills/stack-diagram/assets/fonts/`.
- Logos are **not** bundled with the skill. They are downloaded at build time from [svgl](https://svgl.app), [devicon](https://devicon.dev) (MIT), [gilbarbara/logos](https://github.com/gilbarbara/logos) (CC0), [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/), [Google Cloud product icons](https://cloud.google.com/icons), [Azure icons](https://learn.microsoft.com/en-us/azure/architecture/icons/), [Kubernetes Community Icons](https://github.com/kubernetes/community/tree/master/icons) (Apache-2.0 / CC-BY-4.0) and [Lucide](https://lucide.dev) (ISC), or from the brand's own site or repository. The example images in `docs/` show third-party logos. All brand names and logos are trademarks of their respective owners; their use in a diagram does not imply endorsement. The scripts never recolor or alter a logo. Microsoft permits the Azure icons in architecture diagrams, training materials and documentation.
