import {
  MAJOR_ARCANA,
  arcanaById,
  arcanaName,
  arcanaRoleHint,
  drawThreeSpread,
  formatDeckWhen,
  isEnLocale,
  pickDailyCard,
  tr,
} from './arcana.js';
import {
  renderArcanaGlyphSvg,
  renderCardBackSvg,
  renderCardFrameSvg,
  renderCompassSvg,
  renderCornerFlourishSvg,
  renderFleuronSvg,
  renderIconSvg,
  renderMoonPhaseRingSvg,
  renderMysticEyeSvg,
  renderSlotPlaceholderSvg,
  renderStarChartSvg,
} from './art.js';

const viewBridge = typeof window !== 'undefined' ? window.blockView : null;

const appState = {
  locale: 'zh',
  room: 'table',
  skinEnabled: true,
  noteCount: 0,
  table: {
    spread: null,
    dealt: [true, true, true],
    flipped: [true, true, true],
    altIndex: 0,
    aiReading: '',
    aiLoading: false,
    shuffling: false,
    dealing: false,
  },
  daily: {
    card: null,
    flipped: false,
    doubtOpen: false,
    aiLoading: false,
  },
  deck: {
    filter: 'all',
    selectedId: 9,
    collected: {},
  },
};

let renderSeq = 0;

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function t(zh, en) {
  return tr(appState.locale, zh, en);
}

function applyBackendState(next) {
  if (!next || typeof next !== 'object') return;
  if (typeof next.locale === 'string' && next.locale) {
    appState.locale = next.locale;
  }
  if (next.room === 'table' || next.room === 'daily' || next.room === 'deck') {
    appState.room = next.room;
  }
  if (typeof next.skinEnabled === 'boolean') {
    appState.skinEnabled = next.skinEnabled;
  }
  if (typeof next.noteCount === 'number') {
    appState.noteCount = next.noteCount;
  }
  if (next.table && typeof next.table === 'object') {
    appState.table.spread = next.table.spread || appState.table.spread;
    if (Array.isArray(next.table.dealt)) appState.table.dealt = next.table.dealt.slice(0, 3);
    if (Array.isArray(next.table.flipped)) appState.table.flipped = next.table.flipped.slice(0, 3);
    if (typeof next.table.altIndex === 'number') appState.table.altIndex = next.table.altIndex;
    if (typeof next.table.aiReading === 'string') appState.table.aiReading = next.table.aiReading;
    if (typeof next.table.aiLoading === 'boolean') appState.table.aiLoading = next.table.aiLoading;
  }
  if (next.daily && typeof next.daily === 'object') {
    appState.daily.card = next.daily.card || appState.daily.card;
    if (typeof next.daily.flipped === 'boolean') appState.daily.flipped = next.daily.flipped;
    if (typeof next.daily.doubtOpen === 'boolean') appState.daily.doubtOpen = next.daily.doubtOpen;
    if (typeof next.daily.aiLoading === 'boolean') appState.daily.aiLoading = next.daily.aiLoading;
  }
  if (next.deck && typeof next.deck === 'object') {
    if (next.deck.filter === 'all' || next.deck.filter === 'got' || next.deck.filter === 'missing') {
      appState.deck.filter = next.deck.filter;
    }
    if (typeof next.deck.selectedId === 'number') {
      appState.deck.selectedId = next.deck.selectedId;
    }
    if (next.deck.collected && typeof next.deck.collected === 'object') {
      appState.deck.collected = next.deck.collected;
    }
  }
  document.documentElement.lang = isEnLocale(appState.locale) ? 'en' : 'zh-CN';
}

function buildOfflineFallbackState() {
  const sampleNotes = [
    { path: 'notes/plan.md', title: t('年度写作计划', 'Annual Writing Plan'), arcanaId: 1, modUnix: Math.floor(Date.now() / 1000) - 3600, size: 420, isEmpty: false, isDirty: false, isActive: true, when: t('今天', 'Today') },
    { path: 'notes/travel.md', title: t('秋夜散步札记', 'Autumn Walk Notes'), arcanaId: 18, modUnix: Math.floor(Date.now() / 1000) - 86400 * 14, size: 680, isEmpty: false, isDirty: false, isActive: false, when: t('2 周前', '2 weeks ago') },
    { path: 'notes/future.md', title: t('给未来的草稿', 'Draft for Later'), arcanaId: 17, modUnix: Math.floor(Date.now() / 1000) - 86400 * 3, size: 12, isEmpty: true, isDirty: false, isActive: false, when: t('尚未动笔', 'Unwritten') },
  ];
  return {
    locale: appState.locale,
    room: appState.room,
    skinEnabled: appState.skinEnabled,
    noteCount: sampleNotes.length,
    table: {
      spread: drawThreeSpread(sampleNotes, sampleNotes[0].path, ['', '', ''], appState.locale),
      dealt: [true, true, true],
      flipped: [true, true, true],
      altIndex: 0,
      aiReading: '',
      aiLoading: false,
    },
    daily: {
      card: pickDailyCard(sampleNotes, undefined, null, null, Date.now(), appState.locale),
      flipped: false,
      doubtOpen: false,
      aiLoading: false,
    },
    deck: {
      filter: 'all',
      selectedId: 1,
      collected: {
        1: { arcana_id: 1, note_path: sampleNotes[0].path, note_title: sampleNotes[0].title, drawn_unix: Math.floor(Date.now() / 1000), reversed: false, count: 1 },
      },
    },
  };
}

