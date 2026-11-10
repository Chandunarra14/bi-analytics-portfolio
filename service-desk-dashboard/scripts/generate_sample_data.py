import random, csv, os, math, datetime as dt
random.seed(42)
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","data")
def w(name, rows, cols):
    with open(os.path.join(OUT,name),"w",newline="") as f:
        wr=csv.DictWriter(f,fieldnames=cols); wr.writeheader(); [wr.writerow(r) for r in rows]

months=[dt.date(2025,11,1)]
for i in range(11):
    m=months[-1]; months.append(dt.date(m.year+(m.month==12), m.month%12+1,1))
# baseline Nov-Jan, go-live Feb 2026, improvement ramps
def ramp(i):  # 0 before Feb, ramps to 1 by Aug
    return 0 if i<3 else min(1,(i-2)/6)
monthly=[]
for i,m in enumerate(months):
    r=ramp(i)
    alerts=int(random.gauss(2600,180)) + (7400 if i==4 else 0)   # Mar alert storm
    inc=int(random.gauss(2150,120)); sr=int(random.gauss(780,60))
    created=alerts+inc+sr
    res=round(0.84+0.07*r+random.uniform(-0.012,0.012),3)
    if i==4: res=0.95
    completed=int(created*res)
    monthly.append(dict(month=m.isoformat(),alerts=alerts,incidents=inc,service_requests=sr,created=created,completed=completed,
        resolution_pct=round(res*100,1),fcr_pct=round(31+10*r+random.uniform(-1.5,1.5),1),
        mttr_incident_hrs=round(42-13*r+random.uniform(-1.5,1.5),1),mttr_sr_hrs=round(55-17*r+random.uniform(-2,2),1),
        csat_score=round(92+5*r+random.uniform(-0.8,0.8),1),aged_open_90d=int(410-260*r+random.uniform(-15,15)),
        first_response_min=round(38-20*r+random.uniform(-2,2),1)))
w("monthly_summary.csv",monthly,list(monthly[0].keys()))

chan_share={"Email":0.40,"Chat":0.25,"Phone":0.25,"Client Portal":0.10}
chan_fcr={"Email":0.75,"Chat":1.25,"Phone":1.1,"Client Portal":0.45}
chan_csat={"Email":0,"Chat":1.2,"Phone":-1.0,"Client Portal":0.4}
mc=[]
for i,m in enumerate(months):
    human=monthly[i]["incidents"]+monthly[i]["service_requests"]
    sh=dict(chan_share); 
    sh["Chat"]+=0.006*i; sh["Phone"]-=0.004*i; sh["Email"]-=0.002*i
    for c,s in sh.items():
        mc.append(dict(month=m.isoformat(),channel=c,tickets=int(human*s*random.uniform(0.93,1.07)),
          fcr_pct=round(min(95,monthly[i]["fcr_pct"]*chan_fcr[c]+random.uniform(-2,2)),1),
          csat_score=round(min(100,monthly[i]["csat_score"]+chan_csat[c]+random.uniform(-1.2,1.2)),1)))
w("monthly_channel.csv",mc,list(mc[0].keys()))

# daily current month Nov 1-10 2026
daily=[]
chans=["Monitoring Alert","Email","Chat","Phone","Client Portal"]
base={"Monitoring Alert":95,"Email":48,"Chat":36,"Phone":32,"Client Portal":11}
for d in range(1,11):
    date=dt.date(2026,11,d); wk=date.weekday()>=5
    for c in chans:
        v=base[c]*(0.15 if wk and c!="Monitoring Alert" else 1)*random.uniform(0.7,1.3)
        if c=="Monitoring Alert" and d==5: v*=3.2
        daily.append(dict(date=date.isoformat(),channel=c,tickets=int(v)))
w("daily_current_month.csv",daily,["date","channel","tickets"])

fc=[]
for dim,cats in [("Severity",[("SEV 1 - Critical",3,5),("SEV 2 - High",118,520),("SEV 3 - Medium",1290,2650),("SEV 4 - Low",470,1590),("SEV 5 - Planning",42,95),("Maintenance",9,12)]),
                 ("Channel",[("Monitoring Alert",820,1010),("Email",305,1080),("Chat",262,700),("Phone",231,720),("Client Portal",78,330)]),
                 ("Classification",[("Alerts",1180,2290),("Incidents",640,2080),("Service Requests",215,760)])]:
    for c,a,f in cats: fc.append(dict(dimension=dim,category=c,actual_mtd=a,forecast_month=f))
