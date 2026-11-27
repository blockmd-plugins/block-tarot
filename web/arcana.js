/**
 * 22 Major Arcana bilingual dataset and Tarot note/spread/daily logic.
 * Pure ES module compatible with QuickJS-ng, browser WebView, and Node.
 */

export const MAJOR_ARCANA = [
  { id: 0, key: 'fool', num: '0', nameZh: '愚者', nameEn: 'The Fool', roleZh: '尚未落笔的新起点', roleEn: 'An unwritten beginning', revZh: '迟迟没有迈出的第一步', revEn: 'A first step still hesitated' },
  { id: 1, key: 'magician', num: 'I', nameZh: '魔术师', nameEn: 'The Magician', roleZh: '把想法落地的行动与计划', roleEn: 'Turning intent into plan', revZh: '目标铺得太开，精力分散', revEn: 'Goals spread too thin' },
  { id: 2, key: 'priestess', num: 'II', nameZh: '女祭司', nameEn: 'The High Priestess', roleZh: '静默观察、记录与直觉', roleEn: 'Quiet record and intuition', revZh: '记下来却尚未消化', revEn: 'Recorded but not yet absorbed' },
  { id: 3, key: 'empress', num: 'III', nameZh: '女皇', nameEn: 'The Empress', roleZh: '丰饶生长与从容积累', roleEn: 'Abundant growth and craft', revZh: '堆叠过多，缺少修剪', revEn: 'Overgrown and due for pruning' },
  { id: 4, key: 'emperor', num: 'IV', nameZh: '皇帝', nameEn: 'The Emperor', roleZh: '秩序、边界与长期框架', roleEn: 'Structure and clear bounds', revZh: '规则过紧，压住了灵活性', revEn: 'Structure turning rigid' },
  { id: 5, key: 'hierophant', num: 'V', nameZh: '教皇', nameEn: 'The Hierophant', roleZh: '方法论、经验与传承', roleEn: 'Method and craft discipline', revZh: '沿用惯例却忘了为什么', revEn: 'Habit without questioning why' },
  { id: 6, key: 'lovers', num: 'VI', nameZh: '恋人', nameEn: 'The Lovers', roleZh: '取舍、对齐与重要决定', roleEn: 'Choice and alignment', revZh: '两头都想要，反而停住', revEn: 'Wanting both sides at once' },
  { id: 7, key: 'chariot', num: 'VII', nameZh: '战车', nameEn: 'The Chariot', roleZh: '推进、冲刺与突破瓶颈', roleEn: 'Momentum and breakthrough', revZh: '跑得太快，方向偏了半度', revEn: 'Moving fast off course' },
  { id: 8, key: 'strength', num: 'VIII', nameZh: '力量', nameEn: 'Strength', roleZh: '克制、韧性与持久习惯', roleEn: 'Quiet persistence', revZh: '用力过猛，容易半途疲惫', revEn: 'Pushing harder than sustainable' },
  { id: 9, key: 'hermit', num: 'IX', nameZh: '隐士', nameEn: 'The Hermit', roleZh: '独处沉淀与旧日回望', roleEn: 'Solitude and looking back', revZh: '关起门太久，缺一个反面声音', revEn: 'Too long alone without pushback' },
  { id: 10, key: 'wheel', num: 'X', nameZh: '命运之轮', nameEn: 'Wheel of Fortune', roleZh: '流转、清单与阶段切换', roleEn: 'Turning cycles and checklists', revZh: '被琐事推着转，忘了主线', revEn: 'Carried along by routine' },
  { id: 11, key: 'justice', num: 'XI', nameZh: '正义', nameEn: 'Justice', roleZh: '复盘、权衡与诚实判断', roleEn: 'Honest review and balance', revZh: '替自己找了太顺耳的解释', revEn: 'An explanation too comfortable' },
  { id: 12, key: 'hanged', num: 'XII', nameZh: '倒吊人', nameEn: 'The Hanged Man', roleZh: '停在半路，换个角度看', roleEn: 'Paused mid-way for perspective', revZh: '卡在同一个结上反复打转', revEn: 'Stuck circling the same knot' },
  { id: 13, key: 'death', num: 'XIII', nameZh: '死神', nameEn: 'Death', roleZh: '断舍离与彻底翻篇', roleEn: 'Clean endings and renewal', revZh: '舍不得删掉已经过时的段落', revEn: 'Holding onto outdated lines' },
  { id: 14, key: 'temperance', num: 'XIV', nameZh: '节制', nameEn: 'Temperance', roleZh: '节奏调和与少即是多', roleEn: 'Measured pace and harmony', revZh: '节奏失衡，急于一次写完', revEn: 'Rushing what needs balance' },
  { id: 15, key: 'devil', num: 'XV', nameZh: '恶魔', nameEn: 'The Devil', roleZh: '执念、惯性与隐藏成本', roleEn: 'Hidden attachments and traps', revZh: '被旧假设绑住手脚', revEn: 'Bound by an old assumption' },
  { id: 16, key: 'tower', num: 'XVI', nameZh: '高塔', nameEn: 'The Tower', roleZh: '推翻重来与意外洞见', roleEn: 'Sudden rethink and clarity', revZh: '早看出裂缝却一直回避', revEn: 'Ignoring a visible crack' },
  { id: 17, key: 'star', num: 'XVII', nameZh: '星星', nameEn: 'The Star', roleZh: '远景、愿景与写给未来', roleEn: 'Distant horizon and hope', revZh: '停留在想象，还没落下第一句', revEn: 'A vision waiting for its first line' },
  { id: 18, key: 'moon', num: 'XVIII', nameZh: '月亮', nameEn: 'The Moon', roleZh: '漫游、记忆与幽微感受', roleEn: 'Memory, drift, and nuance', revZh: '思绪朦胧，需要一句直白的话', revEn: 'Hazy thoughts needing plain words' },
  { id: 19, key: 'sun', num: 'XIX', nameZh: '太阳', nameEn: 'The Sun', roleZh: '明朗、喜悦与清晰答案', roleEn: 'Clarity and warm certainty', revZh: '过于乐观，漏掉了边界条件', revEn: 'Too sunny to spot edge cases' },
  { id: 20, key: 'judgement', num: 'XX', nameZh: '审判', nameEn: 'Judgement', roleZh: '阶段总结与重新出发', roleEn: 'Awakening and synthesis', revZh: '总结写完却没改变下一步', revEn: 'Reviewing without changing action' },
  { id: 21, key: 'world', num: 'XXI', nameZh: '世界', nameEn: 'The World', roleZh: '闭环、圆满与想清楚再开口', roleEn: 'Completion and wholeness', revZh: '只差最后收尾却迟迟不落幕', revEn: 'One final stroke left undone' },
];

