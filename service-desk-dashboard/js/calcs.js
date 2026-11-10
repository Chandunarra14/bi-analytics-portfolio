// Derived numbers. Each is a calc so readers can see how it was worked out.
const num = (v) => +v;

dash.calc('overview_kpis', {
  inputs: ['monthly_summary'],
  title: 'Headline KPIs (latest month vs prior month)',
  description: 'Twelve-month ticket total, plus the latest month of each KPI and its change from the month before.',
  fn: (monthly) => {
    const m = monthly.slice().sort((a, b) => (a.month < b.month ? -1 : 1));
    const last = m[m.length - 1], prev = m[m.length - 2];
    const d = (k) => Math.round((num(last[k]) - num(prev[k])) * 10) / 10;
    return [{
      latest_month: last.month,
      tickets_12m: m.reduce((s, r) => s + num(r.created), 0),
      completed_12m: m.reduce((s, r) => s + num(r.completed), 0),
      resolution_pct: num(last.resolution_pct), resolution_change: d('resolution_pct'),
      fcr_pct: num(last.fcr_pct), fcr_change: d('fcr_pct'),
      mttr_hrs: num(last.mttr_incident_hrs), mttr_change: d('mttr_incident_hrs'),
      csat_score: num(last.csat_score), csat_change: d('csat_score'),
    }];
  },
});

dash.calc('open_totals', {
  inputs: ['open_by_department'],
  title: 'Open tickets by classification',
  description: 'Open tickets summed across departments, per classification and overall.',
  fn: (openByDept) => {
    const by = {};
    openByDept.forEach((r) => { by[r.classification] = (by[r.classification] || 0) + num(r.open_tickets); });
    const rows = Object.entries(by).map(([classification, open_tickets]) => ({ classification, open_tickets }));
    rows.push({ classification: 'All', open_tickets: rows.reduce((s, r) => s + r.open_tickets, 0) });
    return rows;
  },
});

dash.calc('channel_share', {
  inputs: ['monthly_channel'],
  title: 'Channel share of human-raised tickets by month',
  description: 'Tickets per channel divided by all channel tickets in that month.',
  fn: (monthlyChannel) => {
    const tot = {};
    monthlyChannel.forEach((r) => { tot[r.month] = (tot[r.month] || 0) + num(r.tickets); });
    const out = {};
    monthlyChannel.forEach((r) => {
      out[r.month] = out[r.month] || { month: r.month };
      out[r.month][r.channel] = Math.round((num(r.tickets) / tot[r.month]) * 1000) / 10;
    });
    return Object.values(out).sort((a, b) => (a.month < b.month ? -1 : 1));
  },
});

dash.calc('channel_wide', {
  inputs: ['monthly_channel'],
  title: 'FCR and CSAT by channel, one row per month',
  description: 'The monthly channel file pivoted so each channel is a column.',
  fn: (monthlyChannel) => {
    const out = {};
    monthlyChannel.forEach((r) => {
      out[r.month] = out[r.month] || { month: r.month };
      out[r.month]['fcr_' + r.channel] = num(r.fcr_pct);
      out[r.month]['csat_' + r.channel] = num(r.csat_score);
    });
    return Object.values(out).sort((a, b) => (a.month < b.month ? -1 : 1));
  },
});