async function invokeAction(action, payload = {}) {
  if (viewBridge && typeof viewBridge.invoke === 'function') {
    const res = await viewBridge.invoke(action, payload);
    if (res && typeof res === 'object') {
      applyBackendState(res);
    }
    return res;
  }
  // Offline preview fallback when opened outside Block desktop WebView
  if (action === 'set_room' && payload.room) appState.room = payload.room;
  if (action === 'set_locale' && payload.locale) {
    appState.locale = payload.locale;
    applyBackendState(buildOfflineFallbackState());
  }
  if (action === 'toggle_skin') appState.skinEnabled = !appState.skinEnabled;
  if (action === 'flip_table_card') {
    const idx = Number(payload.index);
    if (idx >= 0 && idx < 3) appState.table.flipped[idx] = !appState.table.flipped[idx];
  }
  if (action === 'draw_table') {
    if (payload.shuffleOnly) {
      appState.table.dealt = [false, false, false];
      appState.table.flipped = [false, false, false];
    } else {
      applyBackendState(buildOfflineFallbackState());
      appState.table.dealt = [true, true, true];
      appState.table.flipped = [true, true, true];
    }
  }
  if (action === 'ai_read_spread') appState.table.altIndex += 1;
  if (action === 'flip_daily') {
    appState.daily.flipped = !appState.daily.flipped;
    if (!appState.daily.flipped) appState.daily.doubtOpen = false;
  }
  if (action === 'ai_daily_doubt') {
    appState.daily.doubtOpen = payload.open === undefined ? !appState.daily.doubtOpen : Boolean(payload.open);
  }
  if (action === 'select_deck_card' && typeof payload.id === 'number') {
    appState.deck.selectedId = payload.id;
  }
  if (action === 'set_deck_filter' && payload.filter) {
    appState.deck.filter = payload.filter;
  }
  return appState;
}

function closeStage() {
  if (viewBridge && typeof viewBridge.close === 'function') {
    viewBridge.close();
  }
}

function renderFleuronDividerHtml(leftBright = false) {
  return `<div class="fleuron-divider ${leftBright ? 'is-left-bright' : ''}">
    <div class="line-left"></div>
    ${renderFleuronSvg({ className: 'fleuron-svg' })}
    <div class="line-right"></div>
  </div>`;
}

function renderCornerFrameHtml() {
  return `<div class="frame-overlay" aria-hidden="true">
    <div class="frame-border-outer"></div>
    <div class="frame-border-inner"></div>
    ${renderCornerFlourishSvg({ className: 'corner-ornament tl' })}
    ${renderCornerFlourishSvg({ className: 'corner-ornament tr' })}
    ${renderCornerFlourishSvg({ className: 'corner-ornament br' })}
    ${renderCornerFlourishSvg({ className: 'corner-ornament bl' })}
  </div>`;
}