export function isEnLocale(locale) {
  return String(locale || '').toLowerCase().startsWith('en');
}

export function tr(locale, zh, en) {
  return isEnLocale(locale) ? en : zh;
}

export function arcanaById(id) {
  const n = MAJOR_ARCANA.length;
  const num = Number.isFinite(Number(id)) ? Math.trunc(Number(id)) : 0;
  const idx = ((num % n) + n) % n;
  return MAJOR_ARCANA[idx];
}

export function arcanaByKey(key) {
  return MAJOR_ARCANA.find((a) => a.key === key) || MAJOR_ARCANA[1];
}

export function arcanaName(arc, locale) {
  const a = typeof arc === 'number' ? arcanaById(arc) : arc || MAJOR_ARCANA[1];
  return tr(locale, a.nameZh, a.nameEn);
}

export function arcanaRoleHint(arc, reversed, locale) {
  const a = typeof arc === 'number' ? arcanaById(arc) : arc || MAJOR_ARCANA[1];
  if (reversed) return tr(locale, a.revZh, a.revEn);
  return tr(locale, a.roleZh, a.roleEn);
}

export function cleanNotePath(p) {
  if (!p) return '';
  const norm = String(p).replace(/\\/g, '/').replace(/\/+/g, '/');
  const parts = [];
  for (const seg of norm.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (parts.length > 0 && parts[parts.length - 1] !== '..') parts.pop();
      continue;
    }
    parts.push(seg);
  }
  return (norm.startsWith('/') ? '/' : '') + parts.join('/');
}

