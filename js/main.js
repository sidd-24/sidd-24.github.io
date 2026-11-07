(() => {
  const { SITE, TRACKS, SKILL_GROUPS, EXPERIENCE_SKILLS, PROJECTS, MARKET_EVIDENCE, EXPERIENCE, EXTRAS, LIVE_FALLBACK } = window;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const repo = (slug) => `${SITE.github}/${slug}`;
  const raw = (slug) => `https://raw.githubusercontent.com/sidd-24/${slug}/main/results/summary.json`;
  const pct = (x, d = 1) => `${(x * 100).toFixed(d)} %`;
  const date = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const SHORT = { ai: "AI", de: "Data engineering", ml: "Machine learning", bi: "BI", pm: "Product", qa: "QA" };

  const usage = {};
  for (const p of PROJECTS) for (const s of p.skills) usage[s] = (usage[s] || 0) + 1;

  const state = { track: "all", skill: null, jobs: null };

  // ---------- URL state: ?for=<role>&skill=<skill>, so links and the back button work ----------
  function readUrl() {
    const params = new URLSearchParams(location.search);
    const track = params.get("for");
    const skill = params.get("skill");
    return {
      track: TRACKS.some((t) => t.id === track) ? track : "all",
      skill: skill && usage[skill] ? skill : null,
    };
  }

  function writeUrl() {
    const url = new URL(location.href);
    state.track === "all" ? url.searchParams.delete("for") : url.searchParams.set("for", state.track);
    state.skill ? url.searchParams.set("skill", state.skill) : url.searchParams.delete("skill");
    url.hash = "";
    if (url.href !== location.href) history.pushState(null, "", url);
  }

  addEventListener("popstate", () => {
    const next = readUrl();
    if (next.track === state.track && next.skill === state.skill) return; // only the #section changed
    Object.assign(state, next);
    render();
  });

  // ---------- static content ----------
  for (const id of ["mail", "mail-2"]) $("#" + id).href = `mailto:${SITE.email}`;
  for (const id of ["li", "li-2"]) $("#" + id).href = SITE.linkedin;
  for (const id of ["gh", "gh-2"]) $("#" + id).href = SITE.github;
  $("#count-projects").textContent = PROJECTS.length;
  $("#count-live").textContent = PROJECTS.filter((p) => p.live).length;
  $("#year").textContent = new Date().getFullYear();

  $("#timeline").innerHTML = EXPERIENCE.map((x) => `<li>
    <p class="when">${esc(x.when)}</p>
    <h3>${esc(x.what)}</h3>
    <p class="where">${esc(x.where)}</p>
    <p class="detail">${esc(x.detail)}</p></li>`).join("");
  $("#extras").innerHTML = EXTRAS.map((x) => `<li>${esc(x)}</li>`).join("");

  const month = (ym) => new Date(ym + "-15").toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const thisMonth = new Date().toISOString().slice(0, 7);
  $("#certs").innerHTML = window.CERTS.map((c) => {
    const expired = c.expires && c.expires < thisMonth;
    const dates = c.issued ? ` · Issued ${month(c.issued)}${c.expires ? ` · ${expired ? "Expired" : "Valid until"} ${month(c.expires)}` : ""}` : "";
    return `<li${expired ? ' class="expired"' : ""}>
      <p class="cert-name">${esc(c.name)}</p>
      <p class="cert-meta">${esc(c.issuer + dates)}</p>
      ${c.id ? `<p class="cert-id">Credential ID ${esc(c.id)}</p>` : ""}</li>`;
  }).join("");

  // ---------- render ----------
  const roleList = $("#tracks");
  roleList.innerHTML = TRACKS.map((t) => `<button class="role" type="button" data-track="${t.id}" aria-pressed="false">${esc(t.label)}</button>`).join("");

  function render() {
    const t = TRACKS.find((x) => x.id === state.track);
    roleList.querySelectorAll(".role").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.track === state.track)));
    $("#pitch").textContent = t.pitch;
    $("#sub").textContent = t.sub.replace("{n}", PROJECTS.length);
    $("#copy").hidden = state.track === "all" && !state.skill;
    renderProjects();
    renderSkills();
    renderMarket();
  }

  // a filter change can shrink the list under a reader who has scrolled down: bring the first card back into view
  function showList() {
    const roles = $("#roles");
    const sticky = getComputedStyle(roles).position === "sticky";
    const offset = 60 + (sticky ? roles.offsetHeight : 0) + 8;
    const top = $("#filter-bar").getBoundingClientRect().top;
    if (top < offset || top > innerHeight * 0.7) scrollTo({ top: scrollY + top - offset });
  }

  function update(changes) {
    Object.assign(state, changes);
    writeUrl();
    render();
    showList();
  }

  roleList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-track]");
    if (b && b.dataset.track !== state.track) update({ track: b.dataset.track, skill: null });
  });

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-skill]");
    if (s && !s.disabled) update({ skill: state.skill === s.dataset.skill ? null : s.dataset.skill });
    if (e.target.closest("[data-clear]")) update({ skill: null });
  });

  $("#copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Link copied");
    } catch (e) {
      toast(location.href);
    }
  });

  // ---------- projects ----------
  function renderProjects() {
    const { track, skill } = state;
    const list = PROJECTS.map((p, i) => ({ p, i }))
      .filter(({ p }) => track === "all" || p.tracks.includes(track))
      .filter(({ p }) => !skill || p.skills.includes(skill));
    const key = ({ p, i }) => (track !== "all" && p.tracks[0] !== track ? 100 : 0) + (p.featured ? 0 : 50) + i / 100;
    list.sort((a, b) => key(a) - key(b));

    const t = TRACKS.find((x) => x.id === track);
    let text = `Showing <strong>${list.length}</strong> of ${PROJECTS.length} projects`;
    if (track !== "all") text += ` for <strong>${esc(t.label)}</strong>`;
    if (skill) text += ` that use <strong>${esc(skill)}</strong>`;
    const bits = [`<span>${text}.</span>`];
    if (skill) bits.push(`<button class="link-btn" type="button" data-clear>Remove skill filter</button>`);
    else if (track !== "all") bits.push(`<a href="#skills">Skills for this role ↓</a>`);
    $("#filter-bar").innerHTML = bits.join("");

    $("#projects").innerHTML = list.length ? list.map(({ p }) => card(p)).join("")
      : `<p class="empty">No ${esc(t.label)} project uses ${esc(skill)}. <button class="link-btn" type="button" data-clear>Remove skill filter</button></p>`;
  }

  function card(p) {
    const live = p.live ? `<span class="badge">Updates automatically</span>` : "";
    const note = p.note ? `<p class="note"><b>Limitation:</b> ${esc(p.note)}</p>` : "";
    const tags = p.skills.map((s) => `<button class="tag${s === state.skill ? " on" : ""}" type="button" data-skill="${esc(s)}" title="Show projects using ${esc(s)}">${esc(s)}</button>`).join("");
    return `<article class="project card">
      <div class="project-top"><span>${p.tracks.map((t) => SHORT[t]).join(" · ")}</span>${live}</div>
      <h3><a href="${repo(p.slug)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
      <p class="what">${esc(p.what)}</p>
      <div class="result">${result(p.result)}</div>
      ${note}
      <div class="tags">${tags}</div>
    </article>`;
  }

  function result(r) {
    if (r.type === "stat") return `<div class="stat"><span class="big">${esc(r.value)}</span><span>${esc(r.label)}</span></div>`;
    const better = r.better === "target" ? `closest to ${r.target} is best` : `${r.better} is better`;
    const max = Math.max(...r.bars.map((b) => b.value), r.target || 0) || 1;
    const target = r.target ? `<span class="target" style="left:${(r.target / max) * 100}%" title="Expected: ${r.target}"></span>` : "";
    const rows = r.bars.map((b) => {
      const shown = b.display ?? b.value;
      return `<div class="bar-row${b.ours ? " ours" : ""}" title="${esc(b.label)}: ${esc(shown)}">
        <span class="lbl">${esc(b.label)}</span>
        <span class="bar"><i style="width:${(b.value / max) * 100}%"></i>${target}</span>
        <span class="val">${esc(shown)}</span></div>`;
    }).join("");
    return `<p class="metric"><span>${esc(r.metric)}</span><span>${better}</span></p><div class="bars">${rows}</div>`;
  }

  // ---------- skills ----------
  function renderSkills() {
    const groups = [...SKILL_GROUPS].sort((a, b) => (b.track === state.track) - (a.track === state.track));
    $("#skill-groups").innerHTML = groups.map((g) => {
      const items = [...g.skills].sort((a, b) => (usage[b] || 0) - (usage[a] || 0)).map((s) => {
        const n = usage[s] || 0;
        const label = n ? `${s}: used in ${n} project${n === 1 ? "" : "s"}` : `${s}: ${EXPERIENCE_SKILLS[s] || "from work experience"}`;
        const badge = n ? `<span class="n">${n}</span>` : `<span class="n exp">work</span>`;
        return `<li><button class="skill${s === state.skill ? " on" : ""}" type="button" data-skill="${esc(s)}" ${n ? "" : "disabled"} title="${esc(label)}" aria-label="${esc(label)}">${esc(s)}${badge}</button></li>`;
      }).join("");
      return `<div class="group card${g.track === state.track ? " hl" : ""}"><h3>${esc(g.name)}</h3><ul>${items}</ul></div>`;
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
      big: pct(v), small: `About €${(Math.round(v * 1e4) * 100).toLocaleString("en-GB")} on a €1m portfolio, from the model that passed the backtest.`,
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
      big: pct(regional[1]), small: "On time means less than 6 minutes late, as DB defines it.",
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

  function renderMarket() {
    const d = state.jobs;
    $("#market").hidden = !d;
    if (!d) return;
    const t = TRACKS.find((x) => x.id === state.track);
    const role = t.market && d.by_role.find((r) => r.role === t.market);
    let rows, scope;
    if (role) {
      rows = role.top_skills.map((s) => { const m = s.match(/^(.*) \((\d+)%\)$/); return m ? [m[1], +m[2] / 100] : [s, 0]; });
      scope = `${role.postings} ${esc(role.role)} postings`;
    } else {
      rows = Object.entries(d.skills_all).slice(0, 12);
      scope = `all ${d.postings.toLocaleString("en-GB")} postings`;
    }
    rows = rows.filter(([s]) => !LANG.includes(s)).slice(0, 10);
    const ev = rows.map(([s]) => evidenceFor(s));
    const covered = ev.filter((e) => e.kind === "yes").length;
    let items = rows.map((r, i) => [r, ev[i]]);
    if (!SITE.showGaps) items = items.filter(([, e]) => e.kind !== "no");
    $("#market-sub").innerHTML = `The most-mentioned skills in ${scope} collected by my <a href="${repo("job-skill-tracker")}" target="_blank" rel="noopener">job skill tracker</a>, and where I have used them: <strong>${covered} of ${rows.length}</strong> so far.${role ? "" : " Choose a role above to see the list for that role."}`;
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

  // ---------- theme & toast ----------
  const root = document.documentElement;
  $("#theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
  }

  // ---------- start ----------
  Object.assign(state, readUrl());
  $("#live-grid").innerHTML = daxTile(null) + dbTile(null) + jobsTile(null);
  render();
  loadLive();
})();