w("forecast.csv",fc,["dimension","category","actual_mtd","forecast_month"])

wd=[dict(weekday=d,avg_tickets=v) for d,v in zip(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],[226,234,231,239,188,46,52])]
w("weekday_avg.csv",wd,["weekday","avg_tickets"])

l15=[]
for k in range(15):
    date=dt.date(2026,10,27)+dt.timedelta(days=k); wk=date.weekday()>=5
    f=0.2 if wk else 1
    a=int(random.uniform(70,140)*(0.6 if wk else 1)*(3.1 if date==dt.date(2026,11,5) else 1))
    l15.append(dict(date=date.isoformat(),alerts=a,incidents=int(random.uniform(85,125)*f)+2,service_requests=int(random.uniform(26,40)*f)+1))
w("last_15_days.csv",l15,["date","alerts","incidents","service_requests"])

depts=["Service Desk","Platform Engineering","Security Ops","Tier 3 Engineering","Business Continuity","Field Support"]
od=[]
vals={"Service Desk":(24,512,94),"Platform Engineering":(128,4,6),"Security Ops":(71,35,25),"Tier 3 Engineering":(28,66,31),"Business Continuity":(15,5,3),"Field Support":(0,3,2)}
for d in depts:
    for c,v in zip(["Alerts","Incidents","Service Requests"],vals[d]): od.append(dict(department=d,classification=c,open_tickets=v))
w("open_by_department.csv",od,["department","classification","open_tickets"])
op=[]
pv={"P1":(58,172,61),"P2":(84,311,38),"P3":(97,112,48),"P4":(21,22,8),"P5":(6,8,6)}
for p,v in pv.items():
    for c,x in zip(["Alerts","Incidents","Service Requests"],v): op.append(dict(priority=p,classification=c,open_tickets=x))
w("open_by_priority.csv",op,["priority","classification","open_tickets"])

today=dt.date(2026,11,10); old=[]
for c,pre,rng in [("Alerts","A",(380,560)),("Incidents","I",(300,520)),("Service Requests","S",(140,330))]:
    ages=sorted(random.sample(range(*rng),10),reverse=True)
    for a in ages:
        cd=today-dt.timedelta(days=a)
        old.append(dict(ticket=f"T{cd.strftime('%Y%m%d')}.{random.randint(100,2999):04d}",classification=c,created_on=cd.isoformat(),age_days=a,
            department=random.choice(depts[:4])))
w("oldest_open.csv",old,["ticket","classification","created_on","age_days","department"])

# channel summary (12 mo)
cs=[]
tot={c:sum(r["tickets"] for r in mc if r["channel"]==c) for c in chan_share}
info={"Email":(0.069,4.74,96.1,29.5,37.6),"Chat":(0.108,4.86,98.0,46.8,21.3),"Phone":(0.047,4.66,95.2,41.9,38.8),"Client Portal":(0.046,4.76,97.4,15.2,41.7)}
for c,(rr,ar,sc,fcr,ah) in info.items():
    cs.append(dict(channel=c,tickets=tot[c],csat_responses=int(tot[c]*rr),avg_rating=ar,csat_score=sc,fcr_pct=fcr,avg_resolution_hrs=ah))
w("channel_summary.csv",cs,list(cs[0].keys()))

issues=[("Client Request",6410,41,0.20),("User Issue",5520,32,0.37),("User Request",3210,20,0.50),("Security",2840,43,0.39),("Network",2650,41,0.23),
("Microsoft 365",2310,40,0.34),("Application",1420,38,0.42),("Printer / Scanner",1190,36,0.29),("Computer / Tablet",1060,39,0.35),("Email",1010,40,0.22),
("Server",970,45,0.31),("Password Reset",880,12,0.74),("ERP Access",640,9,0.84),("Spam Filter",590,49,0.27),("Infrastructure",330,29,0.49),("Accessories",210,72,0.24)]
iss=[dict(issue=n,tickets=t,avg_hrs=h,worked_hrs=t*h,fcr_tickets=int(t*f),fcr_pct=round(f*100,1)) for n,t,h,f in issues]
w("issue_types.csv",iss,list(iss[0].keys()))