// Before = first three months (Nov 2025 – Jan 2026, before the dashboard went live in Feb 2026).
// After = latest three months.
dash.calc('impact_compare', {
  inputs: ['monthly_summary'],
  title: 'Before vs after go-live (3-month averages)',
  description: 'Average of Nov 2025–Jan 2026 (before go-live) vs the latest three months, per KPI.',
  fn: (monthly) => {
    const m = monthly.slice().sort((a, b) => (a.month < b.month ? -1 : 1));
    const before = m.slice(0, 3), after = m.slice(-3);
    const avg = (rows, k) => rows.reduce((s, r) => s + num(r[k]), 0) / rows.length;
    const defs = [
      ['fcr_pct', 'First contact resolution', 'pct', true],
      ['resolution_pct', 'Resolution rate', 'pct', true],
      ['csat_score', 'CSAT score', 'score', true],
      ['mttr_incident_hrs', 'Incident MTTR', 'hrs', false],
      ['mttr_sr_hrs', 'Service request MTTR', 'hrs', false],
      ['first_response_min', 'First response time', 'min', false],
      ['aged_open_90d', 'Tickets open 90+ days', 'tickets', false],
    ];
    return defs.map(([metric, label, unit, higherIsBetter]) => {
      const b = Math.round(avg(before, metric) * 10) / 10, a = Math.round(avg(after, metric) * 10) / 10;
      const change = Math.round((a - b) * 10) / 10;
      return { metric, label, unit, before: b, after: a, change, change_pct: Math.round((change / b) * 1000) / 10, improved: higherIsBetter ? change > 0 : change < 0 };
    });
  },
});

dash.calc('impact_time', {
  inputs: ['impact_assumptions'],
  title: 'Time and cost saved',
  description: 'Hours saved from the effort estimates, scaled to a year and priced at the blended hourly cost.',
  fn: (assumptions) => {
    const a = Object.fromEntries(assumptions.map((r) => [r.id, r]));
    const reportSavedMonth = num(a.report_hours.before) - num(a.report_hours.after);
    const reportSavedYear = reportSavedMonth * 12;
    const qbrSavedYear = (num(a.qbr_hours.before) - num(a.qbr_hours.after)) * num(a.qbr_count.after);
    const totalYear = reportSavedYear + qbrSavedYear;
    const rate = num(a.rate.before);
    return [{
      report_hours_saved_month: reportSavedMonth,
      report_weeks_saved_month: Math.round((reportSavedMonth / 40) * 10) / 10,
      report_effort_cut_pct: Math.round((reportSavedMonth / num(a.report_hours.before)) * 100),
      report_hours_saved_year: reportSavedYear,
      qbr_hours_saved_year: qbrSavedYear,
      total_hours_saved_year: totalYear,
      fte_equivalent: Math.round((totalYear / 2080) * 100) / 100,
      value_saved_year: totalYear * rate,
      reports_consolidated: num(a.sources.before) - num(a.sources.after),
      refresh_multiplier: num(a.refresh.after) / num(a.refresh.before),
    }];
  },
});

dash.calc('impact_ops', {
  inputs: ['monthly_summary', 'monthly_channel'],
  title: 'Operational impact per month',
  description: 'Incident wait hours avoided and extra first-contact fixes: latest 3-month volume times the before/after change in each rate.',
  fn: (monthly, monthlyChannel) => {
    const m = monthly.slice().sort((a, b) => (a.month < b.month ? -1 : 1));
    const before = m.slice(0, 3), after = m.slice(-3);
    const avg = (rows, k) => rows.reduce((s, r) => s + num(r[k]), 0) / rows.length;
    const lastMonths = new Set(after.map((r) => r.month));
    const humanTickets = monthlyChannel.filter((r) => lastMonths.has(r.month)).reduce((s, r) => s + num(r.tickets), 0) / 3;
    const incidents = avg(after, 'incidents');
    const downtime = incidents * (avg(before, 'mttr_incident_hrs') - avg(after, 'mttr_incident_hrs'));
    const extraFcr = humanTickets * (avg(after, 'fcr_pct') - avg(before, 'fcr_pct')) / 100;
    const extraResolved = avg(after, 'created') * (avg(after, 'resolution_pct') - avg(before, 'resolution_pct')) / 100;
    return [{
      downtime_hours_avoided_month: Math.round(downtime),
      downtime_hours_avoided_year: Math.round(downtime * 12),
      extra_fcr_tickets_month: Math.round(extraFcr),
      extra_resolved_month: Math.round(extraResolved),
      aged_backlog_cleared: Math.round(avg(before, 'aged_open_90d') - avg(after, 'aged_open_90d')),
    }];
  },
});
