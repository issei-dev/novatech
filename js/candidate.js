// File: js/candidate.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const candidate = CANDIDATES.find((c) => c.id === id);
  const detail = document.getElementById("candidate-detail");

  if (!candidate) {
    detail.innerHTML = `
      <div class="error-message">
        <p>候補者が見つかりません。</p>
        <a href="index.html">← 一覧に戻る</a>
      </div>`;
    return;
  }

  /* ページタイトル更新 */
  document.title = `${candidate.name} | FY2025 最優秀社員アワード`;
  document.getElementById("header-candidate-name").textContent = candidate.name;

  /* --- プロフィール & 投票フォーム描画 --- */
  detail.innerHTML = `
    <!-- ヒーロー -->
    <section class="profile-hero">
      <div class="profile-image-area">
        <img src="${candidate.mainImage}" alt="${candidate.name}" class="profile-main-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
        <div class="profile-img-placeholder" style="display:none;">
          <span>${candidate.name.charAt(0)}</span>
        </div>
        <span class="profile-badge">${candidate.catchphrase}</span>
      </div>
      <div class="profile-info">
        <h1>${candidate.name} <small>(${candidate.age}歳)</small></h1>
        <p class="profile-dept">${candidate.department}</p>
        <p class="profile-role">${candidate.title}</p>
        <table class="profile-table">
          <tr><th>入社</th><td>${candidate.profile.joinYear}</td></tr>
          <tr><th>経歴</th><td>${candidate.profile.background}</td></tr>
          <tr><th>スキル</th><td>${candidate.profile.skills.join("<br>")}</td></tr>
          <tr><th>資格</th><td>${candidate.profile.certifications.join(" / ")}</td></tr>
        </table>
      </div>
    </section>

    <!-- 経歴・実績 -->
    <section class="profile-section">
      <h2>経歴・実績</h2>
      <p>${candidate.profile.bio}</p>
    </section>

    <!-- 主な成果 -->
    <section class="profile-section">
      <h2>今年度の主な成果</h2>
      <ul class="achievement-list">
        ${candidate.achievements.map((a) => `<li>${a}</li>`).join("")}
      </ul>
    </section>

    <!-- 自己PR -->
    <section class="profile-section">
      <h2>自己PR</h2>
      <p>${candidate.selfPR}</p>
    </section>

    <!-- 活動写真 -->
    <section class="profile-section">
      <h2>活動写真</h2>
      <div class="sub-images">
        ${candidate.subImages
          .map(
            (src) =>
              `<img src="${src}" alt="活動写真"
                    onerror="this.style.display='none'" />`
          )
          .join("")}
      </div>
    </section>

    <!-- 投票ステータス -->
    <section class="profile-section vote-status-section">
      <h2>現在の投票状況</h2>
      <div class="vote-status-cards">
        <div class="vote-status-card">
          <span class="vs-number">${calcVoteCount(candidate.id)}</span>
          <span class="vs-label">総投票数</span>
        </div>
        <div class="vote-status-card primary">
          <span class="vs-number">${calcPoints(candidate.id)}</span>
          <span class="vs-label">獲得ポイント</span>
        </div>
      </div>
    </section>

    <!-- 投票フォーム -->
    <section class="profile-section vote-section" id="vote-section">
      <h2>この候補者に投票する</h2>
      <p class="vote-notice">
        ※ 役職によりポイントが異なります。詳細は
        <a href="index.html">トップページの投票ルール</a>をご確認ください。
      </p>
      <form id="vote-form">
        <div class="form-group">
          <label for="voter-position">あなたの役職 <span class="required">*</span></label>
          <select id="voter-position" required>
            <option value="">選択してください</option>
            ${Object.entries(POSITION_POINTS)
              .map(
                ([key, val]) =>
                  `<option value="${key}">${val.label}（${val.points}ポイント）</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="form-group">
          <label for="voter-name">氏名 <span class="required">*</span></label>
          <input type="text" id="voter-name" placeholder="例：山田 太郎" required />
        </div>
        <div class="form-group">
          <label for="voter-comment">応援コメント</label>
          <textarea id="voter-comment" rows="4"
                    placeholder="候補者への応援メッセージをお書きください"></textarea>
        </div>
        <button type="submit" class="btn-vote">投票する</button>
      </form>
      <div id="vote-result" class="vote-result" style="display:none;"></div>
    </section>

    <!-- コメント一覧 -->
    <section class="profile-section">
      <h2>投票コメント一覧</h2>
      <div id="vote-comments"></div>
    </section>
  `;

  /* --- 既存コメント表示 --- */
  renderComments(candidate.id);

  /* --- 投票送信 --- */
  document.getElementById("vote-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const position = document.getElementById("voter-position").value;
    const name = document.getElementById("voter-name").value.trim();
    const comment = document.getElementById("voter-comment").value.trim();

    if (!position || !name) return;

    const vote = {
      position,
      name,
      comment,
      timestamp: new Date().toISOString()
    };

    addVote(candidate.id, vote);

    const pts = POSITION_POINTS[position].points;
    const result = document.getElementById("vote-result");
    result.style.display = "block";
    result.innerHTML = `
      <div class="vote-success">
        <p class="vote-success-icon">🎉</p>
        <p>投票が完了しました！</p>
        <p>
          <strong>${POSITION_POINTS[position].label}</strong>として
          <strong>${candidate.name}</strong>さんに
          <strong>${pts}ポイント</strong>を投票しました。
        </p>
      </div>
    `;

    document.getElementById("vote-form").reset();
    renderComments(candidate.id);

    /* 投票ステータス更新 */
    const statusCards = document.querySelectorAll(".vs-number");
    if (statusCards.length >= 2) {
      statusCards[0].textContent = calcVoteCount(candidate.id);
      statusCards[1].textContent = calcPoints(candidate.id);
    }
  });
});

function renderComments(candidateId) {
  const commentsEl = document.getElementById("vote-comments");
  const votes = getVotesForCandidate(candidateId);

  if (votes.length === 0) {
    commentsEl.innerHTML =
      '<p class="no-comments">まだ投票がありません。最初の一票をお待ちしています！</p>';
    return;
  }

  commentsEl.innerHTML = votes
    .slice()
    .reverse()
    .map((v) => {
      const pos = POSITION_POINTS[v.position];
      const date = new Date(v.timestamp).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      return `
        <div class="comment-card">
          <div class="comment-meta">
            <span class="comment-name">${v.name}</span>
            <span class="comment-position badge-${v.position}">${pos.label}</span>
            <span class="comment-date">${date}</span>
          </div>
          ${v.comment ? `<p class="comment-text">${v.comment}</p>` : ""}
        </div>
      `;
    })
    .join("");
}