export function pathBase(p) {
  const s = String(p || '').replace(/\\/g, '/');
  const idx = s.lastIndexOf('/');
  return idx >= 0 ? s.slice(idx + 1) : s;
}

export function titleFromPath(p) {
  const base = pathBase(p);
  return base.replace(/\.[^.]+$/, '') || base;
}

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    // Encode as UTF-8 bytes to stay close to Go's fnv.New32a on UTF-8 strings.
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      h ^= code;
      h = Math.imul(h, 0x01000193) >>> 0;
    } else if (code < 0x800) {
      h ^= 0xc0 | (code >> 6);
      h = Math.imul(h, 0x01000193) >>> 0;
      h ^= 0x80 | (code & 0x3f);
      h = Math.imul(h, 0x01000193) >>> 0;
    } else {
      h ^= 0xe0 | (code >> 12);
      h = Math.imul(h, 0x01000193) >>> 0;
      h ^= 0x80 | ((code >> 6) & 0x3f);
      h = Math.imul(h, 0x01000193) >>> 0;
      h ^= 0x80 | (code & 0x3f);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h >>> 0;
}

function fnv1a64Update(h, str) {
  let hash = h;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      hash = ((hash ^ BigInt(code)) * prime) & mask;
    } else if (code < 0x800) {
      hash = ((hash ^ BigInt(0xc0 | (code >> 6))) * prime) & mask;
      hash = ((hash ^ BigInt(0x80 | (code & 0x3f))) * prime) & mask;
    } else {
      hash = ((hash ^ BigInt(0xe0 | (code >> 12))) * prime) & mask;
      hash = ((hash ^ BigInt(0x80 | ((code >> 6) & 0x3f))) * prime) & mask;
      hash = ((hash ^ BigInt(0x80 | (code & 0x3f))) * prime) & mask;
    }
  }
  return hash;
}

function containsAny(text, subs) {
  for (const sub of subs) {
    if (text.includes(sub)) return true;
  }
  return false;
}

export function assignArcana(notePath, title, content, modUnix, size, nowMs = Date.now()) {
  const lower = `${title || ''}\n${content || ''}`.toLowerCase();
  const trimmed = String(content || '').trim();
  const byteSize = Number(size || 0);

  if (byteSize <= 24 && trimmed.length < 12) {
    if (containsAny(lower, ['未来', '十年', '愿望', '梦想', 'future', 'dream', 'letter', '信'])) {
      return 17;
    }
    return 0;
  }

  if (containsAny(lower, ['计划', '目标', '年度', 'okr', 'roadmap', 'plan', 'goal'])) return 1;
  if (containsAny(lower, ['会议', '纪要', '评审', '笔记', 'meeting', 'review', 'spec', 'design'])) return 2;
  if (containsAny(lower, ['草稿', '待补充', 'todo', 'wip', 'draft', '周报', 'weekly'])) return 12;
  if (containsAny(lower, ['清单', 'checklist', '搬家', '打包', 'list', '步骤'])) return 10;
  if (containsAny(lower, ['旅行', '游记', '札记', '散步', '京都', '梦', 'travel', 'trip', 'diary', '日记'])) return 18;
  if (containsAny(lower, ['书架', '家', '阳光', '快乐', '美食', 'home', 'idea', '灵感'])) return 19;
  if (containsAny(lower, ['复盘', '总结', '回顾', '反思', 'retro', 'summary', 'postmortem'])) return 20;
  if (containsAny(lower, ['读书', '书评', '摘录', 'book', 'reading', '置身事内'])) return 9;
  if (containsAny(lower, ['选择', '决定', '对比', '权衡', 'tradeoff', 'vs', '决策'])) return 6;
  if (containsAny(lower, ['架构', '规范', '原则', 'rule', 'system', '框架'])) return 4;
  if (containsAny(lower, ['教程', '指南', '方法', 'guide', 'how to', '学习'])) return 5;
  if (containsAny(lower, ['习惯', '锻炼', '游泳', '跑步', '坚持', 'habit', 'workout'])) return 8;
  if (containsAny(lower, ['发布', '上线', '冲刺', 'launch', 'ship', 'release'])) return 7;
  if (containsAny(lower, ['重构', '推翻', '故障', 'bug', 'incident'])) return 16;
  if (containsAny(lower, ['清理', '归档', '放弃', '删除', 'archive', 'cleanup'])) return 13;
  if (containsAny(lower, ['清楚', '完结', '完成', '里程碑', 'milestone', 'done', '开口'])) return 21;

  const nowSec = Math.floor(nowMs / 1000);
  if (modUnix > 0 && nowSec - modUnix > 45 * 24 * 3600) {
    return 9;
  }

  return fnv1a32(`${pathBase(notePath)}|${title || ''}`) % MAJOR_ARCANA.length;
}

