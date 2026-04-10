// File: js/index.js

document.addEventListener("DOMContentLoaded", () => {
  /* --- 企業名反映 --- */
  document.getElementById("company-name").textContent = COMPANY_NAME;

  const container = document.getElementById("candidates-container");
  const chartContainer = document.getElementById("chart-container");

  /* --- エントリーカード描画 --- */
  CANDIDATES.forEach((c) => {
    const points = calcPoints(c.id);
    const voteCount = calcVoteCount(c.id);

    const card = document.createElement("div");
    card.className = "candidate-card";
    card.innerHTML = `
      <div class="card-badge">${c.catchphrase}</div>
      <div class="card-image-wrap">
        <img src="${c.mainImage}" alt="${c.name}"
             onerror="this.parentElement.classList.add('no-image')" />
        <div class="card-image-placeholder">
          <span>${c.name.charAt(0)}</span>
        </div>
      </div>
      <div class="card-body">
        <h2 class="card-name">
          <a href="candidate.html?id=${c.id}">${c.name}</a>
          <small class="card-age">(${c.age}歳)</small>
        </h2>
        <p class="card-department">${c.department}</p>
        <p class="card-title-role">${c.title}</p>
        <blockquote class="card-comment">"${c.comment}"</blockquote>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-number">${voteCount}</span>
            <span class="stat-label">票</span>
          </div>
          <div class="stat-item primary">
            <span class="stat-number">${points}</span>
            <span class="stat-label">pt</span>
          </div>
        </div>
        <a href="candidate.html?id=${c.id}" class="card-link">
          詳細を見る →
        </a>
      </div>
    `;
    container.appendChild(card);
  });

  /* --- 横棒グラフ描画 --- */
  const maxPoints = Math.max(...CANDIDATES.map((c) => calcPoints(c.id)), 1);
  const colors = ["#c41e3a", "#2c7be5", "#00b894"];

  CANDIDATES.forEach((c, i) => {
    const points = calcPoints(c.id);
    const pct = (points / maxPoints) * 100;

    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-label">
        <span class="chart-name">${c.name}</span>
        <span class="chart-catch">${c.catchphrase}</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}">
        </div>
      </div>
      <span class="chart-value">${points} pt</span>
    `;
    chartContainer.appendChild(row);
  });
});