w("severity_mttr.csv",[dict(severity=s,mttr_hrs=v) for s,v in [("SEV 1",22),("SEV 2",33),("SEV 3",28),("SEV 4",35),("SEV 5",88)]],["severity","mttr_hrs"])

names=["Aldergrove Credit Union","Bayline Logistics","Birchwood Dental Group","Cedar Point Builders","Clearwater Family Clinic","Copperline Manufacturing",
"Crescent Legal Partners","Driftwood Hospitality","Eastgate Realty","Evergreen Ag Services","Fairhaven School District","Foxridge Engineering",
"Granite Peak Insurance","Harborview Medical","Highland Spirits Co","Ironwood Machining","Juniper Wealth Advisors","Keystone Property Mgmt",
"Lakeshore Furniture","Maple Ridge Nonprofit","Meridian Telehealth","Northfield Produce","Oakmont Accounting","Pinecrest Senior Living",
"Quarry Hill Auto Parts","Redstone Architecture","Riverbend Hospital","Silverleaf Landscaping","Summit Broker Network","Tidewater Pulmonary",
"Union Pipe Credit Union","Westlake Municipal","Willowbrook Youth Services","Yellowstone Distributing"]
levels={"Level-1":(38000,52000),"Level-2":(12000,17000),"Level-3":(5000,8000),"Level-4":(2500,5000),"Level-5":(900,2500)}
acc=[]
for n in names:
    lv=random.choices(list(levels),[1,3,4,4,3])[0]; mrr=random.randint(*levels[lv])
    scale=mrr/30
    a=int(scale*random.uniform(0.3,3.5)); i=int(scale*random.uniform(0.4,2.4)); s=int(scale*random.uniform(0.1,0.8))
    ratio=round((a+i+s)/ (mrr/4) ,2)
    t=i+s; resp=int(t*random.uniform(0.03,0.14))
    acc.append(dict(account=n,service_level=lv,mrr=mrr,alerts=a,incidents=i,service_requests=s,tickets_per_mrr_ratio=ratio,
        tickets=t,csat_responses=resp,avg_rating=round(random.uniform(4.4,5.0),2),mttr_hrs=round(random.uniform(18,60),1)))
# force a few outliers
acc[20]["incidents"]*=5; acc[20]["tickets"]=acc[20]["incidents"]+acc[20]["service_requests"]
acc[20]["tickets_per_mrr_ratio"]=round((acc[20]["alerts"]+acc[20]["tickets"])/(acc[20]["mrr"]/4),2)
for k,v in zip([26,6,13,29],[318,212,196,141]): acc[k]["mttr_hrs"]=v
w("accounts.csv",acc,list(acc[0].keys()))

# impact assumptions (editable estimates)
imp=[
 dict(id="report_hours",area="Time",metric="Manual reporting effort per month",before=80,after=4,unit="hours",note="~2 weeks of one analyst pulling PSA exports into Excel each month, vs a quick review of the live dashboard"),
 dict(id="report_lag",area="Time",metric="Time to get the monthly numbers",before=10,after=0,unit="business days",note="Leadership waited for month-end packs; now the data refreshes daily"),
 dict(id="sources",area="Time",metric="Separate spreadsheets / exports stitched together",before=7,after=1,unit="reports",note="Tickets, CSAT, FCR, MTTR, open backlog, forecast and account health in one place"),
 dict(id="refresh",area="Time",metric="Data refreshes per month",before=1,after=30,unit="refreshes",note="Monthly manual pull vs daily scheduled refresh"),
 dict(id="qbr_hours",area="Clients",metric="Prep time per client business review",before=3,after=0.5,unit="hours",note="Account-level ticket, CSAT and MTTR numbers come straight from the account filter"),
 dict(id="qbr_count",area="Clients",metric="Client reviews run per year",before=120,after=120,unit="reviews",note="About 30 managed clients reviewed quarterly"),
 dict(id="rate",area="Value",metric="Blended internal cost per hour",before=55,after=55,unit="USD",note="Assumption used to put a dollar value on hours saved"),
]
w("impact_assumptions.csv",imp,["id","area","metric","before","after","unit","note"])
print("ok")