export function formatRelativeTime(modUnix, isEmpty, isDirty, nowMs = Date.now(), locale = 'zh') {
  if (isDirty) return tr(locale, '未保存', 'Unsaved');
  if (isEmpty) return tr(locale, '尚未动笔', 'Unwritten');
  if (!modUnix || modUnix <= 0) return tr(locale, '最近', 'Recently');

  const nowSec = Math.floor(nowMs / 1000);
  const diffSec = Math.max(0, nowSec - modUnix);
  const days = Math.floor(diffSec / 86400);

  if (diffSec < 3600) return tr(locale, '刚刚', 'Just now');
  if (days === 0) return tr(locale, '今天', 'Today');
  if (days === 1) return tr(locale, '昨天', 'Yesterday');
  if (days < 7) return tr(locale, `${days} 天前`, `${days} days ago`);
  if (days < 30) {
    const weeks = Math.max(Math.floor(days / 7), 1);
    return tr(locale, `${weeks} 周前`, `${weeks} weeks ago`);
  }
  if (days < 365) {
    const months = Math.max(Math.floor(days / 30), 1);
    return tr(locale, `${months} 个月前`, `${months} months ago`);
  }
  const years = Math.max(Math.floor(days / 365), 1);
  return tr(locale, `${years} 年前`, `${years} years ago`);
}

function chineseDay(d) {
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (d <= 0) return '一日';
  if (d < 10) return `${digits[d]}日`;
  if (d === 10) return '十日';
  if (d < 20) return `十${digits[d - 10]}日`;
  if (d === 20) return '二十日';
  if (d < 30) return `二十${digits[d - 20]}日`;
  if (d === 30) return '三十日';
  return '三十一日';
}