function renderTopbarHtml() {
  const rooms = [
    { id: 'table', label: t('牌桌', 'Table') },
    { id: 'daily', label: t('每日一牌', 'Daily') },
    { id: 'deck', label: t('牌册', 'Deck') },
  ];
  const en = isEnLocale(appState.locale);
  const skinLabel = appState.skinEnabled ? t('午夜铜版 · 已换装', 'Copperplate · On') : t('开启午夜铜版', 'Enable Skin');

  return `<header class="tarot-topbar">
    <div class="topbar-left">
      <button type="button" class="chrome-btn" data-action="close-stage" aria-label="${esc(t('回到写作', 'Back to Writing'))}">
        ${renderIconSvg('chevron_left')}
        <span>${esc(t('回到写作', 'Back to Writing'))}</span>
        <span class="keycap">Esc</span>
      </button>
    </div>
    <nav class="topbar-nav" aria-label="${esc(t('塔罗房间', 'Tarot Rooms'))}">
      ${rooms
        .map(
          (r) => `<button type="button" class="topbar-tab ${appState.room === r.id ? 'is-active' : ''}" data-action="set-room" data-room="${r.id}">${esc(r.label)}</button>`
        )
        .join('')}
    </nav>
    <div class="topbar-right">
      <div class="locale-pill" role="group" aria-label="${esc(t('语言切换', 'Language'))}">
        <button type="button" class="locale-opt ${!en ? 'is-active' : ''}" data-action="set-locale" data-locale="zh">中</button>
        <button type="button" class="locale-opt ${en ? 'is-active' : ''}" data-action="set-locale" data-locale="en">EN</button>
      </div>
      <button type="button" class="chrome-btn ${appState.skinEnabled ? 'is-active' : ''}" data-action="toggle-skin">
        ${renderIconSvg('moon')}
        <span>${esc(skinLabel)}</span>
      </button>
    </div>
  </header>`;
}

function renderTableDeckActionsHtml(busy) {
  const anyDealt = appState.table.dealt.some(Boolean);
  let drawLabel = t('抽三张牌', 'Draw Three Cards');
  if (appState.table.shuffling) drawLabel = t('洗牌中…', 'Shuffling…');
  else if (appState.table.dealing) drawLabel = t('牌在路上…', 'Dealing…');
  else if (anyDealt) drawLabel = t('重新抽三张', 'Draw Three Again');

  return `<button type="button" class="gold-btn-primary" data-action="draw-table" ${busy ? 'disabled' : ''}>${esc(drawLabel)}</button>
    <button type="button" class="gold-btn-secondary" data-action="shuffle-table" ${busy ? 'disabled' : ''}>${esc(t('洗牌', 'Shuffle'))}</button>`;
}

function renderTableCardSlotHtml(idx, busy) {
  const spread = appState.table.spread;
  const hasCard = Boolean(spread && spread.hasCards && spread.hasCards[idx] && spread.cards && spread.cards[idx] && spread.cards[idx].note);
  const card = hasCard ? spread.cards[idx] : null;
  const dealt = Boolean(appState.table.dealt[idx] && hasCard);
  const flipped = Boolean(appState.table.flipped[idx]);
  const posFallback = [t('过去', 'Past'), t('现在', 'Present'), t('未来', 'Future')][idx];
  const posLabel = (card && card.position) || posFallback;
  const arc = card ? arcanaById(card.note.arcanaId) : arcanaById(1);
  const uid = `tbl-${renderSeq}-${idx}`;

  let cardHtml = '';
  if (dealt && card) {
    cardHtml = `<div class="card-cast-shadow" aria-hidden="true"></div>
      <button type="button" class="card-flip-btn ${flipped ? 'is-flipped' : ''} ${appState.table.dealing ? 'is-dealing' : ''}"
        style="${appState.table.dealing ? `animation-delay:${idx * 110}ms` : ''}"
        data-action="flip-table-card" data-index="${idx}"
        aria-label="${esc(`${posLabel} · ${card.note.title}`)}">
        <div class="card-3d-inner">
          <div class="card-face card-face-back">
            ${renderCardBackSvg({ strokeScale: 1.1, idPrefix: `${uid}-back` })}
          </div>
          <div class="card-face card-face-front">
            ${renderCardFrameSvg({ className: 'card-frame-bg', idPrefix: `${uid}-frame` })}
            <div class="card-front-content ${card.reversed ? 'is-reversed' : ''}">
              <div class="card-roman">${esc(arc.num)}</div>
              <div class="card-glyph-wrap">${renderArcanaGlyphSvg(arc.key, { strokeWidth: 1.25, idPrefix: `${uid}-glyph` })}</div>
              <div class="card-arcana-name">${esc(arcanaName(arc, appState.locale))}</div>
              ${renderFleuronSvg({ className: 'card-fleuron' })}
              <div class="card-note-title">${esc(card.note.title)}</div>
            </div>
            <div class="card-glint" aria-hidden="true"></div>
          </div>
        </div>
      </button>`;
  }

  const writingBadge =
    idx === 1 && dealt
      ? `<div class="present-writing-badge">${renderIconSvg('quill')}<span>${esc(t('正在写', 'Writing'))}</span></div>`
      : '';

  const capsule =
    dealt && flipped && !busy && card
      ? `<button type="button" class="card-action-capsule ${idx === 1 ? 'is-primary' : 'is-secondary'}"
          data-action="open-note" data-path="${esc(card.note.path)}">${esc(card.actionText)}</button>`
      : '';

  const metaHtml =
    dealt && flipped && card && card.metaText
      ? `<div class="spread-when-label ${card.reversed ? 'is-reversed' : ''}">${esc(card.metaText)}</div>`
      : '';

  return `<div class="spread-col">
    <div class="spread-slot">
      ${renderSlotPlaceholderSvg({ className: 'slot-placeholder-svg' })}
      ${cardHtml}
      ${writingBadge}
      ${capsule}
    </div>
    <div class="spread-meta">
      <div class="spread-pos-label">${esc(posLabel)}</div>
      ${metaHtml}
    </div>
  </div>`;
}

