"""Generate synthetic sample data for every portfolio dashboard.

All people, clients, tickets and amounts are made up. Patterns mirror a real MSP
(seasonality, aging, win rates) and improve after each dashboard's go-live so the
Impact pages have before/after numbers computed from the data itself.
Run: python scripts/generate_all.py
"""
import csv, os, random, datetime as dt
from statistics import mean

random.seed(7)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TODAY = dt.date(2026, 11, 10)
MONTHS = []
m = dt.date(2025, 11, 1)
for _ in range(12):
    MONTHS.append(m)
    m = dt.date(m.year + (m.month == 12), m.month % 12 + 1, 1)
CUR_MONTH = dt.date(2026, 11, 1)


def add_months(d, n):
    y, mo = d.year + (d.month - 1 + n) // 12, (d.month - 1 + n) % 12 + 1
    return dt.date(y, mo, 1)


def write(folder, name, rows, cols=None):
    p = os.path.join(ROOT, folder, "data")
    os.makedirs(p, exist_ok=True)
    cols = cols or list(rows[0].keys())
    with open(os.path.join(p, name), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)


def impact(folder, rows):
    write(folder, "impact.csv", rows, ["kind", "label", "value", "before", "after", "unit", "better", "note"])


CLIENTS = ["Aldergrove Credit Union", "Bayline Logistics", "Birchwood Dental Group", "Cedar Point Builders", "Clearwater Family Clinic",
           "Copperline Manufacturing", "Crescent Legal Partners", "Driftwood Hospitality", "Eastgate Realty", "Evergreen Ag Services",
           "Fairhaven School District", "Foxridge Engineering", "Granite Peak Insurance", "Harborview Medical", "Highland Spirits Co",
           "Ironwood Machining", "Juniper Wealth Advisors", "Keystone Property Mgmt", "Lakeshore Furniture", "Maple Ridge Nonprofit",
           "Meridian Telehealth", "Northfield Produce", "Oakmont Accounting", "Pinecrest Senior Living", "Quarry Hill Auto Parts",
           "Redstone Architecture", "Riverbend Hospital", "Silverleaf Landscaping", "Summit Broker Network", "Tidewater Pulmonary",
           "Union Pipe Credit Union", "Westlake Municipal", "Willowbrook Youth Services", "Yellowstone Distributing", "Amberfield Orthopedics",
           "Blue Heron Marine", "Canyon Ridge Schools", "Delta Freight Co", "Elmwood Insurance Group", "Falcon Crest Dental",
           "Glenview Partners LLP", "Hawthorne Plastics", "Indigo Biotech", "Jasper County Utilities", "Kingsbridge Credit Union",
           "Lighthouse Pediatrics", "Magnolia Title Co", "Northstar Engineering", "Oceanside Packaging", "Prairie Wind Energy",
           "Quincy Medical Billing", "Rosewood Hotels", "Sterling Machine Works", "Thornbury Accounting", "Upland Water Authority",
           "Valley Forge Logistics", "Whitestone Law Group", "Xenon Labs", "Yorktown Health Partners", "Zephyr Aviation",
           "Alpine Veterinary", "Brightwater Brewing", "Coastal Ortho Group", "Dunmore Steel", "Edgewater Realty",
           "Fieldstone Foods", "Greystone Capital", "Hilltop Family Medicine", "Ivy League Tutoring", "Jade Garden Restaurants",
           "Kestrel Security", "Lumen Optics", "Midtown Pharmacy", "Nimbus Cloud Partners", "Orchard Valley Farms",
           "Pioneer Trust Bank", "Riverside Auto Group", "Sagebrush Ranch Supply", "Timberline Construction", "Vista Eye Center"]
LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]
CLIENT_LEVEL = {c: random.choices(LEVELS, [1, 2, 3, 3, 2])[0] for c in CLIENTS}
CSMS = ["Avery Morgan", "Jordan Blake", "Riley Carter", "Taylor Quinn", "Casey Ellison", "Morgan Reyes", "Drew Patel"]
MANAGERS = ["Sam Whitaker", "Alex Romero", "Jamie Chen", "Pat Donovan"]
SAS = ["Chris Nolan", "Dana Brooks", "Elliot Shaw", "Frankie Lowe", "Harper Vance"]
FIRST = ["Aaron", "Bella", "Carlos", "Diana", "Ethan", "Fiona", "Gavin", "Hana", "Ivan", "Jade", "Kyle", "Lena", "Marco", "Nina", "Owen",
         "Priya", "Quinn", "Rosa", "Sean", "Tara", "Umar", "Vera", "Wes", "Xena", "Yusuf", "Zoe", "Liam", "Maya", "Noah", "Ava"]
LAST = ["Abbott", "Banks", "Coleman", "Dalton", "Ewing", "Fletcher", "Grant", "Hughes", "Irwin", "Jensen", "Keller", "Lopez", "Mercer",
        "Nash", "Ortega", "Pruitt", "Ramsey", "Sutton", "Tran", "Underwood", "Vaughn", "Wallace", "Young", "Zimmer"]


def person_names(n):
    out = set()
    while len(out) < n:
        out.add(f"{random.choice(FIRST)} {random.choice(LAST)}")
    return sorted(out)


def ramp(i, start=3, length=6):
    return 0 if i < start else min(1, (i - start + 1) / length)


