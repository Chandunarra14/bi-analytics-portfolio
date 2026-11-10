"""Stamp a standalone index.html for each dashboard folder."""
import sys, time
T = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} (Prototype)</title>
<link rel="stylesheet" href="../shared/sd.css?v={v}">
</head>
<body>
<div id="dash-root"><div id="app"></div></div>
<script src="../shared/d3.min.js"></script>
<script src="../shared/lib.js?v={v}"></script>
<script src="../shared/sd.js?v={v}"></script>
<script src="js/app.js?v={v}"></script>
</body>
</html>
"""
GT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · User guide</title>
<link rel="stylesheet" href="../shared/guide.css?v={v}">
</head>
<body>
<script src="js/guide.js?v={v}"></script>
<script src="../shared/guide.js?v={v}"></script>
</body>
</html>
"""
DASH = {"resource-utilization": "Resource Utilization", "server-eol": "Server End-of-Life Pipeline", "psr-pipeline": "PSR Pipeline",
        "projects-portfolio": "Projects Portfolio", "contracts-renewals": "Contracts & Renewals", "accounts-receivable": "Accounts Receivable", "retention-risk": "Retention Risk"}
import os
v = time.strftime("%Y%m%d%H%M%S")
for folder, title in DASH.items():
    import os
    if os.path.isdir(folder):
        open(f"{folder}/index.html", "w").write(T.format(title=title, v=v))
for folder, title in list(DASH.items()) + [("service-desk-dashboard", "Service Desk Performance")]:
    if os.path.exists(f"{folder}/js/guide.js"):
        open(f"{folder}/guide.html", "w").write(GT.format(title=title, v=v))
print("ok", v)
