(() => {
  const { SITE, TRACKS, SKILL_GROUPS, PROJECTS, MARKET_EVIDENCE, EXPERIENCE, CERTS, EXTRAS, LIVE_FALLBACK } = window;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const repo = (slug) => `${SITE.github}/${slug}`;
  const raw = (slug) => `https://raw.githubusercontent.com/sidd-24/${slug}/main/results/summary.json`;
  const pct = (x, d = 1) => `${(x * 100).toFixed(d)} %`;
  const date = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const HIDDEN_TAGS = ["Python", "pytest"];

  const state = { track: TRACKS[0].id, jobs: null };

  // ---------- the chosen role lives in the URL (?for=bi), so links and the back button work ----------
  const trackFromUrl = () => {
    const id = new URLSearchParams(location.search).get("for");
    return TRACKS.some((t) => t.id === id) ? id : TRACKS[0].id;
  };

  addEventListener("popstate", () => {
    const id = trackFromUrl();
    if (id !== state.track) { state.track = id; render(); }
  });

  // ---------- static content ----------
  for (const id of ["mail", "mail-2"]) $("#" + id).href = `mailto:${SITE.email}`;
  for (const id of ["li", "li-2"]) $("#" + id).href = SITE.linkedin;
  for (const id of ["gh", "gh-2", "gh-3"]) $("#" + id).href = SITE.github;
  $("#year").textContent = new Date().getFullYear();

  $("#skill-groups").innerHTML = SKILL_GROUPS.map((g) =>
    `<div class="group card"><h3>${esc(g.name)}</h3><ul>${g.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("");

  $("#timeline").innerHTML = EXPERIENCE.map((x) => `<li>
    <p class="when">${esc(x.when)}</p>
    <h3>${esc(x.what)}</h3>
    <p class="where">${esc(x.where)}</p>
    <p class="detail">${esc(x.detail)}</p></li>`).join("");
  $("#certs").innerHTML = CERTS.map((c) => `<li><b>${esc(c.name)}</b><span>${esc(c.issuer)}${c.year ? `, ${c.year}` : ""}</span></li>`).join("");
  $("#extras").innerHTML = EXTRAS.map((x) => `<li>${esc(x)}</li>`).join("");

  // ---------- roles and projects ----------
  const roleList = $("#tracks");
  roleList.innerHTML = TRACKS.map((t) => `<button class="role" type="button" data-track="${t.id}" aria-pressed="false">${esc(t.label)}</button>`).join("");
  roleList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-track]");
    if (!b || b.dataset.track === state.track) return;
    state.track = b.dataset.track;
    const url = new URL(location.href);
    url.searchParams.set("for", state.track);
    url.hash = "";
    history.pushState(null, "", url);
    render();
  });

  function render() {
    const t = TRACKS.find((x) => x.id === state.track);
    roleList.querySelectorAll(".role").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.track === t.id)));
    const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.tracks.includes(t.id));
    const key = ({ p, i }) => (p.tracks[0] === t.id ? 0 : 100) + (p.featured ? 0 : 50) + i / 100;
    list.sort((a, b) => key(a) - key(b));
    $("#role-intro").textContent = `${t.intro} ${list.length} project${list.length === 1 ? "" : "s"}.`;
    $("#projects").innerHTML = list.map(({ p }) => card(p)).join("");
    renderMarket();
  }

  function card(p) {
    const tags = p.skills.filter((s) => !HIDDEN_TAGS.includes(s)).slice(0, 4);
    return `<article class="project card">
      <h3>${esc(p.title)}</h3>
      <p class="what">${esc(p.what)}</p>
      <p class="headline">${esc(p.headline)}</p>
      <div class="tags">${tags.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
      <a class="repo-link" href="${repo(p.slug)}" target="_blank" rel="noopener">View on GitHub →</a>
    </article>`;
  }

  // ---------- menu ----------
  const menuBtn = $("#menu-btn");
  const menu = $("#menu");
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => {
    const open = menu.hidden;
    setMenu(open);
    if (open) menu.querySelector("a").focus();
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });

  // mark the section currently on screen in the menu
  const links = [...menu.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const markCurrent = () => {
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= 120) current = s;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach((a, i) => a.setAttribute("aria-current", String(sections[i] === current)));
  };
  addEventListener("scroll", markCurrent, { passive: true });

  // ---------- live data ----------
  async function getJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  const daysOld = (d) => (Date.now() - new Date(d + "T12:00:00")) / 864e5;

  function tile({ name, cadence, title, big, small, rows, foot, slug, stale }) {
    const mini = rows ? `<div class="minirows">${rows.map(([label, v, hi, shown]) =>
      `<div class="minirow" title="${esc(label)}: ${esc(shown)}"><span>${esc(label)}</span><span class="bar"><i class="${hi ? "hi" : ""}" style="width:${Math.min(v, 1) * 100}%"></i></span><span class="v">${esc(shown)}</span></div>`).join("")}</div>` : "";
    return `<article class="tile card">
      <div class="tile-top"><a href="${repo(slug)}" target="_blank" rel="noopener">${esc(name)}</a><span class="badge">${esc(cadence)}</span></div>
      <h3>${esc(title)}</h3>
      <p class="big">${esc(big)}</p>
      ${small ? `<p class="small">${esc(small)}</p>` : ""}
      ${mini}
      <p class="tile-foot"><span class="${stale ? "stale" : ""}">${esc(foot)}</span></p>
    </article>`;
  }

  function daxTile(d) {
    const models = [["Filtered HS", "Filtered historical simulation"], ["GARCH-t", "GARCH(1,1), Student-t"], ["EWMA", "EWMA (RiskMetrics)"], ["Hist. sim.", "Historical simulation"]];
    const v = d ? d.var_next_week["Filtered historical simulation"] : LIVE_FALLBACK.dax.var;
    const week = d ? d.last_week : LIVE_FALLBACK.dax.last_week;
    let rows;
    if (d) {
      const top = Math.max(...Object.values(d.var_next_week));
      rows = models.map(([short, full], i) => [short, d.var_next_week[full] / top, i === 0, pct(d.var_next_week[full])]);
    }
    const stale = daysOld(week) > 14;
    return tile({
      name: "DAX risk monitor", cadence: "Weekly", slug: "dax-risk-monitor",
      title: "Next week's 99 % Value-at-Risk for 15 DAX stocks",
      big: pct(v), small: `About €${(Math.round(v * 1e4) * 100).toLocaleString("en-GB")} on a €1m portfolio.`,
      rows, stale, foot: `${d ? "" : "Saved value · "}Week ending ${date(week)}${stale ? " (update overdue)" : ""}`,
    });
  }

  function dbTile(d) {
    const cats = d ? d.last_12_months_by_category.map((c) => [c.category, c.punctual_share]) : LIVE_FALLBACK.db.cats;
    const last = d ? d.period.last_day : LIVE_FALLBACK.db.last_day;
    const regional = cats.find((c) => c[0] === "regional");
    const stale = daysOld(last) > 45;
    return tile({
      name: "Deutsche Bahn delay tracker", cadence: "Monthly", slug: "db-delay-tracker",
      title: "Regional trains on time around Nürnberg, last 12 months",
      big: pct(regional[1]), small: "On time means less than 6 minutes late.",
      rows: cats.map(([label, v]) => [label, v, label === "regional", pct(v, 0)]),
      stale, foot: `${d ? "" : "Saved value · "}Data up to ${date(last)}${stale ? " (update overdue)" : ""}`,
    });
  }

  const LANG = ["German (fluent)", "English (fluent)"];
  function jobsTile(d) {
    const base = { name: "Job skill tracker", cadence: "Daily", slug: "job-skill-tracker" };
    if (!d) return tile({ ...base, title: "Job postings in Germany collected so far",
      big: LIVE_FALLBACK.jobs.postings.toLocaleString("en-GB"), foot: `Saved value · Week of ${date(LIVE_FALLBACK.jobs.week)}` });
    const skills = Object.entries(d.skills_all).filter(([s]) => !LANG.includes(s));
    const [first, share] = skills[0];
    const week = d.weekly.length ? d.weekly[d.weekly.length - 1].week : null;
    return tile({
      ...base, title: "Most-mentioned skill in job postings in Germany",
      big: first, small: `Mentioned in ${pct(share)} of ${d.postings.toLocaleString("en-GB")} postings.`,
      rows: skills.slice(1, 4).map(([s, v]) => [s, v / share, false, pct(v, 0)]),
      foot: week ? `Latest week: ${date(week)}` : "",
    });
  }

  // skills in demand for the chosen role, from the job skill tracker
  function renderMarket() {
    const d = state.jobs;
    $("#market").hidden = !d;
    if (!d) return;
    const t = TRACKS.find((x) => x.id === state.track);
    const role = d.by_role.find((r) => r.role === t.market);
    let rows, scope;
    if (role) {
      rows = role.top_skills.map((s) => { const m = s.match(/^(.*) \((\d+)%\)$/); return m ? [m[1], +m[2] / 100] : [s, 0]; });
      scope = `${role.postings} ${esc(role.role)} job postings`;
    } else {
      rows = Object.entries(d.skills_all);
      scope = `${d.postings.toLocaleString("en-GB")} job postings`;
    }
    rows = rows.filter(([s]) => !LANG.includes(s)).slice(0, 10);
    const ev = rows.map(([s]) => evidenceFor(s));
    let items = rows.map((r, i) => [r, ev[i]]);
    if (!SITE.showGaps) items = items.filter(([, e]) => e.kind !== "no");
    $("#market-title").textContent = `Skills in demand for ${t.label} in Germany`;
    $("#market-sub").innerHTML = `From ${scope} collected by my <a href="${repo("job-skill-tracker")}" target="_blank" rel="noopener">job skill tracker</a>, and where I have used each skill.`;
    const top = Math.max(...rows.map(([, v]) => v)) || 1;
    $("#market-list").innerHTML = items.map(([[s, v], e]) => `<li class="mrow">
      <span class="name">${esc(s)}</span>
      <span class="bar" title="${esc(s)}: ${pct(v)} of postings"><i style="width:${(v / top) * 100}%"></i></span>
      <span class="pct">${pct(v, 0)}</span>
      <span class="ev ${e.kind}"><span class="icon">${e.icon}</span>${e.html}</span>
    </li>`).join("");
  }

  function evidenceFor(name) {
    const def = MARKET_EVIDENCE[name] || {};
    const used = def.skills ? PROJECTS.filter((p) => p.skills.some((s) => def.skills.includes(s))) : [];
    if (used.length) {
      const names = used.slice(0, 2).map((p) => `<a href="${repo(p.slug)}" target="_blank" rel="noopener">${esc(p.title)}</a>`).join(", ");
      const more = used.length > 2 ? ` and ${used.length - 2} more` : "";
      return { kind: "yes", icon: "✓", html: `${names}${more}${def.note ? `; ${esc(def.note)}` : ""}` };
    }
    if (def.note) return { kind: "yes", icon: "✓", html: esc(def.note[0].toUpperCase() + def.note.slice(1)) };
    if (def.partial) return { kind: "part", icon: "~", html: `Partly: ${esc(def.partial)}` };
    return { kind: "no", icon: "–", html: "Not in a project yet" };
  }

  async function loadLive() {
    const [dax, db, jobs] = await Promise.allSettled(["dax-risk-monitor", "db-delay-tracker", "job-skill-tracker"].map((s) => getJSON(raw(s))));
    const val = (r) => (r.status === "fulfilled" ? r.value : null);
    $("#live-grid").innerHTML = daxTile(val(dax)) + dbTile(val(db)) + jobsTile(val(jobs));
    state.jobs = val(jobs);
    renderMarket();
  }

  // ---------- theme ----------
  const root = document.documentElement;
  $("#theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // ---------- start ----------
  state.track = trackFromUrl();
  $("#live-grid").innerHTML = daxTile(null) + dbTile(null) + jobsTile(null);
  render();
  markCurrent();
  loadLive();
})();