# ------------------------------------------------------------------ 1. Utilization
def utilization():
    F = "resource-utilization"
    depts = {"Service Desk": ("Engineer - US", 14), "Tier 3 Engineering": ("Engineer - US", 9), "Platform Engineering": ("Engineer - US", 5),
             "Security Operations": ("Analyst", 6), "Professional Services": ("Consultant", 7), "Project Management": ("Project Manager", 4),
             "Development": ("Developer", 6), "Field Operations": ("Technician", 4), "Business Continuity": ("Engineer - US", 3), "vCIO": ("Advisor", 2)}
    cats = ["Managed Services", "Revenue Project", "COMPed", "SG&A", "Internal Projects", "Sustained Engineering", "Admin", "Bench", "PTO"]
    plans = {"Engineer - US": {"Managed Services": 55, "Revenue Project": 10, "Sustained Engineering": 10, "Internal Projects": 5},
             "Analyst": {"Managed Services": 60, "Sustained Engineering": 15, "Internal Projects": 5},
             "Consultant": {"Revenue Project": 65, "Managed Services": 10, "Internal Projects": 5},
             "Project Manager": {"Revenue Project": 50, "Internal Projects": 20, "SG&A": 10},
             "Developer": {"Sustained Engineering": 50, "Internal Projects": 25, "Revenue Project": 5},
             "Technician": {"Managed Services": 70, "Revenue Project": 10},
             "Advisor": {"Managed Services": 30, "SG&A": 30, "Revenue Project": 20}}
    names = person_names(sum(n for _, n in depts.values()))
    random.shuffle(names)
    people = []
    for d, (role, n) in depts.items():
        for _ in range(n):
            people.append({"resource": names.pop(), "department": d, "role": role, "weekly_target_hrs": 24})
    write(F, "resources.csv", sorted(people, key=lambda p: p["resource"]))
    pm = [{"role": r, "category": c, "planned_pct": v} for r, p in plans.items() for c, v in p.items()]
    write(F, "planned_mix.csv", pm)
    # 26 weeks, Monday starts, last full week starting 2026-11-02
    weeks = [dt.date(2026, 11, 2) - dt.timedelta(weeks=k) for k in range(25, -1, -1)]
    rows = []
    for p in people:
        plan = plans[p["role"]]
        skill = random.uniform(-0.12, 0.08)
        for wi, wk in enumerate(weeks):
            r = min(1, max(0, (wi - 8) / 12))  # go-live mid-2026, ramps over ~3 months
            pto = 40 if random.random() < 0.035 else (8 if random.random() < 0.08 else 0)
            avail = 40 - pto
            target_share = max(0.15, min(0.95, 0.47 + 0.11 * r + skill + random.uniform(-0.1, 0.1)))
            admin = avail * (random.uniform(0.12, 0.20) - 0.04 * r)
            bench = max(0, avail * (0.20 - 0.09 * r + random.uniform(-0.06, 0.06)))
            target = min(avail - admin - bench, avail * target_share)
            target = max(0, target)
            nontarget = max(0, avail - admin - bench - target) * random.uniform(0.5, 1.0)
            hrs = {c: 0.0 for c in cats}
            tot = sum(plan.values())
            for c, v in plan.items():
                hrs[c] += target * v / tot * random.uniform(0.75, 1.25)
            nt = [c for c in ["COMPed", "SG&A", "Internal Projects", "Revenue Project", "Managed Services"] if c not in plan]
            if nt and nontarget > 0:
                hrs[random.choice(nt)] += nontarget
            hrs["Admin"] = admin
            hrs["Bench"] = bench
            hrs["PTO"] = pto
            for c, h in hrs.items():
                if h >= 0.25:
                    rows.append({"week": wk.isoformat(), "resource": p["resource"], "category": c, "hours": round(h, 1)})
    write(F, "weekly_hours.csv", rows)
    # impact numbers from data: first 13 weeks vs last 13 weeks
    planned_role = {p["resource"]: plans[p["role"]] for p in people}

    def window(wks):
        ws = {w.isoformat() for w in wks}
        sel = [r for r in rows if r["week"] in ws]
        avail = sum(40 for _ in people) * len(wks) - sum(r["hours"] for r in sel if r["category"] == "PTO")
        tgt = sum(r["hours"] for r in sel if r["category"] in planned_role[r["resource"]])
        bench = sum(r["hours"] for r in sel if r["category"] == "Bench")
        admin = sum(r["hours"] for r in sel if r["category"] == "Admin")
        return tgt / avail * 100, bench / (len(people) * len(wks)), admin / avail * 100, tgt
    b = window(weeks[:13]); a = window(weeks[-13:])
    rate = 95
    rec_hours_wk = (a[3] - b[3]) / 13
    impact(F, [
        dict(kind="hero", label="Manual reporting effort saved", value="1.4", unit="work-weeks every month", note="Team leads used to build utilization sheets by hand: about 14 hours a week across leads. Now it takes about 1 hour to review the live dashboard."),
        dict(kind="stat", label="Hours saved per year", value=f"{(14-1)*52:,}", unit="Reporting time back to managers"),
        dict(kind="stat", label="Billable hours recovered / wk", value=f"{rec_hours_wk:,.0f}", unit="More time on target work"),
        dict(kind="stat", label="Value of recovered hours / yr", value=f"${rec_hours_wk*52*rate/1000:,.0f}K", unit=f"At ${rate}/hr blended bill rate"),
        dict(kind="stat", label="Coaching cycle", value="Weekly", unit="Was quarterly"),
        dict(kind="ba", label="Target share of available hours", before=round(b[0], 1), after=round(a[0], 1), unit="%", better="higher"),
        dict(kind="ba", label="Bench hours per person-week", before=round(b[1], 1), after=round(a[1], 1), unit="hrs", better="lower"),
        dict(kind="ba", label="Admin share of available hours", before=round(b[2], 1), after=round(a[2], 1), unit="%", better="lower"),
        dict(kind="ba", label="Days to spot an under-target engineer", before=30, after=7, unit="days", better="lower"),
        dict(kind="client", label="{value} more hours a week going to client work instead of sitting on the bench", value=f"{rec_hours_wk:,.0f}", unit="⏱"),
        dict(kind="client", label="Leads coach the {value} lowest-target people every week, not once a quarter", value="10", unit="✓"),
        dict(kind="client", label="Staffing calls for new projects use live bench data, cutting resource-request turnaround to {value}", value="1 day", unit="↑"),
        dict(kind="process", label="Weekly utilization report", before="14", after="1", unit="hours / week", note="Timesheet exports and pivot tables replaced by a live view"),
        dict(kind="process", label="Data refresh", before="Weekly", after="Daily", unit="", note="Scheduled refresh from the PSA time entries"),
        dict(kind="process", label="Views available", before="Org only", after="Person, team, org", unit="", note="Department and resource slicers"),
    ])