export function formatRitualDate(date = new Date(), locale = 'zh') {
  const d = date instanceof Date ? date : new Date(date);
  if (isEnLocale(locale)) {
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthsEn[d.getMonth()] || 'January'} ${d.getDate()}`;
  }
  const monthsZh = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ];
  return `${monthsZh[d.getMonth()] || '一月'}${chineseDay(d.getDate())}`;
}

export function localDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseModUnix(entry) {
  if (typeof entry.mod_unix === 'number' && entry.mod_unix > 0) return entry.mod_unix;
  if (typeof entry.modUnix === 'number' && entry.modUnix > 0) return entry.modUnix;
  if (entry.mod_time) {
    const ms = Date.parse(entry.mod_time);
    if (Number.isFinite(ms)) return Math.floor(ms / 1000);
  }
  return 0;
}

export function buildDeckNotes(
  entries = [],
  activePath = '',
  activeDirty = false,
  overrides = {},
  readSnippet = null,
  nowMs = Date.now(),
  locale = 'zh'
) {
  const cleanActive = activePath ? cleanNotePath(activePath) : '';
  const out = [];

  const walk = (list) => {
    if (!Array.isArray(list)) return;
    for (const e of list) {
      if (!e || typeof e !== 'object') continue;
      if (e.is_dir || e.isDir) {
        walk(e.children || e.Children || []);
        continue;
      }
      const rawPath = e.path || e.Path || '';
      if (!rawPath) continue;
      const isMd = e.is_markdown ?? e.isMarkdown ?? /\.(md|markdown)$/i.test(rawPath);
      if (!isMd) continue;

      const clean = cleanNotePath(rawPath);
      const title = String(e.title || e.name || e.Name || '').trim() || titleFromPath(clean);
      const modUnix = parseModUnix(e);
      const size = Number(e.size ?? e.Size ?? 0);
      const isActive = Boolean(cleanActive && clean === cleanActive);

      let arcanaId;
      if (overrides && Object.prototype.hasOwnProperty.call(overrides, clean)) {
        arcanaId = Number(overrides[clean]);
      } else {
        const snippet = typeof readSnippet === 'function' ? String(readSnippet(clean) || '') : '';
        arcanaId = assignArcana(clean, title, snippet, modUnix, size, nowMs);
      }

      const isEmpty = size <= 24;
      const when = formatRelativeTime(modUnix, isEmpty, isActive && Boolean(activeDirty), nowMs, locale);
      out.push({
        path: clean,
        title,
        arcanaId: arcanaById(arcanaId).id,
        modUnix,
        size,
        isEmpty,
        isDirty: isActive && Boolean(activeDirty),
        isActive,
        when,
      });
    }
  };

  walk(entries);
  return out;
}

function pickPreferringFresh(pool, prevPath, excludePath, rng) {
  const limit = Math.min(pool.length, 6);
  const fresh = [];
  for (let i = 0; i < limit; i++) {
    if (pool[i].path !== prevPath && pool[i].path !== excludePath) {
      fresh.push(pool[i]);
    }
  }
  if (fresh.length > 0) {
    return fresh[Math.floor(rng() * fresh.length)];
  }
  const fallback = pool.filter((n) => n.path !== excludePath);
  if (fallback.length > 0) {
    return fallback[Math.floor(rng() * fallback.length)];
  }
  return pool[0];
}

export function buildSpreadReadings(sp, locale = 'zh') {
  if (!sp || !sp.hasCards || !sp.hasCards[0] || !sp.hasCards[1] || !sp.hasCards[2]) {
    return [
      tr(
        locale,
        '笔记本里还没有牌。先新建一篇笔记写下几行字，牌桌就会亮起来。',
        'Your deck is empty. Create a note to light up the tarot table.'
      ),
    ];
  }

  const [p, c, f] = sp.cards;
  const pArc = arcanaById(p.note.arcanaId);
  const cArc = arcanaById(c.note.arcanaId);
  const fArc = arcanaById(f.note.arcanaId);

  if (isEnLocale(locale)) {
    return [
      `What you wrote in "${p.note.title}" (${pArc.nameEn}) still echoes here: borrow its restraint to sharpen "${c.note.title}", then carry one clear thread forward into "${f.note.title}".`,
      `${pArc.nameEn} looks back while ${cArc.nameEn} holds the pen today — finish one concrete section of "${c.note.title}" before opening "${f.note.title}" (${fArc.nameEn}).`,
    ];
  }

  const pOrient = p.reversed ? '逆位' : '正位';
  return [
    `${p.note.when}你在《${p.note.title}》里留下的线索，正好能替《${c.note.title}》删繁就简；把当下这一节落稳，剩下的留给《${f.note.title}》。`,
    `${pArc.nameZh}${pOrient}提醒你先回头看一眼：《${p.note.title}》与《${c.note.title}》其实牵着同一根线，写完手头这一段，再去翻开《${f.note.title}》（${fArc.nameZh}）。`,
    `此刻执笔的是${cArc.nameZh}——不必一次写满，先在《${c.note.title}》里写清最关键的一条判断，再让《${f.note.title}》接住你的下一步。`,
  ];
}

export function drawThreeSpread(notes = [], activePath = '', prevPaths = ['', '', ''], locale = 'zh', rng = Math.random) {
  const posLabels = [
    tr(locale, '过去', 'Past'),
    tr(locale, '现在', 'Present'),
    tr(locale, '未来', 'Future'),
  ];

  if (!Array.isArray(notes) || notes.length === 0) {
    return {
      cards: posLabels.map((position) => ({ position, note: null, reversed: false, actionText: '', metaText: '' })),
      hasCards: [false, false, false],
      lines: [
        tr(
          locale,
          '笔记本里还没有牌。先新建一篇笔记写下几行字，牌桌就会亮起来。',
          'Your deck is empty. Create a note to light up the tarot table.'
        ),
      ],
      ctaTitle: '',
      ctaPath: '',
    };
  }

  const cleanActive = activePath ? cleanNotePath(activePath) : '';
  let presentIdx = 0;
  if (cleanActive) {
    const found = notes.findIndex((n) => n.path === cleanActive);
    if (found >= 0) presentIdx = found;
  }
  const present = notes[presentIdx];

  let others = notes.filter((_, i) => !(i === presentIdx && notes.length > 1));
  if (others.length === 0) others = [present];

  const pastPool = [...others].sort((a, b) => {
    if (a.isEmpty !== b.isEmpty) return a.isEmpty ? 1 : -1;
    return a.modUnix - b.modUnix;
  });
  const past = pickPreferringFresh(pastPool, prevPaths[0] || '', '', rng);

  const futurePool = [...others].sort((a, b) => {
    if (a.isEmpty !== b.isEmpty) return a.isEmpty ? -1 : 1;
    return a.size - b.size;
  });
  const future = pickPreferringFresh(futurePool, prevPaths[2] || '', past.path, rng);

  const chosen = [past, present, future];
  const cards = chosen.map((n, i) => {
    const reversed = i !== 1 && Math.floor(rng() * 4) === 0;
    let actionText = tr(locale, '重读', 'Reread');
    if (i === 1) {
      actionText = tr(locale, '续写', 'Continue');
    } else if (n.isEmpty) {
      actionText = tr(locale, '动笔', 'Begin');
    }
    const orient = reversed ? tr(locale, '逆位', 'Reversed') : tr(locale, '正位', 'Upright');
    return {
      position: posLabels[i],
      note: n,
      reversed,
      actionText,
      metaText: `${n.when} · ${orient}`,
    };
  });

  const sp = {
    cards,
    hasCards: [true, true, true],
    lines: [],
    ctaTitle: present.title,
    ctaPath: present.path,
  };
  sp.lines = buildSpreadReadings(sp, locale);
  return sp;
}

export function extractExcerpt(md, fallbackTitle, locale = 'zh') {
  const lines = String(md || '').split('\n');
  let firstQuote = '';
  let firstPara = '';
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !line || line.startsWith('#') || line.startsWith('---') || line.startsWith('![')) {
      continue;
    }
    if (line.startsWith('>')) {
      const q = line.replace(/^[>\s]+/, '').trim();
      if ([...q].length >= 6 && !firstQuote) {
        firstQuote = q;
        break;
      }
      continue;
    }
    let cleaned = line.replace(/^[-*+0-9.\s]+/, '');
    cleaned = cleaned.replace(/\*\*/g, '').replace(/`/g, '').trim();
    if ([...cleaned].length >= 8 && !firstPara) {
      firstPara = cleaned;
    }
  }

  let pick = firstQuote || firstPara;
  if (!pick) {
    return isEnLocale(locale)
      ? `"${fallbackTitle}" is still waiting for its next paragraph.`
      : `「《${fallbackTitle}》还在等你写下真正想留住的那句话。」`;
  }
  const chars = [...pick];
  if (chars.length > 64) {
    pick = `${chars.slice(0, 63).join('')}…`;
  }
  if (isEnLocale(locale)) {
    return `“${pick}”`;
  }
  return pick.startsWith('「') ? pick : `「${pick}」`;
}

