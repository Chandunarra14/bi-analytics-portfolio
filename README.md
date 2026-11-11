# BI & Analytics Portfolio

Interactive prototypes of dashboards I built in Power BI for a managed service provider, rebuilt in D3 with **synthetic data** so they can be shared publicly. No real clients, people or amounts are included.

**Live site:** https://chandunarra14.github.io/bi-analytics-portfolio/

Every dashboard has slicers, click-to-filter visuals (cross-filtering like Power BI) and an **Impact** page covering time saved, before/after productivity and what it meant for clients.

| Dashboard | What it covers | Live demo |
|---|---|---|
| [Service Desk Performance](service-desk-dashboard/) | Tickets, FCR, CSAT, MTTR, open backlog, account health | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/service-desk-dashboard/) |
| [Resource Utilization](resource-utilization/) | Hours by category per person and team vs an 80% target-share floor | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/resource-utilization/) |
| [Projects Portfolio](projects-portfolio/) | RYG health, revenue movement, NRR backlog, project margins | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/projects-portfolio/) |
| [PSR Pipeline](psr-pipeline/) | Professional services requests, scoping, win/loss, Autotask vs Salesforce | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/psr-pipeline/) |
| [Contracts & Renewals](contracts-renewals/) | Active contracts, expirations, churn vs renewal, top accounts | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/contracts-renewals/) |
| [Accounts Receivable](accounts-receivable/) | Aging, collections performance, customer aging detail | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/accounts-receivable/) |
| [Intelligence Buckets](intelligence-buckets/) | AI architecture: domain semantic models with data agents and MCP endpoints for Claude and Copilot | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/intelligence-buckets/) |
| [Retention Risk](retention-risk/) | Churn probability, at-risk MRR by CSM and reason, expiring contracts | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/retention-risk/) |
| [Server End-of-Life Pipeline](server-eol/) | EOL servers by client matched to refresh campaign and pipeline | [Open](https://chandunarra14.github.io/bi-analytics-portfolio/server-eol/) |

## How it's built

- `shared/`: a small dashboard framework (tabs, slicers, cross-filtering, KPI cards, tables, impact page) and D3 chart helpers
- `<dashboard>/js/app.js`: each dashboard's pages and visuals, defined as config
- `<dashboard>/data/*.csv`: synthetic sample data
- `scripts/generate_all.py`: regenerates all sample data. Impact before/after numbers are computed from the data itself.

Run locally with `python -m http.server` from the repo root.

**Original stack:** Power BI, DAX, Microsoft Fabric, SQL, with sources including Autotask, Salesforce, Sage Intacct and Datto RMM.
