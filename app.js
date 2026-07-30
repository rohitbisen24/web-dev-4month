(function () {
  const data = window.CURRICULUM_DATA;
  const state = {
    query: "",
    module: "all",
    mode: "student",
  };

  const summaryGrid = document.querySelector("#summaryGrid");
  const moduleFilters = document.querySelector("#moduleFilters");
  const moduleList = document.querySelector("#moduleList");
  const searchInput = document.querySelector("#searchInput");
  const resultCount = document.querySelector("#resultCount");
  const printButton = document.querySelector("#printButton");

  const totalLessons = data.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalProjects = data.modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => lesson.project && lesson.project.trim()).length,
    0,
  );

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
      ["Modules", data.modules.length, "layers"],
      ["Lessons", totalLessons, "list-checks"],
      ["Projects", totalProjects, "briefcase-business"],
      ["PDF Ready", "Yes", "file-text"],
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

  function renderFilters() {
    const filters = [{ title: "All modules", value: "all", count: totalLessons }].concat(
      data.modules.map((module) => ({
        title: module.title,
        value: module.title,
        count: module.lessons.length,
      })),
    );

    moduleFilters.innerHTML = filters
      .map(
        (filter) => `
          <button class="module-pill ${state.module === filter.value ? "is-active" : ""}" type="button" data-module="${escapeHtml(filter.value)}">
            <span>${escapeHtml(filter.title)}</span>
            <small>${filter.count}</small>
          </button>
        `,
      )
      .join("");

    moduleFilters.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        state.module = button.dataset.module;
        render();
      });
    });
  }

  function lessonMatches(lesson) {
    const query = state.query.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [lesson.topic, lesson.details, lesson.project, lesson.notes]
      .join(" ")
      .toLowerCase()
      .includes(query);
  }

  function visibleModules() {
    return data.modules
      .filter((module) => state.module === "all" || module.title === state.module)
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter(lessonMatches),
      }))
      .filter((module) => module.lessons.length > 0);
  }

  function renderTable(module) {
    const teacherColumns =
      state.mode === "teacher"
        ? `<th>Concepts / Notes</th>`
        : "";

    const rows = module.lessons
      .map((lesson) => {
        const detailText = lesson.details || "Class discussion";
        const projectText = lesson.project || "Practice task";
        const notesText = lesson.notes || "Teacher can add notes during class.";

        return `
          <tr>
            <td>${escapeHtml(lesson.serial)}</td>
            <td class="topic-cell">
              <strong>${escapeHtml(lesson.topic || detailText)}</strong>
              <span>${escapeHtml(detailText)}</span>
            </td>
            <td>${escapeHtml(projectText)}</td>
            ${
              state.mode === "teacher"
                ? `<td>${escapeHtml(notesText)}</td>`
                : ""
            }
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
              <th>Project / Practical</th>
              ${teacherColumns}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderModules() {
    const modules = visibleModules();
    const visibleLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    resultCount.textContent = `${visibleLessons} lesson${visibleLessons === 1 ? "" : "s"} shown`;

    if (!modules.length) {
      moduleList.innerHTML = `<div class="empty-state">No lessons match this search.</div>`;
      return;
    }

    moduleList.innerHTML = modules
      .map((module) => {
        const moduleNumber = data.modules.findIndex((item) => item.title === module.title) + 1;
        const capstone = module.capstoneProject || "Classroom practice";
        return `
          <article class="module-card">
            <header class="module-header">
              <div class="module-title-row">
                <span class="module-index">${moduleNumber}</span>
                <div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <span class="badge badge--project">${icon("target")} ${escapeHtml(capstone)}</span>
                </div>
              </div>
              <div class="lesson-meta">
                <span class="badge">${icon("book-marked")} ${module.lessons.length} lessons</span>
                <span class="badge">${icon("presentation")} Teacher + student view</span>
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

  function render() {
    renderFilters();
    renderModules();
    refreshIcons();
  }

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderModules();
    refreshIcons();
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.mode === state.mode);
      });
      renderModules();
      refreshIcons();
    });
  });

  printButton.addEventListener("click", () => window.print());

  renderSummary();
  render();
})();
