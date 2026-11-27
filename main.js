import { serve, callHost } from '/runtime/block-sdk.js';
import {
  MAJOR_ARCANA,
  arcanaById,
  arcanaName,
  assignArcana,
  buildDeckNotes,
  buildDoubtQuestions,
  buildSpreadReadings,
  cleanNotePath,
  drawThreeSpread,
  localDateKey,
  pathBase,
  pickDailyCard,
  titleFromPath,
  tr,
} from './arcana.js';

const STORAGE_KEY = 'tarot_store';
const LEGACY_PREF_KEY = 'tarot_pref';
const SKIN_ID = 'midnight-copperplate';
const STAGE_ID = 'tarot-stage';
const TITLEBAR_BUTTON_ID = 'tarot-toggle';
const SETTINGS_PAGE_SURFACE = 'settings_page';
const FALLBACK_RPC_CODES = new Set([-32601, -32005, -32004, -32003, -32001]);

const ROOM_LABELS = {
  table: ['牌桌', 'Table'],
  daily: ['每日一牌', 'Daily Card'],
  deck: ['牌册', 'Arcana Deck'],
};

const state = {
  pluginId: 'block-tarot',
  locale: 'zh',
  notebookRoot: '',
  metricTone: false,
  activePath: '',
  notes: [],
  notesSynced: false,
  noteTextCache: {},
  room: 'table',
  store: {
    skin_enabled: false,
    collected: {},
    daily: {},
    note_arcana: {},
  },
  table: {
    initialized: false,
    spread: null,
    dealt: [true, true, true],
    flipped: [true, true, true],
    altIndex: 0,
    aiReading: '',
    prevPaths: ['', '', ''],
  },
  daily: {
    initialized: false,
    date: '',
    card: null,
    flipped: false,
    doubtOpen: false,
  },
  deck: {
    filter: 'all',
    selectedId: 9,
  },
};

function isEn() {
  return String(state.locale || '').toLowerCase().startsWith('en');
}

function t(zh, en) {
  return tr(state.locale, zh, en);
}

function roomLabel(room) {
  const pair = ROOM_LABELS[room] || ROOM_LABELS.table;
  return isEn() ? pair[1] : pair[0];
}

function localizeError(msg) {
  const text = String(msg || '').trim();
  if (isEn() && /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\ufe10-\ufe1f\ufe30-\ufe4f\uff00-\uffef]/.test(text)) {
    return 'Operation failed';
  }
  return text || t('操作失败', 'Operation failed');
}

function safeCallHost(method, params = {}) {
  try {
    const result = callHost(method, params);
    return { ok: true, supported: true, result };
  } catch (err) {
    const code = typeof err?.code === 'number' ? err.code : -32000;
    if (FALLBACK_RPC_CODES.has(code)) {
      return { ok: false, supported: false, code, message: String(err?.message || '') };
    }
    throw err;
  }
}

function normalizeNotePath(p) {
  if (!p) return '';
  let norm = cleanNotePath(p);
  if (state.notebookRoot) {
    const rootClean = cleanNotePath(state.notebookRoot).replace(/\/+$/, '');
    if (rootClean && norm.startsWith(`${rootClean}/`)) {
      norm = norm.slice(rootClean.length + 1);
    }
  }
  return norm;
}

function loadStore() {
  const res = safeCallHost('host.storage.get', { key: STORAGE_KEY });
  if (res.ok && res.result?.found && res.result.value && typeof res.result.value === 'object') {
    const v = res.result.value;
    state.store.skin_enabled = Boolean(v.skin_enabled);
    state.store.collected = v.collected && typeof v.collected === 'object' ? { ...v.collected } : {};
    state.store.daily = v.daily && typeof v.daily === 'object' ? { ...v.daily } : {};
    state.store.note_arcana = v.note_arcana && typeof v.note_arcana === 'object' ? { ...v.note_arcana } : {};
    return true;
  }
  const legacy = safeCallHost('host.storage.get', { key: LEGACY_PREF_KEY });
  if (legacy.ok && legacy.result?.found && legacy.result.value && typeof legacy.result.value === 'object') {
    state.store.skin_enabled = Boolean(legacy.result.value.enabled);
    return true;
  }
  return false;
}