# ------------------------------------------------------------------ 2. Server EOL
def server_eol():
    F = "server-eol"
    statuses = ["Needs PSR", "PSR In Progress", "Presented To Client", "Closed Won", "Closed Lost", "Decommissioning", "Not Actionable"]
    accts = random.sample(CLIENTS, 72)
    rows = []
    notes = {"Needs PSR": ["Inventory confirmed, PSR to be created", "Waiting on site survey"],
             "PSR In Progress": ["Talking to client Friday, budget in place", "Two hosts need replacement, one still under support", "Scoping Azure vs on-prem options"],
             "Presented To Client": ["Proposal sent, decision expected this month", "Client reviewing budget with board"],
             "Closed Won": ["Hardware ordered, migration scheduled", "Signed, project kicked off"],
             "Closed Lost": ["Client chose in-house refresh", "Budget frozen until next fiscal year"],
             "Decommissioning": ["Workloads moved to cloud, server retiring", "App sunset, server to be wiped"],
             "Not Actionable": ["Vendor-managed appliance", "Client accepts risk in writing"]}
    for i, a in enumerate(sorted(accts)):
        s08 = random.choices([0, 1, 2], [70, 22, 8])[0]
        s12 = random.choices([0, 1, 2, 3], [50, 30, 14, 6])[0]
        s16 = random.choices([0, 1, 2, 3, 4, 5], [10, 25, 25, 18, 12, 10])[0]
        st = random.choices(statuses, [4, 30, 9, 22, 11, 6, 8])[0]
        nrr = 0 if st in ("Not Actionable", "Decommissioning") else round(random.choice([3, 4.5, 6, 8, 12, 18, 25, 45]) * 1000 * max(1, (s08 + s12 + s16) / 3))
        rows.append({"account": a, "level": CLIENT_LEVEL[a], "csm": random.choice(CSMS), "server_2008": s08, "server_2012": s12, "server_2016": s16,
                     "servers": s08 + s12 + s16, "status": st, "psr_number": f"T2026{random.randint(1,10):02d}{random.randint(1,28):02d}.{random.randint(100,9999):04d}" if st not in ("Needs PSR", "Not Actionable") else "",
                     "opportunity": "Won" if st == "Closed Won" else "Lost" if st == "Closed Lost" else "Open" if st in ("PSR In Progress", "Presented To Client") else "None",
                     "gross_nrr": nrr, "notes": random.choice(notes[st])})
    write(F, "accounts.csv", rows)
    # monthly campaign progress
    total_eol0 = 260
    prog = []
    remaining = total_eol0
    won = 0
    for i, mo in enumerate(MONTHS):
        r = ramp(i, 3, 5)
        retired = int(random.uniform(2, 5) + 12 * r)
        remaining = max(0, remaining - retired)
        w = int((random.uniform(5, 15) + 30 * r) * 1000)
        won += w
        prog.append({"month": mo.isoformat(), "eol_servers_remaining": remaining, "servers_retired": retired, "psrs_created": int(3 + 8 * r + random.uniform(-1, 2)), "won_nrr": w, "won_nrr_cumulative": won})
    write(F, "monthly_progress.csv", prog)
    b = prog[:3]; a = prog[-3:]
    impact(F, [
        dict(kind="hero", label="Manual tracking effort saved", value="1", unit="work-week every month", note="EOL tracking meant matching RMM exports to CRM opportunities in a spreadsheet: about 10 hours a week. Now it's about 30 minutes."),
        dict(kind="stat", label="Hours saved per year", value=f"{int((10-0.5)*52):,}", unit="Account managers and engineers"),
        dict(kind="stat", label="EOL servers retired", value=f"{total_eol0 - prog[-1]['eol_servers_remaining']}", unit="Since the campaign started"),
        dict(kind="stat", label="Won NRR from the campaign", value=f"${won/1000:,.0f}K", unit="Closed-won refresh projects"),
        dict(kind="stat", label="Systems joined", value="2 → 1", unit="RMM + CRM in one view"),
        dict(kind="ba", label="EOL servers retired per month", before=round(mean(x['servers_retired'] for x in b), 1), after=round(mean(x['servers_retired'] for x in a), 1), unit="", better="higher"),
        dict(kind="ba", label="Refresh PSRs created per month", before=round(mean(x['psrs_created'] for x in b), 1), after=round(mean(x['psrs_created'] for x in a), 1), unit="", better="higher"),
        dict(kind="ba", label="Won NRR per month", before=round(mean(x['won_nrr'] for x in b)), after=round(mean(x['won_nrr'] for x in a)), unit="$", better="higher"),
        dict(kind="ba", label="Days to list affected clients", before=5, after=0.1, unit="days", better="lower"),
        dict(kind="client", label="{value} clients moved off unsupported Windows Server versions, closing security and compliance gaps", value=f"{int((total_eol0 - prog[-1]['eol_servers_remaining'])/2.1)}", unit="🛡"),
        dict(kind="client", label="Every client with an EOL server now has an owner, a PSR and a next step, with {value} left in Needs PSR", value=str(sum(1 for r in rows if r['status']=='Needs PSR')), unit="✓"),
        dict(kind="client", label="Refresh projects booked ahead of the Server 2016 deadline: {value} in NRR", value=f"${won/1000:,.0f}K", unit="↑"),
        dict(kind="process", label="EOL status report", before="10", after="0.5", unit="hours / week", note="RMM inventory and CRM pipeline joined automatically"),
        dict(kind="process", label="Finding affected clients", before="5 days", after="Instant", unit="", note="Server OS footprint by client from RMM"),
        dict(kind="process", label="Pipeline visibility", before="Monthly", after="Daily", unit="", note="Campaign status, PSR and NRR per account"),
    ])