function renderTableAsideHtml(busy) {
  const spread = appState.table.spread;
  const hasCards = Boolean(spread && spread.hasCards && spread.hasCards[0] && spread.hasCards[1] && spread.hasCards[2]);
  const allOpen = hasCards && appState.table.dealt.every(Boolean) && appState.table.flipped.every(Boolean);

  if (allOpen && !busy) {
    const lines = Array.isArray(spread.lines) ? spread.lines : [];
    let lineText = String(appState.table.aiReading || '').trim();
    if (!lineText) {
      if (appState.table.aiLoading) {
        lineText = t('正在结合你的笔记推演牌意…', 'Weaving an editorial reading from your notes…');
      } else if (lines.length > 0) {
        lineText = lines[appState.table.altIndex % lines.length];
      }
    }
    const ctaTitle = spread.ctaTitle || '';
    const ctaPath = spread.ctaPath || '';
    const ctaLabel = t(`续写《${ctaTitle}》`, `Continue "${ctaTitle}"`);
    const altLabel = appState.table.aiLoading ? t('推演中…', 'Reading…') : t('换一种读法', 'Another Angle');

    return `<div style="display:flex;flex-direction:column;gap:10px;">
        <div class="aside-heading">${esc(t('解读', 'Reading'))}</div>
        ${renderFleuronDividerHtml(true)}
      </div>
      <p class="reading-text">${esc(lineText)}</p>
      <div class="reading-actions">
        <button type="button" class="gold-btn-primary" data-action="open-note" data-path="${esc(ctaPath)}" ${ctaPath ? '' : 'disabled'}>${esc(ctaLabel)}</button>
        <button type="button" class="gold-btn-secondary" data-action="ai-read-spread" ${appState.table.aiLoading ? 'disabled' : ''}>${esc(altLabel)}</button>
      </div>`;
  }

  let waitLabel = t('牌桌已清空', 'Table cleared');
  if (appState.table.shuffling || busy) {
    waitLabel = t('牌正在显影', 'Cards emerging');
  } else if (appState.table.dealt.some(Boolean)) {
    waitLabel = t('翻开全部三张牌', 'Reveal all three cards');
  } else if (appState.noteCount === 0) {
    waitLabel = t('先写一篇笔记即可抽牌', 'Create a note to draw');
  }

  return `<div class="waiting-eye-box">
    ${renderMysticEyeSvg({ className: 'mystic-eye-svg' })}
    <div class="waiting-label">${esc(waitLabel)}</div>
  </div>`;
}

function renderTableRoomHtml() {
  const busy = appState.table.shuffling || appState.table.dealing;
  const noteCountText = isEnLocale(appState.locale)
    ? `${appState.noteCount} notes`
    : `${appState.noteCount} 篇笔记`;

  const layers = [0, 1, 2, 3, 4, 5]
    .map((k) => {
      const style = `left:${k * 1.2}px;top:${-k * 2}px;`;
      const svg = k === 5 || (appState.table.shuffling && k >= 3)
        ? renderCardBackSvg({ strokeScale: 1.0, idPrefix: `stack-${renderSeq}-${k}` })
        : '';
      return `<div class="deck-layer layer-${k}" style="${style}">${svg}</div>`;
    })
    .join('');

  return `<section class="room-table">
    <aside class="table-sidebar">
      <div class="table-sidebar-head">
        <div class="table-sidebar-title-row">
          <div class="table-sidebar-title">${esc(t('牌堆', 'Deck'))}</div>
          <div class="table-sidebar-count">${esc(noteCountText)}</div>
        </div>
        ${renderFleuronDividerHtml(true)}
      </div>
      <div class="deck-stack-wrap ${appState.table.shuffling ? 'is-shuffling' : ''}">
        <div class="deck-stack-shadow" aria-hidden="true"></div>
        ${renderSlotPlaceholderSvg({ className: 'deck-stack-outline' })}
        ${layers}
      </div>
      <div class="table-deck-actions">
        ${renderTableDeckActionsHtml(busy)}
      </div>
    </aside>
    <main class="table-center">
      ${renderStarChartSvg({ className: 'star-chart-bg' })}
      ${renderCornerFrameHtml()}
      ${renderCompassSvg({ className: 'compass-ornament' })}
      <div class="spread-row">
        ${[0, 1, 2].map((i) => renderTableCardSlotHtml(i, busy)).join('')}
      </div>
    </main>
    <aside class="table-aside">
      <div class="table-aside-scroll">
        ${renderTableAsideHtml(busy)}
      </div>
      <div class="compact-deck-bar">
        ${renderTableDeckActionsHtml(busy)}
      </div>
    </aside>
  </section>`;
}