function saveStore() {
  safeCallHost('host.storage.set', {
    key: STORAGE_KEY,
    value: state.store,
  });
}

function pickInitialDeckSelection() {
  if (state.store.collected && state.store.collected[9]) {
    state.deck.selectedId = 9;
    return;
  }
  for (let id = 0; id < MAJOR_ARCANA.length; id++) {
    if (state.store.collected && state.store.collected[id]) {
      state.deck.selectedId = id;
      return;
    }
  }
  state.deck.selectedId = 1;
}

function readNoteTextCached(notePath) {
  const clean = normalizeNotePath(notePath);
  if (!clean) return '';
  if (Object.prototype.hasOwnProperty.call(state.noteTextCache, clean)) {
    return state.noteTextCache[clean];
  }
  const res = safeCallHost('host.notes.read', { path: clean });
  const content = res.ok && typeof res.result?.content === 'string' ? res.result.content : '';
  state.noteTextCache[clean] = content;
  return content;
}

function syncNotes(force = false) {
  if (state.notesSynced && !force) return;
  const listRes = safeCallHost('host.notes.list', {});
  const activeRes = safeCallHost('host.notes.active', {});
  if (activeRes.ok && typeof activeRes.result?.path === 'string') {
    state.activePath = normalizeNotePath(activeRes.result.path);
  }
  const rawList = listRes.ok && Array.isArray(listRes.result?.notes) ? listRes.result.notes : [];
  const entries = rawList.map((n) => ({
    ...n,
    path: normalizeNotePath(n.path || ''),
  }));
  state.notes = buildDeckNotes(
    entries,
    state.activePath,
    false,
    state.store.note_arcana,
    (p) => readNoteTextCached(p),
    Date.now(),
    state.locale
  );
  state.notesSynced = true;
}

function recordCollected(arcanaId, notePath, noteTitle, reversed = false) {
  const clean = normalizeNotePath(notePath);
  if (!clean || arcanaId < 0 || arcanaId >= MAJOR_ARCANA.length) return;
  const id = arcanaById(arcanaId).id;
  const prev = state.store.collected[id];
  state.store.collected[id] = {
    arcana_id: id,
    note_path: clean,
    note_title: noteTitle || titleFromPath(clean),
    drawn_unix: Math.floor(Date.now() / 1000),
    reversed: Boolean(reversed),
    count: (prev?.count || 0) + 1,
  };
  state.store.note_arcana[clean] = id;
  saveStore();
}

function syncTitlebarButton() {
  safeCallHost('host.titlebar.set_button', {
    id: TITLEBAR_BUTTON_ID,
    active: Boolean(state.store.skin_enabled),
  });
}

function refreshSettingsSurface() {
  safeCallHost('host.ui.refresh', { surface: SETTINGS_PAGE_SURFACE });
}

function emitStageEvent(event, payload) {
  safeCallHost('host.stage.emit', {
    id: STAGE_ID,
    event,
    payload,
  });
}

function setThemeSkin(enabled) {
  const next = Boolean(enabled);
  state.store.skin_enabled = next;
  saveStore();
  const res = safeCallHost('host.ui.set_theme_skin', {
    id: SKIN_ID,
    enabled: next,
  });
  syncTitlebarButton();
  emitStageEvent('theme.changed', { skinEnabled: next });
  return res.supported;
}