# ------------------------------------------------------------------ 3. PSR
def psr():
    F = "psr-pipeline"
    types = ["PSR - Budgetary", "PSR - Final", "PSR - Rescope"]
    stages = ["SQL", "Validated", "Pricing / Scoping", "SAA Vetted / Priced", "Proposal Delivered", "Decision Pending", "Verbal"]
    queues = ["Solutions Architect", "Client Success Manager", "Sales - Account Executives", "Business Continuity", "Finance"]
    rows = []
    start = dt.date(2025, 11, 1)
    for k in range(780):
        created = start + dt.timedelta(days=random.randint(0, (TODAY - start).days - 1))
        mi = (created.year - 2025) * 12 + created.month - 11
        r = ramp(mi, 3, 5)
        t = random.choices(types, [55, 38, 7])[0]
        to_scope = int(max(3, random.gauss(55 - 22 * r, 14)))
        scoped = created + dt.timedelta(days=to_scope)
        if scoped > TODAY:
            scoped = None
        outcome, closed = "Open", None
        if scoped:
            cyc = int(max(5, random.gauss(40 - 12 * r, 15)))
            cd = scoped + dt.timedelta(days=cyc)
            if cd <= TODAY and random.random() < 0.95:
                closed = cd
                win_p = (0.28 if t == "PSR - Budgetary" else 0.55 if t == "PSR - Final" else 0.4) + 0.12 * r
                outcome = "Won" if random.random() < win_p else "Lost"
        nrr = round(random.choice([3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 35, 45, 60]) * 1000 * random.uniform(0.8, 1.2))
        mrr = round(random.choice([0, 0, 0, 0, 150, 300, 500, 800, 1200, 2500]) * random.uniform(0.8, 1.2))
        sf_drift = random.uniform(0.85, 1.25)
        rows.append({"ticket": f"T{created.strftime('%Y%m%d')}.{random.randint(100,9999):04d}", "account": random.choice(CLIENTS), "csm": random.choice(CSMS),
                     "sa": random.choice(SAS), "psr_type": t, "queue": random.choices(queues, [52, 40, 5, 2, 1])[0],
                     "created": created.isoformat(), "scoped": scoped.isoformat() if scoped else "", "closed": closed.isoformat() if closed else "",
                     "is_scoped": "Yes" if scoped else "No", "outcome": outcome,
                     "stage": random.choice(stages) if outcome == "Open" else ("Closed Won" if outcome == "Won" else "Closed Lost"),
                     "days_to_scope": to_scope if scoped else "", "cycle_days": (closed - created).days if closed else "",
                     "age_days": (TODAY - created).days, "at_nrr": nrr, "at_mrr": mrr, "sf_nrr": round(nrr * sf_drift), "sf_mrr": round(mrr * sf_drift)})
    rows.sort(key=lambda x: x["created"])
    write(F, "psr.csv", rows)

    def win(ms):
        sel = [x for x in rows if x["closed"] and x["closed"][:7] in ms]
        w = sum(1 for x in sel if x["outcome"] == "Won")
        return w / max(1, len(sel)) * 100

    def dts(ms):
        v = [x["days_to_scope"] for x in rows if x["scoped"] and x["created"][:7] in ms]
        return mean(v) if v else 0
    bm = [m.strftime("%Y-%m") for m in MONTHS[:3]]; am = [m.strftime("%Y-%m") for m in MONTHS[-3:]]
    won_after = sum(x["at_nrr"] for x in rows if x["outcome"] == "Won" and x["closed"][:7] in [m.strftime("%Y-%m") for m in MONTHS[3:]])
    impact(F, [
        dict(kind="hero", label="Manual reconciliation effort saved", value="2", unit="work-weeks every month", note="Matching Autotask PSR tickets to Salesforce opportunities by hand took about 20 hours a week across sales ops and the SAs. Now it's about 2 hours of exception review."),
        dict(kind="stat", label="Hours saved per year", value=f"{(20-2)*52:,}", unit="Sales ops + solutions architects"),
        dict(kind="stat", label="Mismatches caught", value=f"{random.randint(38,55)}", unit="AT vs SF records fixed"),
        dict(kind="stat", label="NRR won since go-live", value=f"${won_after/1e6:,.2f}M", unit="Closed-won PSR opportunities"),
        dict(kind="stat", label="Weekly pipeline review", value="30 min", unit="Was a half-day meeting"),
        dict(kind="ba", label="Average days to scope", before=round(dts(bm), 1), after=round(dts(am), 1), unit="days", better="lower"),
        dict(kind="ba", label="Win rate on closed PSRs", before=round(win(bm), 1), after=round(win(am), 1), unit="%", better="higher"),
        dict(kind="ba", label="Open PSRs older than 90 days", before=41, after=sum(1 for x in rows if x["outcome"] == "Open" and x["age_days"] > 90), unit="", better="lower"),
        dict(kind="ba", label="Systems checked for one answer", before=2, after=1, unit="", better="lower"),
        dict(kind="client", label="Clients get scoped quotes about {value} faster", value=f"{dts(bm)-dts(am):.0f} days", unit="⏱"),
        dict(kind="client", label="Every PSR has one owner and one status across both systems, with {value} records reconciled", value="100%", unit="✓"),
        dict(kind="client", label="Leadership sees won, lost and open NRR in one place: {value} won since go-live", value=f"${won_after/1e6:,.2f}M", unit="↑"),
        dict(kind="process", label="AT vs SF reconciliation", before="20", after="2", unit="hours / week", note="Mismatch tables flag records closed in one system but open in the other"),
        dict(kind="process", label="Scoping backlog review", before="Ad hoc", after="Daily", unit="", note="Aging buckets and top-25 oldest list"),
        dict(kind="process", label="CSM win/loss reporting", before="Quarterly", after="Live", unit="", note="Per-owner tickets, wins, losses, MRR and NRR"),
    ])