export function buildDoubtQuestions(note, content, locale = 'zh') {
  const excerpt = extractExcerpt(content, note.title, locale).replace(/^[「“]+|[」”]+$/g, '');
  const chars = [...excerpt];
  const shortEx = chars.length > 22 ? `${chars.slice(0, 21).join('')}…` : excerpt;

  if (isEnLocale(locale)) {
    return [
      `Does "${shortEx}" still hold up under your real constraints today, or can you name a clear counterexample?`,
      `In "${note.title}", which claim did you borrow from others instead of testing yourself?`,
      `Since ${note.when}, what concrete decision did this note change — and if none, what needs to be rewritten or cut?`,
    ];
  }
  return [
    `「${shortEx}」放到你现在的处境里还成立吗？你能举出一个反例吗？`,
    `回头看《${note.title}》，里面有哪些判断只是顺手复述，真正属于你自己的不同意见在哪里？`,
    '距离上次写下这篇已经过去了一段时间，它改变了你哪一个具体决定？如果说不出来，这一篇该删掉还是重写？',
  ];
}

export function pickDailyCard(
  notes = [],
  dateStr = localDateKey(),
  savedDaily = null,
  readText = null,
  nowMs = Date.now(),
  locale = 'zh'
) {
  const dc = {
    date: dateStr,
    dateDisplay: formatRitualDate(new Date(nowMs), locale),
    note: null,
    reversed: false,
    excerpt: '',
    doubtQuestions: [],
    lastOpened: '',
  };

  if (!Array.isArray(notes) || notes.length === 0) {
    dc.note = {
      path: '',
      title: tr(locale, '未命名笔记本', 'Empty Notebook'),
      arcanaId: 0,
      isEmpty: true,
      when: tr(locale, '尚未动笔', 'Unwritten'),
    };
    dc.excerpt = tr(
      locale,
      '「写下今天的第一行字，牌面便会随之显现。」',
      'Write your first line today and the card will take shape.'
    );
    dc.doubtQuestions = buildDoubtQuestions(dc.note, '', locale);
    dc.lastOpened = tr(locale, '尚未打开', 'Not opened yet');
    return dc;
  }

  let chosen = null;
  let foundSaved = false;
  if (savedDaily && savedDaily.date === dateStr && savedDaily.note_path) {
    const cleanSaved = cleanNotePath(savedDaily.note_path);
    const match = notes.find((n) => n.path === cleanSaved);
    if (match) {
      chosen = { ...match };
      if (typeof savedDaily.arcana_id === 'number' && savedDaily.arcana_id >= 0 && savedDaily.arcana_id < MAJOR_ARCANA.length) {
        chosen.arcanaId = savedDaily.arcana_id;
      }
      dc.reversed = Boolean(savedDaily.reversed);
      foundSaved = true;
    }
  }

  if (!foundSaved) {
    const nonEmpty = notes.filter((n) => !n.isEmpty);
    const pool = nonEmpty.length > 0 ? nonEmpty : notes;
    let seed = 0xcbf29ce484222325n;
    seed = fnv1a64Update(seed, `block-tarot-daily:${dateStr}`);
    for (const n of pool) {
      seed = fnv1a64Update(seed, `|${pathBase(n.path)}`);
    }
    chosen = { ...pool[Number(seed % BigInt(pool.length))] };
    dc.reversed = Number((seed >> 16n) % 3n) === 0;
  }

  dc.note = chosen;
  const content = typeof readText === 'function' && chosen.path ? String(readText(chosen.path) || '') : '';
  dc.excerpt = extractExcerpt(content, chosen.title, locale);

  if (
    savedDaily &&
    Array.isArray(savedDaily.doubt_questions) &&
    savedDaily.doubt_questions.length >= 3 &&
    savedDaily.date === dateStr &&
    cleanNotePath(savedDaily.note_path || '') === chosen.path &&
    (!savedDaily.doubt_locale || isEnLocale(savedDaily.doubt_locale) === isEnLocale(locale))
  ) {
    dc.doubtQuestions = savedDaily.doubt_questions.slice(0, 3);
  } else {
    dc.doubtQuestions = buildDoubtQuestions(chosen, content, locale);
  }
  dc.lastOpened = `${tr(locale, '上次修改 · ', 'Last edited · ')}${chosen.when}`;
  return dc;
}

export function formatDeckWhen(drawnUnix, reversed = false, nowMs = Date.now(), locale = 'zh') {
  const orient = reversed ? tr(locale, '逆位', 'Reversed') : tr(locale, '正位', 'Upright');
  const unix = Number(drawnUnix || 0);
  if (!unix || unix <= 0) return orient;

  const d = new Date(unix * 1000);
  const now = new Date(nowMs);
  if (localDateKey(d) === localDateKey(now)) {
    return tr(locale, '今天抽到 · ', 'Drawn today · ') + orient;
  }
  if (isEnLocale(locale)) {
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Drawn ${monthsShort[d.getMonth()] || 'Jan'} ${d.getDate()} · ${orient}`;
  }
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日抽到 · ${orient}`;
}
