(function () {
  const data = window.CURRICULUM_DATA;
  const summaryGrid = document.querySelector("#summaryGrid");
  const moduleList = document.querySelector("#moduleList");
  const resultCount = document.querySelector("#resultCount");

  function icon(name) {
    return `<i data-lucide="${name}"></i>`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSummary() {
    const stats = [
      ["Modules", "8", "layers"],
      ["Topics", "141", "list-checks"],
      ["Tasks", "152", "clipboard-check"],
      ["Projects", "10", "briefcase-business"],
    ];

    summaryGrid.innerHTML = stats
      .map(
        ([label, value, iconName]) => `
          <article class="stat">
            <div>
              <strong>${value}</strong>
              <span>${label}</span>
            </div>
            <i data-lucide="${iconName}"></i>
          </article>
        `,
      )
      .join("");
  }

  function renderTable(module) {
    const rows = module.lessons
      .map((lesson) => {
        const detailText = lesson.details || "Class discussion";
        const projectText = lesson.project || "Practice task";

        return `
          <tr>
            <td>${escapeHtml(lesson.serial)}</td>
            <td class="topic-cell">
              <strong>${escapeHtml(lesson.topic || detailText)}</strong>
              <span>${escapeHtml(detailText)}</span>
            </td>
            <td>${escapeHtml(projectText)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Topic</th>
              <th>Task / Project</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderModules() {
    resultCount.textContent = "141 topics";
    moduleList.innerHTML = data.modules
      .map((module, index) => {
        const capstone = module.capstoneProject || "Practice tasks";
        return `
          <article class="module-card">
            <header class="module-header">
              <div class="module-title-row">
                <span class="module-index">${index + 1}</span>
                <div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <span class="badge badge--project">${icon("target")} ${escapeHtml(capstone)}</span>
                </div>
              </div>
              <div class="lesson-meta">
                <span class="badge">${icon("book-marked")} ${module.lessons.length} topics</span>
              </div>
            </header>
            ${renderTable(module)}
          </article>
        `;
      })
      .join("");
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderSummary();
  renderModules();
  refreshIcons();
})();