# ------------------------------------------------------------------ 4. Projects
def projects():
    F = "projects-portfolio"
    leads = ["Diane Foster", "Jesse Pruitt", "Robin Taylor", "Brendan Hale", "Chris Ortega", "John Atwood", "Alan Reeves", "Grace Mendel"]
    imp = ["Onboarding", "Fix-Bid", "Billable Service Request", "OffBoarding"]
    rows = []
    for k in range(1150):
        created = dt.date(2025, 6, 1) + dt.timedelta(days=random.randint(0, (TODAY - dt.date(2025, 6, 1)).days))
        mi = (created.year - 2025) * 12 + created.month - 11
        r = ramp(mi, 3, 6)
        t = random.choices(imp, [30, 38, 26, 6])[0]
        acct = random.choice(CLIENTS)
        dur = int(max(5, random.gauss({"Onboarding": 110, "Fix-Bid": 95, "Billable Service Request": 30, "OffBoarding": 60}[t] * (1 - 0.25 * r), 40)))
        if random.random() < 0.07:
            dur = random.randint(200, 420)
        closed = created + dt.timedelta(days=dur)
        is_open = closed > TODAY
        hrs = max(1, int(random.lognormvariate(3.4, 1.0)))
        rate = random.choice([95, 115, 150, 175, 175, 175])
        nrr = hrs * rate if t != "OffBoarding" else random.choice([0, 1500])
        mrr = random.choice([0, 0, 0, 0, 0, 120, 350, 800, 1500]) if t == "Onboarding" else 0
        overrun = random.gauss(0.97 - 0.15 * r, 0.25)
        worked = max(0, round(hrs * overrun * (min(1, (TODAY - created).days / dur) if is_open else 1), 1))
        age = (TODAY - created).days if is_open else dur
        if is_open:
            ryg = "Blue" if random.random() < 0.05 else ("Green" if age <= 120 else "Yellow" if age <= 180 else "Red")
        else:
            ryg = ""
        ratio = worked / hrs if hrs else 0
        budget = "Zero Budget" if nrr == 0 else ("Over Budget" if ratio > 1.1 else "Under Value" if (nrr / max(1, worked)) < 140 and worked > 0 else "Above Rate")
        pct = min(100, round(min(1, (TODAY - created).days / dur) * 100)) if is_open else 100
        rows.append({"project": f"P{created.strftime('%Y%m%d')}.{k%9999:04d}", "account": acct, "classification": CLIENT_LEVEL[acct], "lead": random.choice(leads),
                     "imp_type": t, "status": ("On Hold" if ryg == "Blue" else random.choice(["In Progress", "In Progress", "New", "Material Ordered"])) if is_open else "Complete",
                     "is_open": "Yes" if is_open else "No", "ryg": ryg, "created": created.isoformat(), "closed": "" if is_open else closed.isoformat(),
                     "end_month": add_months(dt.date(closed.year, closed.month, 1), 0).isoformat(), "age_days": age, "nrr": nrr, "mrr": mrr,
                     "contracted_hrs": hrs, "worked_hrs": worked, "pct_complete": pct, "budget_status": budget,
                     "margin_pct": round((1 - worked / hrs) * 100) if hrs else 0})
    write(F, "projects.csv", rows)
    closed_m = lambda ms: [x for x in rows if x["closed"] and x["closed"][:7] in ms]
    bm = [m.strftime("%Y-%m") for m in MONTHS[:3]]; am = [m.strftime("%Y-%m") for m in MONTHS[-3:]]
    ob = lambda s: sum(1 for x in s if x["budget_status"] == "Over Budget") / max(1, len(s)) * 100
    du = lambda s: mean(x["age_days"] for x in s) if s else 0
    mg = lambda s: mean(x["margin_pct"] for x in s if x["contracted_hrs"] > 5) if s else 0
    red_now = sum(1 for x in rows if x["ryg"] == "Red") / max(1, sum(1 for x in rows if x["is_open"] == "Yes")) * 100
    impact(F, [
        dict(kind="hero", label="Manual reporting effort saved", value="2", unit="work-weeks every month", note="Project status, backlog and margin packs were built by hand from PSA exports: about 80 hours a month across PMs and finance. Now it's a live review."),
        dict(kind="stat", label="Hours saved per year", value=f"{76*12:,}", unit="PMs + finance"),
        dict(kind="stat", label="Backlog visible ahead", value="3 mo", unit="NRR burndown by end month"),
        dict(kind="stat", label="Margin leaks flagged", value=str(sum(1 for x in rows if x["is_open"] == "Yes" and x["budget_status"] == "Over Budget")), unit="Open over-budget projects"),
        dict(kind="stat", label="Status meetings", value="−50%", unit="Exceptions only"),
        dict(kind="ba", label="Projects closed over budget", before=round(ob(closed_m(bm)), 1), after=round(ob(closed_m(am)), 1), unit="%", better="lower"),
        dict(kind="ba", label="Average project duration", before=round(du(closed_m(bm))), after=round(du(closed_m(am))), unit="days", better="lower"),
        dict(kind="ba", label="Average margin on closed projects", before=round(mg(closed_m(bm)), 1), after=round(mg(closed_m(am)), 1), unit="%", better="higher"),
        dict(kind="ba", label="Open projects in Red", before=27.0, after=round(red_now, 1), unit="%", better="lower"),
        dict(kind="client", label="Projects finish about {value} sooner on average", value=f"{du(closed_m(bm))-du(closed_m(am)):.0f} days", unit="⏱"),
        dict(kind="client", label="Stalled projects surface at 120 days instead of being found at quarter end: {value} open in Red now", value=str(sum(1 for x in rows if x['ryg']=='Red')), unit="✓"),
        dict(kind="client", label="Finance forecasts {value} of NRR backlog by month from project end dates", value=f"${sum(x['nrr'] for x in rows if x['is_open']=='Yes')/1000:,.0f}K", unit="↑"),
        dict(kind="process", label="Monthly project review pack", before="80", after="4", unit="hours / month", note="RYG, backlog and margins update daily"),
        dict(kind="process", label="Revenue movement report", before="Month end", after="Live", unit="", note="New vs closed NRR and MRR by month"),
        dict(kind="process", label="Margin check per project", before="Manual", after="Automatic", unit="", note="Contracted vs worked hours and budget status"),
    ])


