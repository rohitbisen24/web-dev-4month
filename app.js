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

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem('curriculum_progress')) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem('curriculum_progress', JSON.stringify(progress));
  }

  function renderTable(module, moduleIndex, progressState) {
    const rows = module.lessons
      .map((lesson, lessonIndex) => {
        const detailText = lesson.details || "Class discussion";
        const projectText = lesson.project || "Practice task";
        const id = `topic-${moduleIndex}-${lessonIndex}`;
        const isChecked = progressState[id] ? "checked" : "";

        return `
          <tr class="${isChecked ? 'completed-animation' : ''}" data-module-index="${moduleIndex}">
            <td class="checkbox-wrapper">
              <div class="checkbox-cell">
                <label class="custom-checkbox">
                  <input type="checkbox" class="topic-checkbox" data-id="${id}" ${isChecked} />
                  <span class="checkmark"></span>
                </label>
                <span class="serial-num">${escapeHtml(lesson.serial)}</span>
              </div>
            </td>
            <td class="topic-cell">
              <strong>${escapeHtml(lesson.topic || detailText)}</strong>
              <span>${escapeHtml(detailText)}</span>
            </td>
            <td class="task-cell">${escapeHtml(projectText)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Done</th>
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
    const progressState = getProgress();
    
    moduleList.innerHTML = data.modules
      .map((module, index) => {
        const capstone = module.capstoneProject || "Practice tasks";
        
        let completedInModule = 0;
        module.lessons.forEach((l, lIdx) => {
           if (progressState[`topic-${index}-${lIdx}`]) completedInModule++;
        });
        const progressPercent = module.lessons.length > 0 ? (completedInModule / module.lessons.length) * 100 : 0;

        return `
          <article class="module-card" data-module-index="${index}">
            <div class="module-progress-bar">
              <div class="module-progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <header class="module-header">
              <div class="module-title-row">
                <span class="module-index">${index + 1}</span>
                <div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <span class="badge badge--project">${icon("target")} ${escapeHtml(capstone)}</span>
                </div>
              </div>
              <div class="lesson-meta">
                <span class="badge module-progress-text">${completedInModule} / ${module.lessons.length} Done</span>
                <span class="badge">${icon("book-marked")} ${module.lessons.length} topics</span>
              </div>
            </header>
            ${renderTable(module, index, progressState)}
          </article>
        `;
      })
      .join("");
  }

  function updateProgressBars() {
    const progressState = getProgress();
    data.modules.forEach((module, index) => {
      let completedInModule = 0;
      module.lessons.forEach((l, lIdx) => {
         if (progressState[`topic-${index}-${lIdx}`]) completedInModule++;
      });
      const progressPercent = module.lessons.length > 0 ? (completedInModule / module.lessons.length) * 100 : 0;
      
      const card = document.querySelector(`.module-card[data-module-index="${index}"]`);
      if (card) {
        const fill = card.querySelector('.module-progress-fill');
        const text = card.querySelector('.module-progress-text');
        if (fill) fill.style.width = `${progressPercent}%`;
        if (text) text.innerHTML = `${completedInModule} / ${module.lessons.length} Done`;
      }
    });
  }

  function setupCheckboxes() {
    moduleList.addEventListener('change', (e) => {
      if (e.target.classList.contains('topic-checkbox')) {
        const id = e.target.dataset.id;
        const progressState = getProgress();
        progressState[id] = e.target.checked;
        saveProgress(progressState);
        
        const row = e.target.closest('tr');
        if (e.target.checked) {
          row.classList.add('completed-animation');
          // Trigger a satisfying reflow/animation if needed, done via CSS classes mostly.
        } else {
          row.classList.remove('completed-animation');
        }
        updateProgressBars();
      }
    });
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderSummary();
  renderModules();
  setupCheckboxes();
  refreshIcons();
})();