function ensureSpreadInitialized(forceFresh = false) {
  syncNotes();
  if (!state.table.initialized || forceFresh) {
    const sp = drawThreeSpread(state.notes, state.activePath, state.table.prevPaths, state.locale);
    state.table.spread = sp;
    state.table.initialized = true;
    state.table.dealt = sp.hasCards.map((ok) => Boolean(ok));
    state.table.flipped = sp.hasCards.map((ok) => Boolean(ok));
    state.table.altIndex = 0;
    state.table.aiReading = '';
    state.table.prevPaths = sp.cards.map((c) => c?.note?.path || '');
    for (let i = 0; i < 3; i++) {
      if (sp.hasCards[i] && sp.cards[i]?.note?.path) {
        recordCollected(sp.cards[i].note.arcanaId, sp.cards[i].note.path, sp.cards[i].note.title, sp.cards[i].reversed);
      }
    }
    return;
  }
  refreshSpreadLocale();
}

function refreshSpreadLocale() {
  if (!state.table.spread) return;
  const posLabels = [t('过去', 'Past'), t('现在', 'Present'), t('未来', 'Future')];
  const sp = state.table.spread;
  for (let i = 0; i < 3; i++) {
    sp.cards[i].position = posLabels[i];
    if (sp.hasCards[i] && sp.cards[i].note) {
      const updated = state.notes.find((n) => n.path === sp.cards[i].note.path);
      if (updated) sp.cards[i].note = updated;
      const n = sp.cards[i].note;
      let actionText = t('重读', 'Reread');
      if (i === 1) actionText = t('续写', 'Continue');
      else if (n.isEmpty) actionText = t('动笔', 'Begin');
      const orient = sp.cards[i].reversed ? t('逆位', 'Reversed') : t('正位', 'Upright');
      sp.cards[i].actionText = actionText;
      sp.cards[i].metaText = `${n.when} · ${orient}`;
    }
  }
  if (sp.hasCards[1] && sp.cards[1].note) {
    sp.ctaTitle = sp.cards[1].note.title;
    sp.ctaPath = sp.cards[1].note.path;
  }
  sp.lines = buildSpreadReadings(sp, state.locale);
}

function ensureDailyInitialized() {
  syncNotes();
  const today = localDateKey();
  const dc = pickDailyCard(
    state.notes,
    today,
    state.store.daily,
    (p) => readNoteTextCached(p),
    Date.now(),
    state.locale
  );
  const freshDay = !state.daily.initialized || state.daily.date !== today;
  state.daily.date = today;
  state.daily.card = dc;
  state.daily.initialized = true;
  if (freshDay) {
    state.daily.flipped = Boolean(state.store.daily?.date === today && state.store.daily?.flipped);
    state.daily.doubtOpen = false;
  }
}

function collectedCount() {
  let n = 0;
  for (let id = 0; id < MAJOR_ARCANA.length; id++) {
    if (state.store.collected[id]) n += 1;
  }
  return n;
}

function buildStagePayload() {
  ensureSpreadInitialized(false);
  ensureDailyInitialized();
  return {
    locale: state.locale,
    room: state.room,
    skinEnabled: Boolean(state.store.skin_enabled),
    noteCount: state.notes.length,
    table: {
      spread: state.table.spread,
      dealt: [...state.table.dealt],
      flipped: [...state.table.flipped],
      altIndex: state.table.altIndex,
      aiReading: state.table.aiReading,
      aiLoading: false,
    },
    daily: {
      card: state.daily.card,
      flipped: Boolean(state.daily.flipped),
      doubtOpen: Boolean(state.daily.doubtOpen),
      aiLoading: false,
    },
    deck: {
      filter: state.deck.filter,
      selectedId: state.deck.selectedId,
      collected: state.store.collected,
    },
  };
}

function openStage(room) {
  if (room === 'table' || room === 'daily' || room === 'deck') {
    state.room = room;
  }
  const payload = buildStagePayload();
  const res = safeCallHost('host.stage.open', {
    id: STAGE_ID,
    room: state.room,
    state: payload,
  });
  emitStageEvent('state.updated', payload);
  return res.supported;
}