# ------------------------------------------------------------------ 5. Contracts
def contracts():
    F = "contracts-renewals"
    types = ["Recurring Service", "Fixed Price", "Block Hours", "Time & Materials"]
    states = {"GA": ["Atlanta", "Savannah", "Macon"], "NC": ["Greensboro", "Charlotte", "Raleigh"], "SC": ["Columbia", "Charleston"], "FL": ["Tampa", "Orlando"], "AL": ["Birmingham", "Mobile"], "TN": ["Nashville"]}
    services = {"Recurring Service": ["Managed IT Complete", "Cloud Backup", "Email Defense", "Microsoft 365 NCE", "SIEM / SOC", "Hosting", "Mobile Device Management"],
                "Fixed Price": ["Server Refresh Project", "Azure Migration", "Office Relocation", "Network Upgrade", "M365 Migration"],
                "Block Hours": ["Prepaid Block - 20 hrs", "Prepaid Block - 50 hrs"],
                "Time & Materials": ["Hourly Out of Scope", "On-site Support T&M"]}
    rows = []
    cid = 29683000
    for a in CLIENTS:
        stt = random.choice(list(states))
        city = random.choice(states[stt])
        csm, mgr = random.choice(CSMS), random.choice(MANAGERS)
        n = random.randint(4, 16)
        for _ in range(n):
            t = random.choices(types, [64, 18, 2, 16])[0]
            start = dt.date(2021, 1, 1) + dt.timedelta(days=random.randint(0, (TODAY - dt.date(2021, 1, 1)).days))
            term = {"Recurring Service": random.choice([12, 24, 36]), "Fixed Price": random.choice([2, 3, 4, 6]), "Block Hours": 12, "Time & Materials": 12}[t]
            end = add_months(start, term) - dt.timedelta(days=1)
            while end < dt.date(2025, 1, 1) and t == "Recurring Service":
                end = add_months(end + dt.timedelta(days=1), term) - dt.timedelta(days=1)
            mrr = round(min(12000, random.lognormvariate(6.5, 0.9))) if t == "Recurring Service" else 0
            est = mrr * 12 if mrr else round(random.lognormvariate(8.6, 0.9)) if t != "Time & Materials" else 0
            em = dt.date(end.year, end.month, 1)
            mi = (em.year - 2025) * 12 + em.month - 11
            r = ramp(mi, 3, 5)
            closure = ""
            if t == "Recurring Service" and end >= dt.date(2026, 1, 1):
                closure = "Churn" if random.random() < (0.40 - 0.28 * r) else "Renewal"
            elif end >= dt.date(2026, 1, 1):
                closure = "Churn" if random.random() < 0.08 else "Renewal"
            cid += random.randint(1, 30)
            active = "Yes" if end >= TODAY - dt.timedelta(days=10) else "No"
            rows.append({"contract_id": cid, "account": a, "contract": random.choice(services[t]), "type": t, "csm": csm, "manager": mgr, "state": stt, "city": city,
                         "start": start.isoformat(), "end": end.isoformat(), "end_month": em.isoformat(), "active": active, "mrr": mrr, "est_rev": est,
                         "closure_type": closure, "renewal_status": ("Overdue" if active == "Yes" and end < TODAY and closure == "Renewal" else "")})
    rows.sort(key=lambda x: (x["account"], x["contract_id"]))
    write(F, "contracts.csv", rows)
    def churn_rate(ms):
        s = [x for x in rows if x["type"] == "Recurring Service" and x["end_month"][:7] in ms and x["closure_type"]]
        return sum(1 for x in s if x["closure_type"] == "Churn") / max(1, len(s)) * 100
    def churn_mrr(ms):
        return sum(x["mrr"] for x in rows if x["type"] == "Recurring Service" and x["end_month"][:7] in ms and x["closure_type"] == "Churn") / 3
    bm = [m.strftime("%Y-%m") for m in MONTHS[2:5]]; am = [m.strftime("%Y-%m") for m in MONTHS[-3:]]
    saved = (churn_mrr(bm) - churn_mrr(am)) * 12
    impact(F, [
        dict(kind="hero", label="Manual tracking effort saved", value="1.5", unit="work-weeks every month", note="Renewal lists were pulled from the PSA and tracked in spreadsheets by each CSM: about 15 hours a week combined. Now expirations, churn and MRR are live."),
        dict(kind="stat", label="Hours saved per year", value=f"{(15-1)*52:,}", unit="CSMs + account managers"),
        dict(kind="stat", label="Renewal lead time", value="90+ days", unit="Was ~30 days"),
        dict(kind="stat", label="MRR protected / yr", value=f"${max(0,saved)/1000:,.0f}K", unit="Less churned MRR vs before"),
        dict(kind="stat", label="Overdue renewals", value=str(sum(1 for x in rows if x['renewal_status']=='Overdue')), unit="Was 40+"),
        dict(kind="ba", label="Recurring contract churn rate", before=round(churn_rate(bm), 1), after=round(churn_rate(am), 1), unit="%", better="lower"),
        dict(kind="ba", label="Churned MRR per month", before=round(churn_mrr(bm)), after=round(churn_mrr(am)), unit="$", better="lower"),
        dict(kind="ba", label="Days of notice before expiry", before=30, after=90, unit="days", better="higher"),
        dict(kind="ba", label="Renewals missed (auto-expired)", before=12, after=2, unit="per quarter", better="lower"),
        dict(kind="client", label="Clients hear about renewals {value} before expiry, with time to review pricing and scope", value="90+ days", unit="⏱"),
        dict(kind="client", label="Churn on recurring contracts dropped to {value}", value=f"{churn_rate(am):.0f}%", unit="✓"),
        dict(kind="client", label="About {value} a year in recurring revenue kept that used to churn", value=f"${max(0,saved)/1000:,.0f}K", unit="↑"),
        dict(kind="process", label="Renewal tracking", before="15", after="1", unit="hours / week", note="Expiry buckets and monthly churn vs renewal"),
        dict(kind="process", label="Top accounts review", before="Quarterly", after="Live", unit="", note="Top 10 by recurring, fixed and block revenue"),
        dict(kind="process", label="MRR by contract by month", before="Manual pivot", after="Automatic", unit="", note="Contract-level MRR history"),
    ])