function renderDailyRoomHtml() {
  const dc = appState.daily.card || pickDailyCard([], undefined, null, null, Date.now(), appState.locale);
  const note = dc.note || { path: '', title: t('未命名笔记本', 'Empty Notebook'), arcanaId: 0 };
  const arc = arcanaById(note.arcanaId);
  const flipped = appState.daily.flipped;
  const uid = `daily-${renderSeq}`;

  const orientLabel = dc.reversed ? t('逆位', 'Reversed') : t('正位', 'Upright');
  const readLabel = t('读它', 'Read It');
  const doubtLabel = t('质疑它', 'Challenge It');

  const ctaHtml = flipped
    ? `<div class="daily-bottom-meta">
        <div class="daily-last-opened">${esc(dc.lastOpened || '')}</div>
        <div class="daily-cta-row">
          <button type="button" class="${dc.reversed ? 'gold-btn-secondary' : 'gold-btn-primary'}"
            data-action="open-note" data-path="${esc(note.path)}" ${note.path ? '' : 'disabled'}>${esc(readLabel)}</button>
          <button type="button" class="${dc.reversed ? 'gold-btn-primary' : 'gold-btn-secondary'}"
            data-action="toggle-daily-doubt">${esc(doubtLabel)}</button>
        </div>
      </div>`
    : '<div class="daily-bottom-meta" style="visibility:hidden;"></div>';

  const numerals = ['I', 'II', 'III'];
  const qs = Array.isArray(dc.doubtQuestions) ? dc.doubtQuestions.slice(0, 3) : [];
  const doubtHtml =
    flipped && appState.daily.doubtOpen
      ? `<div class="doubt-card">
          ${renderCornerFlourishSvg({ className: 'corner-ornament tl', strokeWidth: 1.2 })}
          ${renderCornerFlourishSvg({ className: 'corner-ornament tr', strokeWidth: 1.2 })}
          ${renderCornerFlourishSvg({ className: 'corner-ornament br', strokeWidth: 1.2 })}
          ${renderCornerFlourishSvg({ className: 'corner-ornament bl', strokeWidth: 1.2 })}
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="aside-heading">${esc(t('站在反面', "Devil's Advocate"))}</div>
            ${renderFleuronDividerHtml(true)}
          </div>
          <div class="doubt-list">
            ${
              appState.daily.aiLoading
                ? `<div class="doubt-text">${esc(t('正在围绕这篇笔记生成反方追问…', 'Sharpening counter-questions from your note…'))}</div>`
                : qs
                    .map(
                      (q, i) => `<div class="doubt-item">
                        <span class="doubt-num">${numerals[i]}</span>
                        <div class="doubt-text">${esc(q)}</div>
                      </div>`
                    )
                    .join('')
            }
          </div>
          <div class="doubt-actions">
            <button type="button" class="gold-btn-primary" data-action="open-ai-followup" ${note.path ? '' : 'disabled'}>${esc(t('写进这篇笔记', 'Write into Note'))}</button>
            <button type="button" class="gold-btn-secondary" data-action="close-daily-doubt">${esc(t('收起', 'Close'))}</button>
          </div>
        </div>`
      : '';

  return `<section class="room-daily">
    <div class="moon-ring-wrap" aria-hidden="true">
      ${renderMoonPhaseRingSvg({ className: 'moon-ring-svg' })}
    </div>
    ${renderCornerFrameHtml()}
    <div class="daily-grid">
      <div class="daily-spacer"></div>
      <div class="daily-center-col">
        <div class="daily-date-header">
          <div class="daily-date-ornament" aria-hidden="true"><span class="bar"></span><span class="diamond"></span></div>
          <div class="daily-date-text">${esc(dc.dateDisplay || '')}</div>
          <div class="daily-date-ornament" aria-hidden="true"><span class="diamond"></span><span class="bar"></span></div>
        </div>
        <div class="daily-card-stage">
          ${flipped ? '' : '<div class="daily-halo" aria-hidden="true"></div>'}
          <button type="button" class="daily-card-btn ${flipped ? 'is-flipped' : ''}"
            data-action="flip-daily"
            aria-label="${esc(flipped ? t('翻回牌背', 'Turn card face down') : t('翻开今日之牌', "Reveal today's card"))}">
            <div class="card-3d-inner">
              <div class="card-face card-face-back">
                ${renderCardBackSvg({ strokeScale: 1.3, idPrefix: `${uid}-back` })}
              </div>
              <div class="card-face card-face-front">
                ${renderCardFrameSvg({ className: 'card-frame-bg', idPrefix: `${uid}-frame` })}
                <div class="daily-front-inner">
                  <div class="daily-art-group ${dc.reversed ? 'is-reversed' : ''}">
                    <div class="daily-roman">${esc(arc.num)}</div>
                    <div class="card-glyph-wrap">${renderArcanaGlyphSvg(arc.key, { strokeWidth: 1.5, idPrefix: `${uid}-glyph` })}</div>
                  </div>
                  <div class="daily-arcana-name">${esc(arcanaName(arc, appState.locale))}</div>
                  ${renderFleuronSvg({ className: 'daily-fleuron' })}
                  <div class="daily-note-title">${esc(note.title)}</div>
                  <p class="daily-excerpt">${esc(dc.excerpt || '')}</p>
                  <div class="daily-orient-pill ${dc.reversed ? 'is-reversed' : ''}">${esc(orientLabel)}</div>
                </div>
                <div class="card-glint" aria-hidden="true"></div>
              </div>
            </div>
          </button>
        </div>
        ${ctaHtml}
      </div>
      <div class="daily-doubt-slot">${doubtHtml}</div>
    </div>
  </section>`;
}