function buildSettingsPage(status = '') {
  const enabled = Boolean(state.store.skin_enabled);
  const count = collectedCount();
  const dailyDrawn = Boolean(state.store.daily?.date === localDateKey() && state.store.daily?.flipped);

  const metrics = [
    { label: t('主题皮肤', 'Theme Skin'), value: enabled ? t('午夜铜版 · 已开启', 'Midnight Copperplate · On') : t('未开启', 'Off') },
    { label: t('大阿卡纳牌册', 'Major Arcana'), value: `${count} / 22` },
    { label: t('今日一牌', 'Daily Card'), value: dailyDrawn ? t('已翻开', 'Revealed') : t('未翻开', 'Unopened') },
  ];
  if (state.metricTone) {
    metrics[0].tone = enabled ? 'accent' : 'neutral';
    metrics[1].tone = count > 0 ? 'accent' : 'neutral';
    metrics[2].tone = dailyDrawn ? 'success' : 'neutral';
  }

  return {
    title: t('塔罗模式', 'Tarot Mode'),
    status,
    cards: [
      {
        id: 'tarot-controls',
        title: t('午夜铜版皮肤与牌桌舞台', 'Midnight Copperplate & Tarot Stage'),
        items: [
          {
            kind: 'switch',
            id: 'tarot_enabled',
            label: t('开启午夜铜版主题皮肤', 'Enable Midnight Copperplate Theme Skin'),
            value: enabled,
          },
          {
            kind: 'actions',
            buttons: [
              { id: 'open_table', label: t('打开牌桌', 'Open Table'), variant: 'primary' },
              { id: 'open_daily', label: t('每日一牌', 'Daily Card'), variant: 'secondary' },
              { id: 'open_deck', label: t('牌册图鉴', 'Arcana Deck'), variant: 'secondary' },
            ],
          },
        ],
      },
      {
        id: 'tarot-overview',
        title: t('牌册与状态', 'Collection & Status'),
        items: [
          { kind: 'metrics', metrics },
          {
            kind: 'kv',
            rows: [
              { label: t('当前舞台房间', 'Active Stage Room'), value: roomLabel(state.room) },
              {
                label: t('视觉覆盖范围', 'Theme Scope'),
                value: t(
                  '羊皮纸编辑区、午夜铜版侧栏、AI 显影卡片与速记小窗',
                  'Parchment paper editor, midnight copperplate chrome, AI card indicator, and Quick Note skin'
                ),
              },
              {
                label: t('快捷返回', 'Quick Return'),
                value: t(
                  '在塔罗舞台按 Esc 即可回到写作光标，不会改动任何笔记',
                  'Press Esc in the Tarot Stage to return to your cursor without modifying notes'
                ),
              },
            ],
          },
        ],
      },
    ],
  };
}

