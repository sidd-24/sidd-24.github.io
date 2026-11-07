(() => {
  const { SITE, TRACKS, SKILL_GROUPS, EXPERIENCE_SKILLS, PROJECTS, MARKET_EVIDENCE, EXPERIENCE, EXTRAS, LIVE_FALLBACK } = window;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const repo = (slug) => `${SITE.github}/${slug}`;
  const raw = (slug) => `https://raw.githubusercontent.com/sidd-24/${slug}/main/results/summary.json`;
  const pct = (x, d = 1) => `${(x * 100).toFixed(d)} %`;
  const date = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const SHORT = { ai: "AI", de: "Data eng.", ml: "ML", bi: "BI", pm: "Product", qa: "QA" };

  const state = { track: "all", skill: null, jobs: null };
  const params = new URLSearchParams(location.search);
  if (TRACKS.some((t) => t.id === params.get("for"))) state.track = params.get("for");

  // ---------- contact links ----------
  for (const id of ["mail", "mail-2"]) $("#" + id).href = `mailto:${SITE.email}`;
  for (const id of ["li", "li-2"]) $("#" + id).href = SITE.linkedin;
  for (const id of ["gh", "gh-2"]) $("#" + id).href = SITE.github;
  $("#count-projects").textContent = PROJECTS.length;
  $("#count-live").textContent = PROJECTS.filter((p) => p.live).length;

  // ---------- tracks ----------
  const trackList = $("#tracks");
  trackList.innerHTML = TRACKS.map((t) => `<button class="chip" type="button" data-track="${t.id}" aria-pressed="false">${esc(t.label)}</button>`).join("");
  trackList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-track]");
    if (b) setTrack(b.dataset.track, true);
  });

  function setTrack(id, user) {
    state.track = id;
    state.skill = null;
    const t = TRACKS.find((x) => x.id === id);
    trackList.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.track === id)));
    const pitch = $("#pitch"), sub = $("#sub");
    pitch.innerHTML = t.pitch;
    sub.textContent = t.sub.replace("{n}", PROJECTS.length);
    for (const el of [pitch, sub]) { el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade"); }
    $("#copy").hidden = id === "all";
    if (user) {
      const url = new URL(location.href);
      id === "all" ? url.searchParams.delete("for") : url.searchParams.set("for", id);
      history.replaceState(null, "", url);
    }
    renderProjects();
    renderSkills();
    renderMarket();
  }

  $("#copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Link copied. It opens the page in this view."); }
    catch (e) { toast(location.href); }
  });

  // ---------- projects ----------
  function renderProjects() {
    const { track, skill } = state;
    let list = PROJECTS.map((p, i) => ({ p, i }))
      .filter(({ p }) => track === "all" || p.tracks.includes(track))
      .filter(({ p }) => !skill || p.skills.includes(skill));
    const key = ({ p, i }) => (track !== "all" && p.tracks[0] !== track ? 100 : 0) + (p.featured ? 0 : 50) + i / 100;
    list.sort((a, b) => key(a) - key(b));

    const t = TRACKS.find((x) => x.id === track);
    const bits = [`<span><strong>${list.length}</strong> project${list.length === 1 ? "" : "s"}</span>`];
    if (track !== "all") bits.push(`<span>for <strong>${esc(t.label)}</strong></span>`);
    if (skill) bits.push(`<span>using <strong>${esc(skill)}</strong></span>`, `<button class="clear" type="button" data-clear>Clear skill ×</button>`);
    $("#filter-bar").innerHTML = bits.join(" ");

    $("#projects").innerHTML = list.map(({ p }) => card(p)).join("") ||
      `<p class="muted">No project uses ${esc(skill)} in this view. <button class="clear" type="button" data-clear>Clear the skill filter</button></p>`;
  }

  function card(p) {
    const labels = p.tracks.map((t) => SHORT[t]).join(" · ");
    const live = p.live ? `<span class="live-tag"><span class="dot"></span>live</span>` : "";
    const note = p.note ? `<p class="note"><b>Caveat</b>${esc(p.note)}</p>` : "";
    const tags = p.skills.map((s) => `<button class="tag${s === state.skill ? " on" : ""}" type="button" data-skill="${esc(s)}">${esc(s)}</button>`).join("");
    return `<article class="card">
      <div class="card-top"><span>${labels}</span>${live}</div>
      <h3><a href="${repo(p.slug)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
      <p class="what">${esc(p.what)}</p>
      <div class="result">${result(p.result)}</div>
      ${note}
      <div class="tags">${tags}</div>
    </article>`;
  }

  function result(r) {
    if (r.type === "stat") return `<div class="stat"><span class="big">${esc(r.value)}</span><span>${esc(r.label)}</span></div>`;
    const better = r.better === "target" ? `closest to ${r.target} wins` : `${r.better} is better`;
    const max = Math.max(...r.bars.map((b) => b.value), r.target || 0) || 1;
    const target = r.target ? `<span class="target" style="left:${(r.target / max) * 100}%" title="Expected: ${r.target}"></span>` : "";
    const rows = r.bars.map((b) => {
      const shown = b.display ?? b.value;
      return `<div class="bar-row${b.ours ? " ours" : ""}" title="${esc(b.label)}: ${esc(shown)}">
        <span class="lbl">${esc(b.label)}</span>
        <span class="bar-track"><i style="width:${(b.value / max) * 100}%"></i>${target}</span>
        <span class="val">${esc(shown)}</span></div>`;
    }).join("");
    return `<p class="metric"><span>${esc(r.metric)}</span><b>${better}</b></p><div class="bars">${rows}</div>`;
  }

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-skill]");
    if (s && !s.disabled) {
      state.skill = state.skill === s.dataset.skill ? null : s.dataset.skill;
      renderProjects();
      renderSkills();
      if (s.closest("#skills")) $("#work").scrollIntoView();
    }
    if (e.target.closest("[data-clear]")) { state.skill = null; renderProjects(); renderSkills(); }
  });

  // ---------- skills ----------
  const usage = {};
  for (const p of PROJECTS) for (const s of p.skills) usage[s] = (usage[s] || 0) + 1;

  function renderSkills() {
    const groups = [...SKILL_GROUPS].sort((a, b) => (b.track === state.track) - (a.track === state.track));
    $("#skill-groups").innerHTML = groups.map((g) => {
      const items = [...g.skills].sort((a, b) => (usage[b] || 0) - (usage[a] || 0)).map((s) => {
        const n = usage[s] || 0;
        const badge = n ? `<span class="n">${n}</span>` : `<span class="n exp" title="${esc(EXPERIENCE_SKILLS[s] || "")}">work</span>`;
        const label = n ? `${s}: used in ${n} project${n === 1 ? "" : "s"}` : `${s}: ${EXPERIENCE_SKILLS[s] || "from work experience"}`;
        return `<li><button class="skill${s === state.skill ? " on" : ""}" type="button" data-skill="${esc(s)}" ${n ? "" : "disabled"} aria-label="${esc(label)}" title="${esc(label)}">${esc(s)}${badge}</button></li>`;
      }).join("");
      return `<div class="group${g.track === state.track ? " hl" : ""}"><h3>${esc(g.name)}</h3><ul>${items}</ul></div>`;
    }).join("");
  }

  // ---------- live data ----------
  async function getJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  const daysOld = (d) => (Date.now() - new Date(d + "T12:00:00")) / 864e5;

  function tile({ label, cadence, title, big, word, small, rows, foot, slug, stale }) {
    const mini = rows ? `<div class="minirows">${rows.map(([name, v, hi, shown]) =>
      `<div class="minirow" title="${esc(name)}: ${esc(shown)}"><span>${esc(name)}</span><span class="track-bar"><i class="${hi ? "hi" : ""}" style="width:${Math.min(v, 1) * 100}%"></i></span><span class="v">${esc(shown)}</span></div>`).join("")}</div>` : "";
    return `<article class="tile">
      <div class="tile-top"><span>${esc(label)}</span><span class="cadence"><span class="dot"></span>${esc(cadence)}</span></div>
      <h3>${esc(title)}</h3>
      <p class="big${word ? " word" : ""}">${esc(big)}</p>
      ${small ? `<p class="small">${small}</p>` : ""}
      ${mini}
      <p class="tile-foot"><span class="${stale ? "stale" : ""}">${esc(foot)}</span><a href="${repo(slug)}" target="_blank" rel="noopener">source ↗</a></p>
    </article>`;
  }

  function daxTile(d, cached) {
    const models = [["Filtered HS", "Filtered historical simulation"], ["GARCH-t", "GARCH(1,1), Student-t"], ["EWMA", "EWMA (RiskMetrics)"], ["Hist. sim.", "Historical simulation"]];
    let v, week, rows;
    if (d) {
      v = d.var_next_week["Filtered historical simulation"];
      week = d.last_week;
      const top = Math.max(...Object.values(d.var_next_week));
      rows = models.map(([short, name], i) => [short, d.var_next_week[name] / top, i === 0, pct(d.var_next_week[name])]);
    } else { v = LIVE_FALLBACK.dax.var; week = LIVE_FALLBACK.dax.last_week; }
    return tile({
      label: "DAX risk monitor", cadence: "weekly", slug: "dax-risk-monitor",
      title: "Next week's 99 % Value-at-Risk, 15 DAX stocks",
      big: pct(v), small: `≈ €${(Math.round(v * 1e4) * 100).toLocaleString("en-GB")} on a €1m portfolio, from the only model that passes the backtest`,
      rows, stale: daysOld(week) > 14,
      foot: `${cached ? "cached · " : ""}week ending ${date(week)}`,
    });
  }

  function dbTile(d, cached) {
    const cats = d ? d.last_12_months_by_category.map((c) => [c.category, c.punctual_share]) : LIVE_FALLBACK.db.cats;
    const last = d ? d.period.last_day : LIVE_FALLBACK.db.last_day;
    const regional = cats.find((c) => c[0] === "regional");
    return tile({
      label: "Deutsche Bahn tracker", cadence: "monthly", slug: "db-delay-tracker",
      title: "Regional trains on time, Nürnberg area, last 12 months",
      big: pct(regional[1]), small: "Under 6 minutes late, DB's own definition. Four stations, all stops.",
      rows: cats.map(([name, v]) => [name, v, name === "regional", pct(v, 0)]),
      stale: daysOld(last) > 45, foot: `${cached ? "cached · " : ""}data to ${date(last)}`,
    });
  }

  const LANG = ["German (fluent)", "English (fluent)"];
  function jobsTile(d, cached) {
    if (!d) return tile({ label: "Job skill tracker", cadence: "daily", slug: "job-skill-tracker",
      title: "Job postings in Germany collected so far", big: LIVE_FALLBACK.jobs.postings.toLocaleString("en-GB"),
      foot: `cached · week of ${date(LIVE_FALLBACK.jobs.week)}` });
    const skills = Object.entries(d.skills_all).filter(([s]) => !LANG.includes(s));
    const [first, share] = skills[0];
    const week = d.weekly.length ? d.weekly[d.weekly.length - 1].week : null;
    return tile({
      label: "Job skill tracker", cadence: "daily", slug: "job-skill-tracker",
      title: "Most-mentioned skill in job postings in Germany",
      big: first, word: true, small: `in ${pct(share)} of ${d.postings.toLocaleString("en-GB")} postings`,
      rows: skills.slice(1, 4).map(([s, v]) => [s, v / share, false, pct(v, 0)]),
      foot: `${cached ? "cached · " : ""}${week ? `latest week: ${date(week)}` : ""}`,
    });
  }

  function renderMarket() {
    const d = state.jobs;
    const market = $("#market");
    if (!d) { market.hidden = true; return; }
    market.hidden = false;
    const t = TRACKS.find((x) => x.id === state.track);
    const role = t.market && d.by_role.find((r) => r.role === t.market);
    let rows, scope;
    if (role) {
      rows = role.top_skills.map((s) => { const m = s.match(/^(.*) \((\d+)%\)$/); return m ? [m[1], +m[2] / 100] : [s, 0]; });
      scope = `<b>${role.postings}</b> ${esc(role.role)} postings`;
    } else {
      rows = Object.entries(d.skills_all).filter(([s]) => !LANG.includes(s)).slice(0, 10);
      scope = `all <b>${d.postings.toLocaleString("en-GB")}</b> postings`;
    }
    rows = rows.filter(([s]) => !LANG.includes(s));
    const evidence = rows.map(([s]) => evidenceFor(s));
    const covered = evidence.filter((e) => e.kind === "yes").length;
    const shown = SITE.showGaps ? rows.map((r, i) => [r, evidence[i]]) : rows.map((r, i) => [r, evidence[i]]).filter(([, e]) => e.kind !== "no");
    $("#market-sub").innerHTML = `The top skills in ${scope} collected by my <a href="${repo("job-skill-tracker")}" target="_blank" rel="noopener">job-skill-tracker</a>. I have used <b>${covered} of ${rows.length}</b> in public projects or at work. Pick a role above to see that role's list.`;
    const top = Math.max(...rows.map(([, v]) => v)) || 1;
    $("#market-list").innerHTML = shown.map(([[s, v], e], i) => `<li class="mrow">
      <span class="rank">${String(i + 1).padStart(2, "0")}</span>
      <span class="name">${esc(s)}</span>
      <span class="track-bar" title="${esc(s)}: ${pct(v)} of postings"><i style="width:${(v / top) * 100}%"></i></span>
      <span class="pct">${pct(v, 0)}</span>
      <span class="ev ${e.kind}"><span class="icon">${e.icon}</span><span>${e.html}</span></span>
    </li>`).join("");
  }

  function evidenceFor(name) {
    const def = MARKET_EVIDENCE[name] || {};
    const used = def.skills ? PROJECTS.filter((p) => p.skills.some((s) => def.skills.includes(s))) : [];
    if (used.length) {
      const names = used.slice(0, 2).map((p) => `<a href="${repo(p.slug)}" target="_blank" rel="noopener">${esc(p.title)}</a>`).join(", ");
      const more = used.length > 2 ? ` +${used.length - 2} more` : "";
      return { kind: "yes", icon: "✓", html: `${used.length} project${used.length === 1 ? "" : "s"}: ${names}${more}${def.note ? `; ${esc(def.note)}` : ""}` };
    }
    if (def.note) return { kind: "yes", icon: "✓", html: esc(def.note[0].toUpperCase() + def.note.slice(1)) };
    if (def.partial) return { kind: "part", icon: "◐", html: `Partly: ${esc(def.partial)}` };
    return { kind: "no", icon: "○", html: "Not in a public project yet" };
  }

  async function loadLive() {
    const grid = $("#live-grid");
    const [dax, db, jobs] = await Promise.allSettled([raw("dax-risk-monitor"), raw("db-delay-tracker"), raw("job-skill-tracker")].map(getJSON));
    const val = (r) => (r.status === "fulfilled" ? r.value : null);
    grid.innerHTML = daxTile(val(dax), !val(dax)) + dbTile(val(db), !val(db)) + jobsTile(val(jobs), !val(jobs));
    state.jobs = val(jobs);
    renderMarket();
  }

  // ---------- about ----------
  $("#timeline").innerHTML = EXPERIENCE.map((x) => `<li>
    <span class="when">${esc(x.when)}</span>
    <div><h3>${esc(x.what)}</h3><p class="where">${esc(x.where)}</p><p class="detail">${esc(x.detail)}</p></div></li>`).join("");
  $("#extras").innerHTML = EXTRAS.map((x) => `<li>${esc(x)}</li>`).join("");

  // ---------- chrome ----------
  const root = document.documentElement;
  $("#theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
  const top = $(".top");
  addEventListener("scroll", () => top.classList.toggle("scrolled", scrollY > 8), { passive: true });

  let toastEl;
  function toast(msg) {
    toastEl ??= Object.assign(document.body.appendChild(document.createElement("div")), { className: "toast", role: "status" });
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl.t);
    toastEl.t = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  $("#live-grid").innerHTML = daxTile(null, true) + dbTile(null, true) + jobsTile(null, true);
  $("#market").hidden = true;
  setTrack(state.track, false);
  loadLive();
})();