function renderDeckRoomHtml() {
  const collected = appState.deck.collected || {};
  const collectedCount = MAJOR_ARCANA.reduce((acc, a) => (collected[a.id] ? acc + 1 : acc), 0);
  const filter = appState.deck.filter || 'all';

  const visible = MAJOR_ARCANA.filter((a) => {
    const got = Boolean(collected[a.id]);
    if (filter === 'got') return got;
    if (filter === 'missing') return !got;
    return true;
  });

  const filterOpts = [
    { id: 'all', label: t('全部', 'All') },
    { id: 'got', label: t('已收集', 'Collected') },
    { id: 'missing', label: t('未收集', 'Missing') },
  ];

  const gridContent =
    visible.length === 0
      ? `<div class="deck-empty">${esc(
          filter === 'missing'
            ? t('已集齐全部 22 张大阿卡纳。', 'All 22 Major Arcana collected.')
            : t('还没有收集到牌，去牌桌抽牌或保存一篇笔记吧。', 'No cards collected yet. Draw at the Table or save a note.')
        )}</div>`
      : `<div class="deck-grid">
          ${visible
            .map((arc) => {
              const entry = collected[arc.id];
              const got = Boolean(entry);
              const selected = appState.deck.selectedId === arc.id;
              const name = arcanaName(arc, appState.locale);
              const caption = got && entry.note_title ? entry.note_title : `${arc.num} · ${name}`;
              const uid = `deck-grid-${renderSeq}-${arc.id}`;
              return `<button type="button" class="deck-card-btn ${selected ? 'is-selected' : ''}" data-action="select-deck-card" data-id="${arc.id}" aria-label="${esc(`${arc.num} ${name}`)}">
                <div class="deck-thumb ${got ? 'is-got' : ''}">
                  ${
                    got
                      ? `${renderCardFrameSvg({ className: 'card-frame-bg', idPrefix: `${uid}-f` })}
                        <div class="deck-thumb-face">
                          <div class="deck-thumb-num">${esc(arc.num)}</div>
                          <div class="card-glyph-wrap">${renderArcanaGlyphSvg(arc.key, { strokeWidth: 1.0, idPrefix: `${uid}-g` })}</div>
                          <div class="deck-thumb-name">${esc(name)}</div>
                        </div>`
                      : `<div class="deck-thumb-back-dim">${renderCardBackSvg({ strokeScale: 0.85, idPrefix: `${uid}-b` })}</div>`
                  }
                </div>
                <div class="deck-caption ${got ? 'is-got' : ''}">${esc(caption)}</div>
              </button>`;
            })
            .join('')}
        </div>`;

  const selArc = arcanaById(appState.deck.selectedId);
  const selEntry = collected[selArc.id];
  const selGot = Boolean(selEntry);
  const selName = arcanaName(selArc, appState.locale);
  const selUid = `deck-detail-${renderSeq}-${selArc.id}`;
  const selRole = arcanaRoleHint(selArc, Boolean(selEntry && selEntry.reversed), appState.locale);

  return `<section class="room-deck">
    <div class="deck-gallery" id="deck-gallery-scroll">
      <div class="deck-header-row">
        <div class="deck-progress-block">
          <div class="deck-title-line">
            <div class="deck-title">${esc(t('牌册', 'The Deck'))}</div>
            <div class="deck-count-wrap">
              <span>${esc(t('已收集 ', 'Collected '))}</span>
              <span class="deck-count-num">${collectedCount}</span>
              <span>/ 22</span>
            </div>
          </div>
          <div class="deck-ticks" aria-hidden="true">
            ${MAJOR_ARCANA.map((a) => `<div class="deck-tick ${collected[a.id] ? 'is-got' : ''}"></div>`).join('')}
          </div>
        </div>
        <div class="deck-filter-group" role="group" aria-label="${esc(t('筛选', 'Filter'))}">
          ${filterOpts
            .map(
              (o) => `<button type="button" class="deck-filter-btn ${filter === o.id ? 'is-active' : ''}" data-action="set-deck-filter" data-filter="${o.id}">${esc(o.label)}</button>`
            )
            .join('')}
        </div>
      </div>
      ${gridContent}
    </div>
    <aside class="deck-detail-aside">
      <div class="deck-detail-card ${selGot ? 'is-got' : 'is-missing'}">
        ${
          selGot
            ? `${renderCardFrameSvg({ className: 'card-frame-bg', idPrefix: `${selUid}-f` })}
              <div class="deck-detail-face">
                <div class="deck-detail-roman">${esc(selArc.num)}</div>
                <div class="card-glyph-wrap">${renderArcanaGlyphSvg(selArc.key, { strokeWidth: 1.35, idPrefix: `${selUid}-g` })}</div>
                <div class="deck-detail-arcana">${esc(selName)}</div>
                ${renderFleuronSvg({ className: 'card-fleuron' })}
                <div class="deck-detail-title">${esc(selEntry.note_title || selName)}</div>
              </div>`
            : renderCardBackSvg({ strokeScale: 1.2, idPrefix: `${selUid}-b` })
        }
      </div>
      <div class="deck-detail-meta">
        <div class="deck-detail-header">
          <div class="deck-detail-name-row">
            <span class="deck-detail-num-gold">${esc(selArc.num)}</span>
            <span class="deck-detail-name-gold">${esc(selName)}</span>
          </div>
          ${renderFleuronDividerHtml(false)}
        </div>
        <p class="deck-detail-role">${esc(selRole)}</p>
        ${
          selGot
            ? `<div class="deck-detail-note-name">${esc(selEntry.note_title || '')}</div>
              <div class="deck-detail-when ${selEntry.reversed ? 'is-reversed' : ''}">${esc(formatDeckWhen(selEntry.drawn_unix, selEntry.reversed, Date.now(), appState.locale))}</div>
              <button type="button" class="gold-btn-primary deck-detail-cta" data-action="open-note" data-path="${esc(selEntry.note_path || '')}" ${selEntry.note_path ? '' : 'disabled'}>${esc(t('打开这篇笔记', 'Open This Note'))}</button>`
            : `<p class="deck-detail-role">${esc(t('还没有笔记抽到这张牌', 'No note has drawn this card yet'))}</p>
              <button type="button" class="gold-btn-secondary deck-detail-cta" data-action="set-room" data-room="table">${esc(t('去牌桌抽牌', 'Draw at the Table'))}</button>`
        }
      </div>
    </aside>
  </section>`;
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;
  const deckEl = document.getElementById('deck-gallery-scroll');
  const prevDeckScroll = deckEl ? deckEl.scrollTop : 0;

  renderSeq += 1;
  let roomHtml = '';
  if (appState.room === 'daily') roomHtml = renderDailyRoomHtml();
  else if (appState.room === 'deck') roomHtml = renderDeckRoomHtml();
  else roomHtml = renderTableRoomHtml();

  root.innerHTML = `${renderTopbarHtml()}<div class="stage-body">${roomHtml}</div>`;

  if (appState.room === 'deck' && prevDeckScroll > 0) {
    const nextDeckEl = document.getElementById('deck-gallery-scroll');
    if (nextDeckEl) nextDeckEl.scrollTop = prevDeckScroll;
  }
}