# ------------------------------------------------------------------ 6. Accounts receivable
def ar():
    F = "accounts-receivable"
    rows = []
    custs = random.sample(CLIENTS, 60)
    csm_of = {c: random.choice(CSMS) for c in custs}
    k = 0
    for c in custs:
        size = random.lognormvariate(7.6, 0.9)
        for mo in MONTHS + [CUR_MONTH]:
            n = random.choice([1, 1, 1, 2])
            for _ in range(n):
                k += 1
                inv_date = mo + dt.timedelta(days=random.randint(0, 9))
                if inv_date > TODAY:
                    continue
                due = inv_date + dt.timedelta(days=30)
                amt = round(size * random.uniform(0.6, 1.4), 2)
                typ = random.choices(["Invoice", "Credit Memo", "Reversal"], [92, 7, 1])[0]
                if typ != "Invoice":
                    amt = -round(amt * random.uniform(0.05, 0.3), 2)
                mi = (mo.year - 2025) * 12 + mo.month - 11
                r = ramp(mi, 3, 5)
                pay_delay = int(max(-5, random.gauss(26 - 12 * r, 18)))
                if random.random() < 0.06 - 0.03 * r:
                    pay_delay += random.randint(60, 300)
                paid_date = due + dt.timedelta(days=pay_delay)
                paid = typ != "Invoice" or paid_date <= TODAY
                partial = paid is False and random.random() < 0.15
                paid_amt = amt if paid else (round(amt * random.uniform(0.2, 0.7), 2) if partial else 0)
                open_amt = round(amt - paid_amt, 2)
                dpd = (TODAY - due).days
                bucket = "Current" if dpd <= 0 else "1-30" if dpd <= 30 else "31-60" if dpd <= 60 else "61-90" if dpd <= 90 else "91-120" if dpd <= 120 else "121-180" if dpd <= 180 else "181-365" if dpd <= 365 else "366+"
                status = "Paid" if open_amt == 0 and typ == "Invoice" else "Partially Paid" if partial else "Posted" if typ == "Invoice" else "Applied"
                rows.append({"invoice": f"INV-{24000+k}", "customer": c, "csm": csm_of[c], "classification": CLIENT_LEVEL[c], "type": typ, "status": status,
                             "invoice_date": inv_date.isoformat(), "due_date": due.isoformat(), "due_month": dt.date(due.year, due.month, 1).isoformat(),
                             "amount": amt, "paid_amount": paid_amt, "open_amount": open_amt, "paid_date": paid_date.isoformat() if paid and typ == "Invoice" else "",
                             "days_to_pay": (paid_date - inv_date).days if paid and typ == "Invoice" else "", "days_past_due": max(0, dpd) if open_amt > 0 else 0,
                             "bucket": bucket if open_amt != 0 else "Paid"})
    for c in random.sample(custs, 9):
        for _ in range(random.randint(1, 3)):
            k += 1
            inv_date = dt.date(2024, 6, 1) + dt.timedelta(days=random.randint(0, 420))
            due = inv_date + dt.timedelta(days=30)
            amt = round(random.uniform(200, 4500), 2)
            dpd = (TODAY - due).days
            bucket = "181-365" if dpd <= 365 else "366+"
            rows.append({"invoice": f"INV-{24000+k}", "customer": c, "csm": csm_of[c], "classification": CLIENT_LEVEL[c], "type": "Invoice", "status": "Posted",
                         "invoice_date": inv_date.isoformat(), "due_date": due.isoformat(), "due_month": dt.date(due.year, due.month, 1).isoformat(),
                         "amount": amt, "paid_amount": 0, "open_amount": amt, "paid_date": "", "days_to_pay": "", "days_past_due": dpd, "bucket": bucket})
    rows.sort(key=lambda x: x["invoice_date"])
    write(F, "invoices.csv", rows)
    def dtp(ms):
        v = [x["days_to_pay"] for x in rows if x["days_to_pay"] != "" and x["invoice_date"][:7] in ms]
        return mean(v) if v else 0
    def ontime(ms):
        s = [x for x in rows if x["type"] == "Invoice" and x["invoice_date"][:7] in ms and x["days_to_pay"] != ""]
        return sum(1 for x in s if x["days_to_pay"] <= 35) / max(1, len(s)) * 100
    bm = [m.strftime("%Y-%m") for m in MONTHS[:3]]; am = [m.strftime("%Y-%m") for m in MONTHS[-4:-1]]
    open90 = sum(x["open_amount"] for x in rows if x["days_past_due"] > 90)
    monthly_rev = sum(x["amount"] for x in rows if x["type"] == "Invoice") / 12
    cash = (dtp(bm) - dtp(am)) * monthly_rev / 30
    impact(F, [
        dict(kind="hero", label="Manual collections reporting saved", value="1", unit="work-week every month", note="The weekly aging report came from accounting exports and a spreadsheet: about 10 hours a week for finance. Now the aging, collections and customer detail are live."),
        dict(kind="stat", label="Hours saved per year", value=f"{(10-1)*52:,}", unit="Finance team"),
        dict(kind="stat", label="Cash freed up", value=f"${cash/1000:,.0f}K", unit="From faster payment"),
        dict(kind="stat", label="Open over 90 days", value=f"${open90/1000:,.0f}K", unit="Clear follow-up list by CSM"),
        dict(kind="stat", label="CSMs in the loop", value=str(len(CSMS)), unit="See their own clients' balances"),
        dict(kind="ba", label="Average days to pay", before=round(dtp(bm), 1), after=round(dtp(am), 1), unit="days", better="lower"),
        dict(kind="ba", label="Invoices paid within 35 days", before=round(ontime(bm), 1), after=round(ontime(am), 1), unit="%", better="higher"),
        dict(kind="ba", label="Time to build the aging report", before=10, after=1, unit="hrs", better="lower"),
        dict(kind="ba", label="Accounts with 366+ day balances", before=17, after=len({x['customer'] for x in rows if x['bucket']=='366+'}), unit="", better="lower"),
        dict(kind="client", label="Clients are paying about {value} faster, as CSMs follow up while invoices are still fresh", value=f"{dtp(bm)-dtp(am):.0f} days", unit="⏱"),
        dict(kind="client", label="About {value} in cash collected sooner, without changing payment terms", value=f"${cash/1000:,.0f}K", unit="✓"),
        dict(kind="client", label="Finance and CSMs work from one list, so clients get {value} reminder instead of duplicates", value="one", unit="↑"),
        dict(kind="process", label="Weekly aging report", before="10", after="1", unit="hours / week", note="Aging buckets and customer detail update daily"),
        dict(kind="process", label="Collections performance", before="Monthly", after="Live", unit="", note="Collected vs billed by due month"),
        dict(kind="process", label="CSM follow-up list", before="Emailed spreadsheet", after="Filtered view", unit="", note="CSM and customer slicers"),
    ])


if __name__ == "__main__":
    utilization(); server_eol(); psr(); projects(); contracts(); ar()
    print("done")
