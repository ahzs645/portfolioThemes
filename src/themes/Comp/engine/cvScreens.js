// Build HTML elements for the CSS3D monitor/arcade surfaces from the
// normalized CV (the shape returned by useCV()). Each builder returns a
// single DIV element with inline styles so it renders correctly inside
// CSS3DObject containers.

const baseStyle = (width, height, bg = "#0b1220", color = "#e2e8f0") => `
  width:${width}px;height:${height}px;box-sizing:border-box;
  background:${bg};color:${color};font-family:'Inter',system-ui,sans-serif;
  overflow:hidden;padding:48px;display:flex;flex-direction:column;gap:18px;
`;

const escape = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildAboutScreen(cv, { width, height }) {
  const education = cv?.education?.[0];
  const award = cv?.awards?.[0];
  const currentRole = cv?.currentJobTitle || cv?.experience?.[0]?.position || "";
  const currentCompany = cv?.experience?.[0]?.company || "";

  const div = document.createElement("div");
  div.style.cssText = baseStyle(width, height, "#0a0e1a", "#e6e8ee");
  div.innerHTML = `
    <div style="font-size:64px;font-weight:700;letter-spacing:-0.02em;line-height:1;">
      ${escape(cv?.name || "")}
    </div>
    <div style="font-size:28px;color:#94a3b8;font-weight:500;">
      ${escape(currentRole)}${currentCompany ? ` &middot; ${escape(currentCompany)}` : ""}
    </div>
    <div style="font-size:22px;color:#94a3b8;">${escape(cv?.location || "")}</div>
    <hr style="border:none;border-top:1px solid #1f2937;margin:8px 0;"/>
    ${
      education
        ? `<div>
            <div style="font-size:18px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Education</div>
            <div style="font-size:24px;font-weight:600;">${escape(education.degree || "")} &middot; ${escape(education.area || "")}</div>
            <div style="font-size:20px;color:#94a3b8;">${escape(education.institution || "")}</div>
          </div>`
        : ""
    }
    ${
      award
        ? `<div>
            <div style="font-size:18px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Recent Award</div>
            <div style="font-size:22px;font-weight:600;">${escape(award.name || "")}</div>
            <div style="font-size:18px;color:#94a3b8;">${escape(award.summary || "")}</div>
          </div>`
        : ""
    }
    <div style="margin-top:auto;font-size:18px;color:#475569;">
      ${escape(cv?.email || "")}${cv?.website ? ` &middot; ${escape(String(cv.website).replace(/^https?:\/\//, ""))}` : ""}
    </div>
  `;
  return div;
}

export function buildProjectsScreen(cv, { width, height }) {
  const projects = cv?.projects || [];
  const div = document.createElement("div");
  div.style.cssText = baseStyle(width, height, "#0f172a", "#f1f5f9");

  const items = projects
    .slice(0, 6)
    .map(
      (p) => `
      <div style="padding:18px 20px;background:rgba(30,41,59,0.6);border:1px solid #1e293b;border-radius:12px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <div style="font-size:22px;font-weight:600;">${escape(p.name || "")}</div>
          <div style="font-size:16px;color:#64748b;">${escape(p.date || "")}</div>
        </div>
        <div style="font-size:16px;color:#94a3b8;line-height:1.4;">${escape(p.summary || "")}</div>
      </div>`
    )
    .join("");

  div.innerHTML = `
    <div style="font-size:48px;font-weight:700;letter-spacing:-0.02em;">Projects</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;overflow:hidden;">${items}</div>
  `;
  return div;
}

export function buildArcadeScreen(cv, { width, height }) {
  const experience = cv?.experience || [];

  const div = document.createElement("div");
  div.style.cssText = `
    width:${width}px;height:${height}px;box-sizing:border-box;
    background:#000;color:#7fff7f;
    font-family:'Press Start 2P','Courier New',monospace;
    overflow:hidden;padding:40px;display:flex;flex-direction:column;
    text-shadow:0 0 8px rgba(127,255,127,0.6);
  `;

  const items = experience
    .slice(0, 6)
    .map((e, i) => {
      const role = e.position || e.title || "";
      return `
        <div style="margin-bottom:24px;font-size:16px;line-height:1.6;">
          <div style="color:#fff;">${String(i + 1).padStart(2, "0")}. ${escape(String(role).toUpperCase())}</div>
          <div style="color:#7fff7f;font-size:14px;margin-top:6px;">${escape(String(e.company || "").toUpperCase())}</div>
        </div>`;
    })
    .join("");

  div.innerHTML = `
    <div style="font-size:24px;text-align:center;margin-bottom:8px;color:#fff;">&#9733; HIGH SCORES &#9733;</div>
    <div style="font-size:14px;text-align:center;margin-bottom:32px;color:#7fff7f;">&mdash; EXPERIENCE LOG &mdash;</div>
    <div style="overflow:hidden;">${items}</div>
    <div style="margin-top:auto;font-size:12px;text-align:center;color:#7fff7f;opacity:0.7;">
      INSERT COIN TO CONTINUE
    </div>
  `;
  return div;
}