async function handleAction(el) {
  const action = el.dataset.action;
  if (!action) return;

  if (action === 'close-stage') {
    closeStage();
    return;
  }
  if (action === 'set-room') {
    const room = el.dataset.room || 'table';
    await invokeAction('set_room', { room });
    render();
    return;
  }
  if (action === 'set-locale') {
    const locale = el.dataset.locale || 'zh';
    await invokeAction('set_locale', { locale });
    render();
    return;
  }
  if (action === 'toggle-skin') {
    await invokeAction('toggle_skin', { enabled: !appState.skinEnabled });
    render();
    return;
  }
  if (action === 'draw-table') {
    if (appState.table.shuffling || appState.table.dealing) return;
    appState.table.shuffling = true;
    render();
    await new Promise((r) => setTimeout(r, 760));
    appState.table.shuffling = false;
    appState.table.dealing = true;
    await invokeAction('draw_table', {});
    render();
    setTimeout(() => {
      appState.table.dealing = false;
      render();
    }, 900);
    return;
  }
  if (action === 'shuffle-table') {
    if (appState.table.shuffling || appState.table.dealing) return;
    appState.table.shuffling = true;
    render();
    await new Promise((r) => setTimeout(r, 760));
    appState.table.shuffling = false;
    await invokeAction('draw_table', { shuffleOnly: true });
    render();
    return;
  }
  if (action === 'flip-table-card') {
    const idx = Number(el.dataset.index);
    await invokeAction('flip_table_card', { index: idx });
    const cardBtn = document.querySelector(`.card-flip-btn[data-index="${idx}"]`);
    if (cardBtn) {
      cardBtn.classList.toggle('is-flipped', Boolean(appState.table.flipped[idx]));
      setTimeout(() => render(), 460);
    } else {
      render();
    }
    return;
  }
  if (action === 'ai-read-spread') {
    appState.table.aiLoading = true;
    render();
    await invokeAction('ai_read_spread', {});
    appState.table.aiLoading = false;
    render();
    return;
  }
  if (action === 'open-note') {
    const path = el.dataset.path || '';
    if (!path) return;
    await invokeAction('open_note', { path, closeStage: true });
    return;
  }
  if (action === 'flip-daily') {
    await invokeAction('flip_daily', {});
    const cardBtn = document.querySelector('.daily-card-btn');
    if (cardBtn) {
      cardBtn.classList.toggle('is-flipped', Boolean(appState.daily.flipped));
      setTimeout(() => render(), 520);
    } else {
      render();
    }
    return;
  }
  if (action === 'toggle-daily-doubt') {
    const nextOpen = !appState.daily.doubtOpen;
    if (nextOpen) {
      appState.daily.doubtOpen = true;
      appState.daily.aiLoading = true;
      render();
    }
    await invokeAction('ai_daily_doubt', { open: nextOpen });
    appState.daily.aiLoading = false;
    render();
    return;
  }
  if (action === 'close-daily-doubt') {
    await invokeAction('ai_daily_doubt', { open: false });
    render();
    return;
  }
  if (action === 'open-ai-followup') {
    const dc = appState.daily.card;
    await invokeAction('open_ai_followup', {
      path: dc?.note?.path || '',
      title: dc?.note?.title || '',
      questions: dc?.doubtQuestions || [],
    });
    return;
  }
  if (action === 'select-deck-card') {
    const id = Number(el.dataset.id);
    await invokeAction('select_deck_card', { id });
    render();
    return;
  }
  if (action === 'set-deck-filter') {
    const filter = el.dataset.filter || 'all';
    await invokeAction('set_deck_filter', { filter });
    render();
  }
}

document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target.closest('[data-action]') : null;
  if (target && !target.hasAttribute('disabled')) {
    void handleAction(target);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeStage();
  }
});

async function bootstrap() {
  if (viewBridge && typeof viewBridge.onEvent === 'function') {
    viewBridge.onEvent((evt) => {
      if (!evt || typeof evt !== 'object') return;
      const payload = evt.payload && typeof evt.payload === 'object' ? evt.payload : evt;
      applyBackendState(payload);
      render();
    });
  }

  let init = null;
  if (viewBridge && typeof viewBridge.getInitState === 'function') {
    try {
      init = await Promise.resolve(viewBridge.getInitState());
    } catch (_err) {
      init = null;
    }
  }
  if (init && typeof init === 'object' && (init.table || init.daily || init.deck)) {
    applyBackendState(init);
  } else if (viewBridge && typeof viewBridge.invoke === 'function') {
    try {
      const fresh = await viewBridge.invoke('get_state', {});
      applyBackendState(fresh);
    } catch (_err) {
      applyBackendState(buildOfflineFallbackState());
    }
  } else {
    applyBackendState(buildOfflineFallbackState());
  }
  render();
}

void bootstrap();