function handleStageAction(action, payload = {}) {
  switch (action) {
    case 'get_state': {
      syncNotes(true);
      return buildStagePayload();
    }
    case 'set_room': {
      if (payload.room === 'table' || payload.room === 'daily' || payload.room === 'deck') {
        state.room = payload.room;
      }
      return buildStagePayload();
    }
    case 'set_locale': {
      if (typeof payload.locale === 'string' && payload.locale) {
        if (state.locale !== payload.locale) {
          state.table.aiReading = '';
        }
        state.locale = payload.locale;
        state.notesSynced = false;
        syncNotes(true);
        refreshSpreadLocale();
        ensureDailyInitialized();
        refreshSettingsSurface();
      }
      return buildStagePayload();
    }
    case 'toggle_skin': {
      const next = typeof payload.enabled === 'boolean' ? payload.enabled : !state.store.skin_enabled;
      setThemeSkin(next);
      refreshSettingsSurface();
      return buildStagePayload();
    }
    case 'draw_table': {
      syncNotes();
      if (payload.shuffleOnly) {
        state.table.dealt = [false, false, false];
        state.table.flipped = [false, false, false];
        state.table.aiReading = '';
        return buildStagePayload();
      }
      ensureSpreadInitialized(true);
      if (payload.faceDown) {
        state.table.flipped = [false, false, false];
      }
      return buildStagePayload();
    }
    case 'flip_table_card': {
      ensureSpreadInitialized(false);
      const idx = Number(payload.index);
      if (idx >= 0 && idx < 3 && state.table.dealt[idx]) {
        const next = typeof payload.flipped === 'boolean' ? payload.flipped : !state.table.flipped[idx];
        state.table.flipped[idx] = next;
        const c = state.table.spread?.cards?.[idx];
        if (next && c?.note?.path) {
          recordCollected(c.note.arcanaId, c.note.path, c.note.title, c.reversed);
        }
      }
      return buildStagePayload();
    }
    case 'ai_read_spread': {
      ensureSpreadInitialized(false);
      state.table.altIndex += 1;
      state.table.aiReading = '';
      let aiUsed = false;
      const statusRes = safeCallHost('host.ai.status', {});
      const ready = Boolean(statusRes.ok && (statusRes.result?.ready || statusRes.result?.enabled || statusRes.result?.available));
      const sp = state.table.spread;
      if (ready && sp?.hasCards?.[0] && sp?.hasCards?.[1] && sp?.hasCards?.[2]) {
        const sys = isEn()
          ? 'You are a restrained, insightful writing guide. In 2 concise sentences, connect the Past, Present, and Future note cards into one clear editorial insight without mysticism.'
          : '你是克制而敏锐的中文写作向导，用 2 句简练、有洞见的话把用户笔记里的三张塔罗牌（过去/现在/未来）串起来，不要使用神秘学套话，直接给出写作与取舍启发。';
        const usr = isEn()
          ? `Past: "${sp.cards[0].note.title}" (${arcanaName(sp.cards[0].note.arcanaId, 'en')})\nPresent: "${sp.cards[1].note.title}" (${arcanaName(sp.cards[1].note.arcanaId, 'en')})\nFuture: "${sp.cards[2].note.title}" (${arcanaName(sp.cards[2].note.arcanaId, 'en')})`
          : `过去：《${sp.cards[0].note.title}》（${arcanaName(sp.cards[0].note.arcanaId, 'zh')}）\n现在：《${sp.cards[1].note.title}》（${arcanaName(sp.cards[1].note.arcanaId, 'zh')}）\n未来：《${sp.cards[2].note.title}》（${arcanaName(sp.cards[2].note.arcanaId, 'zh')}）`;
        const compRes = safeCallHost('host.ai.complete', {
          system_prompt: sys,
          user_prompt: usr,
          max_tokens: 260,
        });
        const text = String(compRes.result?.text || compRes.result?.content || '').trim();
        if (compRes.ok && text) {
          state.table.aiReading = text;
          aiUsed = true;
        }
      }
      return { ...buildStagePayload(), aiUsed };
    }
    case 'draw_daily': {
      ensureDailyInitialized();
      return buildStagePayload();
    }
    case 'flip_daily': {
      ensureDailyInitialized();
      const next = typeof payload.flipped === 'boolean' ? payload.flipped : !state.daily.flipped;
      state.daily.flipped = next;
      if (next) {
        const dc = state.daily.card;
        const clean = normalizeNotePath(dc.note?.path || '');
        state.store.daily = {
          date: state.daily.date,
          note_path: clean,
          note_title: dc.note?.title || '',
          arcana_id: dc.note?.arcanaId ?? 0,
          reversed: Boolean(dc.reversed),
          flipped: true,
          doubt_questions: Array.isArray(dc.doubtQuestions) ? dc.doubtQuestions.slice(0, 3) : [],
          doubt_locale: isEn() ? 'en' : 'zh',
        };
        if (clean) {
          recordCollected(dc.note.arcanaId, clean, dc.note.title, dc.reversed);
        } else {
          saveStore();
        }
      } else {
        state.daily.doubtOpen = false;
      }
      return buildStagePayload();
    }
    case 'ai_daily_doubt': {
      ensureDailyInitialized();
      if (payload.open === false) {
        state.daily.doubtOpen = false;
        return buildStagePayload();
      }
      if (!state.daily.flipped) {
        return buildStagePayload();
      }
      state.daily.doubtOpen = true;
      let aiUsed = false;
      const dc = state.daily.card;
      const statusRes = safeCallHost('host.ai.status', {});
      const ready = Boolean(statusRes.ok && (statusRes.result?.ready || statusRes.result?.enabled || statusRes.result?.available));
      if (ready && dc?.note?.path) {
        const body = readNoteTextCached(dc.note.path).slice(0, 1200);
        const sys = isEn()
          ? "You are a sharp, restrained devil's advocate. Return exactly 3 concise counter-questions about the user's note, one per line, no numbering or preamble."
          : '你是锋利而克制的批评者。针对用户的笔记，站在反面提出恰好 3 个简短具体的反问，每行一个问题，不要序号、不要寒暄。';
        const usr = isEn()
          ? `Title: ${dc.note.title}\nContent:\n${body}`
          : `标题：${dc.note.title}\n内容：\n${body}`;
        const compRes = safeCallHost('host.ai.complete', {
          system_prompt: sys,
          user_prompt: usr,
          max_tokens: 300,
        });
        const raw = String(compRes.result?.text || compRes.result?.content || '').trim();
        if (compRes.ok && raw) {
          const qs = raw
            .split('\n')
            .map((line) => line.replace(/^(?:[IVX]{1,3}[.)、]|[\d]+[.)、]|[-•*])\s*/, '').trim())
            .filter(Boolean)
            .slice(0, 3);
          if (qs.length === 3) {
            dc.doubtQuestions = qs;
            if (state.store.daily && state.store.daily.date === state.daily.date) {
              state.store.daily.doubt_questions = qs;
              state.store.daily.doubt_locale = isEn() ? 'en' : 'zh';
              saveStore();
            }
            aiUsed = true;
          }
        }
      }
      if (!aiUsed && dc?.note) {
        const content = dc.note.path ? readNoteTextCached(dc.note.path) : '';
        dc.doubtQuestions = buildDoubtQuestions(dc.note, content, state.locale);
      }
      return { ...buildStagePayload(), aiUsed };
    }
    case 'open_note': {
      const target = normalizeNotePath(payload.path || '');
      if (target) {
        safeCallHost('host.notes.open', { path: target });
      }
      if (payload.closeStage !== false) {
        safeCallHost('host.stage.close', { id: STAGE_ID });
      }
      return { ok: true, opened: target };
    }
    case 'open_ai_followup': {
      ensureDailyInitialized();
      const dc = state.daily.card;
      const target = normalizeNotePath(payload.path || dc?.note?.path || '');
      const title = payload.title || dc?.note?.title || '';
      const qs = Array.isArray(payload.questions) && payload.questions.length > 0 ? payload.questions : dc?.doubtQuestions || [];
      const numbered = qs.map((q, i) => `${i + 1}. ${q}`).join('\n');
      const prompt = isEn()
        ? `Play devil's advocate on "${title}" around these 3 questions and help me challenge or sharpen my argument:\n${numbered}`.trim()
        : `请站在反面帮我审视《${title}》，围绕这三个反问和我展开讨论并给出可写进笔记的补充观点：\n${numbered}`.trim();
      if (target) {
        safeCallHost('host.notes.open', { path: target });
      }
      safeCallHost('host.ai.open_with_prompt', { prompt, note_path: target });
      if (payload.closeStage !== false) {
        safeCallHost('host.stage.close', { id: STAGE_ID });
      }
      return { ok: true, prompt, path: target };
    }
    case 'select_deck_card': {
      const id = Number(payload.id);
      if (Number.isFinite(id) && id >= 0 && id < MAJOR_ARCANA.length) {
        state.deck.selectedId = Math.trunc(id);
      }
      return buildStagePayload();
    }
    case 'set_deck_filter': {
      if (payload.filter === 'all' || payload.filter === 'got' || payload.filter === 'missing') {
        state.deck.filter = payload.filter;
      }
      return buildStagePayload();
    }
    default:
      throw new Error(t(`未知舞台动作：${action}`, `Unknown stage action: ${action}`));
  }
}

serve((method, params) => {
  try {
    if (method === 'plugin.initialize') {
      state.pluginId = String(params.plugin_id || 'block-tarot');
      state.locale = String(params.locale || 'zh');
      state.notebookRoot = String(params.notebook_root || '');
      const caps = params.ui_capabilities;
      if (Array.isArray(caps)) {
        state.metricTone = caps.includes('metric_tone');
      } else if (caps && typeof caps === 'object') {
        state.metricTone = Boolean(caps.metric_tone);
      } else {
        state.metricTone = false;
      }

      const foundStore = loadStore();
      if (!foundStore && typeof params.tarot === 'boolean') {
        state.store.skin_enabled = params.tarot;
      }
      pickInitialDeckSelection();
      if (state.store.skin_enabled) {
        safeCallHost('host.ui.set_theme_skin', { id: SKIN_ID, enabled: true });
      }
      syncTitlebarButton();
      return { ready: true };
    }

    if (method === 'plugin.render') {
      const values = params.values;
      if (values && typeof values === 'object' && Object.prototype.hasOwnProperty.call(values, 'tarot_enabled')) {
        const wanted = Boolean(values.tarot_enabled);
        if (wanted !== state.store.skin_enabled) {
          setThemeSkin(wanted);
        }
      }
      return {
        page: buildSettingsPage(),
        values: { tarot_enabled: Boolean(state.store.skin_enabled) },
      };
    }

    if (method === 'plugin.action') {
      const actionId = String(params.action_id || '');
      const roomMap = {
        open_table: 'table',
        open_daily: 'daily',
        open_deck: 'deck',
      };
      if (roomMap[actionId]) {
        const room = roomMap[actionId];
        const supported = openStage(room);
        const status = supported
          ? t(`已打开塔罗${roomLabel(room)}`, `Opened Tarot ${roomLabel(room)}`)
          : t('请在支持自定义舞台的 Block 桌面端中打开', 'Open in a Block desktop build with stage support');
        return {
          ok: true,
          tone: supported ? 'success' : 'info',
          status,
          page: buildSettingsPage(status),
          values: { tarot_enabled: Boolean(state.store.skin_enabled) },
        };
      }
      if (actionId === 'toggle_skin') {
        setThemeSkin(!state.store.skin_enabled);
        const status = state.store.skin_enabled
          ? t('已开启午夜铜版皮肤', 'Midnight Copperplate skin enabled')
          : t('已恢复默认主题', 'Restored default theme');
        return {
          ok: true,
          tone: 'info',
          status,
          page: buildSettingsPage(status),
          values: { tarot_enabled: Boolean(state.store.skin_enabled) },
        };
      }
      return {
        ok: false,
        tone: 'warning',
        status: t('未知操作', 'Unknown action'),
        page: buildSettingsPage(),
        values: { tarot_enabled: Boolean(state.store.skin_enabled) },
      };
    }

    if (method === 'plugin.command') {
      const cmdId = String(params.command_id || '');
      if (cmdId === 'toggle_tarot') {
        const next = !state.store.skin_enabled;
        const supported = setThemeSkin(next);
        // Entering Tarot Mode also opens the card table; leaving it closes the stage.
        if (next) {
          openStage('table');
        } else {
          safeCallHost('host.stage.close', { id: STAGE_ID });
        }
        refreshSettingsSurface();
        const status = !supported
          ? t('已更新午夜铜版皮肤偏好', 'Updated Midnight Copperplate preference')
          : state.store.skin_enabled
            ? t('已开启午夜铜版皮肤', 'Midnight Copperplate enabled')
            : t('已恢复默认主题', 'Returned to default theme');
        safeCallHost('host.ui.toast', { message: status, tone: 'info' });
        return { ok: true, tone: 'info', status };
      }
      const cmdRooms = {
        open_table: 'table',
        open_daily: 'daily',
        open_deck: 'deck',
      };
      if (cmdRooms[cmdId]) {
        const room = cmdRooms[cmdId];
        const supported = openStage(room);
        refreshSettingsSurface();
        const status = supported
          ? t(`已打开塔罗${roomLabel(room)}`, `Opened Tarot ${roomLabel(room)}`)
          : t('请升级 Block 桌面端以打开塔罗舞台', 'Update Block desktop to open the Tarot Stage');
        return { ok: true, tone: 'info', status };
      }
      return { ok: false, tone: 'warning', status: t('未知命令', 'Unknown command') };
    }

    if (method === 'plugin.event') {
      const eventName = String(params.event || '');
      if (eventName === 'locale.changed' && params.locale) {
        if (state.locale !== String(params.locale)) {
          state.table.aiReading = '';
        }
        state.locale = String(params.locale);
        state.notesSynced = false;
        syncNotes(true);
        refreshSpreadLocale();
        ensureDailyInitialized();
        refreshSettingsSurface();
        emitStageEvent('locale.changed', buildStagePayload());
        return { handled: true };
      }
      if (eventName === 'theme.changed') {
        if (params.skin_id === SKIN_ID && typeof params.enabled === 'boolean') {
          state.store.skin_enabled = params.enabled;
          saveStore();
        } else if (typeof params.tarot === 'boolean') {
          state.store.skin_enabled = params.tarot;
          saveStore();
        }
        syncTitlebarButton();
        refreshSettingsSurface();
        emitStageEvent('theme.changed', { skinEnabled: Boolean(state.store.skin_enabled) });
        return { handled: true };
      }
      if (eventName === 'note.saved') {
        const savedPath = normalizeNotePath(params.path || params.note_path || '');
        if (savedPath) {
          delete state.noteTextCache[savedPath];
        }
        syncNotes(true);
        if (savedPath) {
          const match = state.notes.find((n) => n.path === savedPath);
          if (match) {
            recordCollected(match.arcanaId, match.path, match.title, false);
          } else {
            const title = titleFromPath(savedPath);
            const text = readNoteTextCached(savedPath);
            const id = assignArcana(savedPath, title, text, Math.floor(Date.now() / 1000), text.length, Date.now());
            recordCollected(id, savedPath, title, false);
          }
        }
        refreshSettingsSurface();
        emitStageEvent('notes.updated', buildStagePayload());
        return { handled: true };
      }
      if (eventName === 'note.active_changed') {
        state.activePath = normalizeNotePath(params.path || params.note_path || '');
        syncNotes(true);
        if (state.table.initialized) {
          refreshSpreadLocale();
        }
        emitStageEvent('notes.updated', buildStagePayload());
        return { handled: true };
      }
      return { handled: true };
    }

    if (method === 'plugin.stage_action') {
      const action = String(params.action || params.action_id || '');
      const payload = params.payload && typeof params.payload === 'object' ? params.payload : params.data || {};
      return handleStageAction(action, payload);
    }

    if (method === 'plugin.shutdown') {
      return { ok: true };
    }

    throw new Error(t(`不支持的方法：${method}`, `Unsupported method: ${method}`));
  } catch (err) {
    throw new Error(localizeError(err?.message || err));
  }
});
