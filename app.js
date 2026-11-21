(function () {
  'use strict';

  // Exclusive Teacher Access Codes (stored as SHA-256 hashes of UPPERCASE code)
  // To add a new code, run: node -e "console.log(require('crypto').createHash('sha256').update('YOUR-CODE').digest('hex'))"
  const VALID_CODE_HASHES = new Set([
    '033802dac62a3d2b0e981dc88f41e3ee5692c80cf10a87ada489d16137819fa3', // CIKGU-2026
    '6f97d62ca806fa6c7c61455f7aad03eec7aa67e80ea546678f62b2bfe600bfe8', // SEKOLAH-MY
    '63a500d1aecc847164f2ecf05df1eb6708cac89ffa7ea0cae741c1195d0b31fd', // GURU-VIP
  ]);

  const STORAGE_NOTES = 'cikgunote_notes_v1';
  const STORAGE_AUTH = 'cikgunote_unlocked_v1';
  const STORAGE_LANG = 'cikgunote_lang_v1';
  const STORAGE_PROFILE = 'cikgunote_profile_v1';
  const CODE_SIGN_SALT = 'CIKGU-MY-2026-DESK';

  const I18N = {
    en: {
      gate_sub: 'Private Notebook for Malaysian Teachers',
      gate_title: 'Welcome back, Cikgu.',
      gate_desc: 'Enter your access code, or register automatically below to receive your personal code in 5 seconds.',
      tab_unlock: 'I Have a Code',
      tab_register: 'Get Free Code (Auto)',
      gate_label: 'Teacher Access Code',
      gate_btn: 'Unlock My Desk',
      reg_name_label: 'Teacher Name',
      reg_school_label: 'School / Institution',
      reg_email_label: 'MOE / School Email (DELIMa or Gmail)',
      reg_btn: 'Generate My Personal Code',
      reg_ready: 'Your personal teacher code is ready:',
      reg_save_tip: 'Save this code — you can use it anytime on any browser.',
      copy_code: 'Copy Code',
      enter_desk: 'Open My Desk →',
      gate_note: '100% Free · Works Offline · Private to Your Browser',
      gate_invalid: 'Invalid access code. Please check your code or click "Get Free Code (Auto)".',
      app_sub: "Teacher's Desk",
      new_note: 'New Note',
      folders_heading: 'Folders',
      templates_heading: 'Quick Templates',
      tpl_rph: 'RPH (KSSR / KSSM)',
      tpl_pbd: 'PBD Checklist (TP1–TP6)',
      tpl_meeting: 'Minit Mesyuarat',
      backup: 'Backup',
      restore: 'Restore',
      lock: 'Lock Desk',
      empty_title: 'Select a note or start a fresh page.',
      empty_desc: 'Use the RPH or PBD templates on the left to save time preparing lessons.',
      folders: {
        all: 'All Notes',
        rph: 'RPH / Lesson Plan',
        exam: 'Exam & PBD',
        student: 'Student Notes',
        meeting: 'Meeting / Mesyuarat',
        scratch: 'Scratchpad',
      },
    },
    bm: {
      gate_sub: 'Buku Nota Peribadi Guru Malaysia',
      gate_title: 'Selamat kembali, Cikgu.',
      gate_desc: 'Masukkan kod akses anda, atau daftar secara automatik di bawah untuk dapatkan kod peribadi dalam 5 saat.',
      tab_unlock: 'Saya Ada Kod',
      tab_register: 'Daftar Percuma (Auto)',
      gate_label: 'Kod Akses Guru',
      gate_btn: 'Buka Meja Nota',
      reg_name_label: 'Nama Guru',
      reg_school_label: 'Sekolah / Institusi',
      reg_email_label: 'Emel DELIMa / Sekolah / Gmail',
      reg_btn: 'Jana Kod Peribadi Saya',
      reg_ready: 'Kod akses peribadi anda sudah sedia:',
      reg_save_tip: 'Simpan kod ini — anda boleh gunakannya di mana-mana pelayar.',
      copy_code: 'Salin Kod',
      enter_desk: 'Buka Meja Nota →',
      gate_note: '100% Percuma · Boleh Guna Offline · Privasi Terjamin',
      gate_invalid: 'Kod akses tidak sah. Sila semak kod anda atau klik "Daftar Percuma (Auto)".',
      app_sub: 'Meja Nota Guru',
      new_note: 'Nota Baharu',
      folders_heading: 'Folder',
      templates_heading: 'Templat Pantas',
      tpl_rph: 'RPH (KSSR / KSSM)',
      tpl_pbd: 'Senarai Semak PBD (TP1–TP6)',
      tpl_meeting: 'Minit Mesyuarat',
      backup: 'Sandaran',
      restore: 'Pulihkan',
      lock: 'Kunci',
      empty_title: 'Pilih nota atau mulakan halaman baharu.',
      empty_desc: 'Gunakan templat RPH atau PBD di sebelah kiri untuk menjimatkan masa persediaan.',
      folders: {
        all: 'Semua Nota',
        rph: 'RPH / Rancangan Mengajar',
        exam: 'Peperiksaan & PBD',
        student: 'Catatan Murid',
        meeting: 'Mesyuarat',
        scratch: 'Nota Ringkas',
      },
    },
  };

  const TEMPLATES = {
    rph: () => {
      const today = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        folder: 'rph',
        title: `RPH — [Mata Pelajaran] (${today})`,
        className: 'Tahun 4 / Tingkatan 1',
        body: [
          `Tarikh / Hari : ${today}`,
          'Masa          : 8:00 pagi – 9:00 pagi',
          'Kelas         : [Contoh: 4 Bestari]',
          'Mata Pelajaran: [Contoh: Sains / Matematik / BM]',
          'Tajuk         : [Tajuk Pelajaran]',
          '',
          'Standard Kandungan:',
          '- ',
          '',
          'Standard Pembelajaran:',
          '- ',
          '',
          'Objektif Pembelajaran (Pada akhir PdPc, murid dapat):',
          '1. ',
          '2. ',
          '',
          'Aktiviti PdPc:',
          '- Set Induksi (5 min): ',
          '- Perkembangan (40 min): ',
          '- Penutup (15 min): ',
          '',
          'BBM / EMK / KBAT:',
          '- ',
          '',
          'Refleksi:',
          '- ___ / ___ murid mencapai objektif pembelajaran.',
        ].join('\n'),
      };
    },
    pbd: () => ({
      folder: 'exam',
      title: 'Rekod Pentaksiran Bilik Darjah (PBD)',
      className: 'Kelas & Subjek',
      body: [
        'Subjek / Topik: ',
        'Tarikh Semakan: ' + new Date().toLocaleDateString('en-MY'),
        '',
        'Tahap Penguasaan (TP):',
        '- [ ] TP1 – Tahu',
        '- [ ] TP2 – Tahu dan Faham',
        '- [ ] TP3 – Tahu, Faham dan Boleh Buat',
        '- [ ] TP4 – Tahu, Faham dan Boleh Buat dengan Beradab',
        '- [ ] TP5 – Tahu, Faham dan Boleh Buat dengan Beradab Terpuji',
        '- [ ] TP6 – Tahu, Faham dan Boleh Buat dengan Beradab Mithali',
        '',
        'Murid Perlu Bimbingan / Pemulihan:',
        '- [ ] ',
        '',
        'Murid Pengayaan:',
        '- [ ] ',
      ].join('\n'),
    }),
    meeting: () => ({
      folder: 'meeting',
      title: 'Minit Mesyuarat / Perjumpaan',
      className: 'Panitia / PIBG',
      body: [
        'Tarikh : ' + new Date().toLocaleDateString('en-MY'),
        'Tempat : Bilik Mesyuarat / Google Meet',
        'Hadir  : ',
        '',
        'Agenda & Perkara Berbangkit:',
        '1. ',
        '2. ',
        '',
        'Tindakan Susulan:',
        '- [ ] ',
        '- [ ] ',
      ].join('\n'),
    }),
  };

  const state = {
    lang: localStorage.getItem(STORAGE_LANG) === 'bm' ? 'bm' : 'en',
    folder: 'all',
    search: '',
    notes: [],
    activeId: null,
  };

  const els = {
    shareView: document.getElementById('share-view'),
    shareTitle: document.getElementById('share-title'),
    shareFolder: document.getElementById('share-folder'),
    shareDate: document.getElementById('share-date'),
    shareBody: document.getElementById('share-body'),
    btnSharePrint: document.getElementById('btn-share-print'),

    gateScreen: document.getElementById('gate-screen'),
    tabUnlock: document.getElementById('tab-unlock'),
    tabRegister: document.getElementById('tab-register'),
    gateForm: document.getElementById('gate-form'),
    codeInput: document.getElementById('access-code-input'),
    gateError: document.getElementById('gate-error'),
    gateLangBtn: document.getElementById('gate-lang-btn'),
    registerForm: document.getElementById('register-form'),
    regName: document.getElementById('reg-name'),
    regSchool: document.getElementById('reg-school'),
    regEmail: document.getElementById('reg-email'),
    regError: document.getElementById('reg-error'),
    regResult: document.getElementById('reg-result'),
    regGeneratedCode: document.getElementById('reg-generated-code'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnEnterNow: document.getElementById('btn-enter-now'),

    appShell: document.getElementById('app-shell'),
    sidebar: document.getElementById('sidebar'),
    btnOpenSidebar: document.getElementById('btn-open-sidebar'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    appLangBtn: document.getElementById('app-lang-btn'),
    btnLock: document.getElementById('btn-lock'),
    btnNewNote: document.getElementById('btn-new-note'),
    btnEmptyNew: document.getElementById('btn-empty-new'),
    folderNav: document.getElementById('folder-nav'),
    searchInput: document.getElementById('search-input'),
    activeFolderTitle: document.getElementById('active-folder-title'),
    notesCount: document.getElementById('notes-count'),
    notesList: document.getElementById('notes-list'),

    editorEmpty: document.getElementById('editor-empty'),
    editorWrap: document.getElementById('editor-wrap'),
    noteFolderSelect: document.getElementById('note-folder-select'),
    noteClassInput: document.getElementById('note-class-input'),
    btnPin: document.getElementById('btn-pin'),
    btnChecklist: document.getElementById('btn-checklist'),
    btnShare: document.getElementById('btn-share'),
    btnPrint: document.getElementById('btn-print'),
    btnExportTxt: document.getElementById('btn-export-txt'),
    btnDelete: document.getElementById('btn-delete'),
    noteUpdated: document.getElementById('note-updated'),
    noteWords: document.getElementById('note-words'),
    noteTitle: document.getElementById('note-title'),
    noteBody: document.getElementById('note-body'),

    btnBackup: document.getElementById('btn-backup'),
    btnRestore: document.getElementById('btn-restore'),
    restoreInput: document.getElementById('restore-input'),
    toast: document.getElementById('toast'),
  };

  let toastTimer = null;

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  async function sha256Hex(str) {
    const data = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function generatePersonalCode(email) {
    const norm = String(email || '').trim().toLowerCase();
    const idHash = await sha256Hex(`ID:${norm}:${CODE_SIGN_SALT}`);
    const part1 = idHash.slice(0, 4).toUpperCase();
    const sigHash = await sha256Hex(`SIG:${part1}:${CODE_SIGN_SALT}`);
    const part2 = sigHash.slice(0, 4).toUpperCase();
    return `CG-${part1}-${part2}`;
  }

  async function isValidAccessCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) return false;
    const hash = await sha256Hex(code);
    if (VALID_CODE_HASHES.has(hash)) return true;

    const m = code.match(/^CG-([0-9A-F]{4})-([0-9A-F]{4})$/);
    if (!m) return false;
    const expected = (await sha256Hex(`SIG:${m[1]}:${CODE_SIGN_SALT}`)).slice(0, 4).toUpperCase();
    return m[2] === expected;
  }

  function applyTeacherProfile() {
    const sub = document.querySelector('#app-shell .brand-sub');
    if (!sub) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_PROFILE) || 'null');
      if (saved && saved.name) {
        sub.textContent = saved.school ? `${saved.name} · ${saved.school}` : saved.name;
      }
    } catch (_err) {
      // keep default subtitle
    }
  }

  function applyLanguage() {
    const dict = I18N[state.lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    const toggleLabel = state.lang === 'en' ? 'BM' : 'EN';
    if (els.gateLangBtn) els.gateLangBtn.textContent = toggleLabel;
    if (els.appLangBtn) els.appLangBtn.textContent = toggleLabel;
    renderFolders();
    renderNotesList();
  }

  function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'bm' : 'en';
    localStorage.setItem(STORAGE_LANG, state.lang);
    applyLanguage();
  }

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_NOTES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          state.notes = parsed;
          state.activeId = parsed[0].id;
          return;
        }
      }
    } catch (_err) {
      // ignore corrupted storage
    }

    // Starter welcome note for first-time teacher
    const starter = TEMPLATES.rph();
    const firstNote = {
      id: `note-${Date.now()}`,
      folder: starter.folder,
      className: '4 Bestari · Sains',
      title: 'Selamat Datang ke CikguNote (Sample RPH)',
      body:
        'Tip ringkas untuk Cikgu:\n' +
        '- [x] Semua nota disimpan secara automatik & 100% peribadi di peranti ini.\n' +
        '- [ ] Klik Templat Pantas di sebelah kiri untuk jana RPH, PBD, atau Minit Mesyuarat.\n' +
        '- [ ] Klik "Print / PDF" untuk cetak terus dalam format A4 yang kemas.\n' +
        '- [ ] Klik "Share Link" untuk kongsi satu nota sahaja melalui WhatsApp.\n\n' +
        starter.body,
      pinned: true,
      updatedAt: new Date().toISOString(),
    };
    state.notes = [firstNote];
    state.activeId = firstNote.id;
    saveNotes();
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_NOTES, JSON.stringify(state.notes));
  }

  function getActiveNote() {
    return state.notes.find((n) => n.id === state.activeId) || null;
  }

  function formatShortDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
    } catch (_err) {
      return '';
    }
  }

  function renderFolders() {
    const dict = I18N[state.lang].folders;
    const keys = ['all', 'rph', 'exam', 'student', 'meeting', 'scratch'];
    els.folderNav.innerHTML = '';

    for (const key of keys) {
      const count = key === 'all' ? state.notes.length : state.notes.filter((n) => n.folder === key).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `folder-btn${state.folder === key ? ' active' : ''}`;
      btn.innerHTML = `<span>${dict[key]}</span><span class="folder-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.folder = key;
        els.sidebar.classList.remove('open');
        renderFolders();
        renderNotesList();
      });
      els.folderNav.appendChild(btn);
    }
    els.activeFolderTitle.textContent = dict[state.folder] || dict.all;
  }

  function getFilteredNotes() {
    const q = state.search.trim().toLowerCase();
    return state.notes
      .filter((n) => {
        if (state.folder !== 'all' && n.folder !== state.folder) return false;
        if (!q) return true;
        return (
          (n.title || '').toLowerCase().includes(q) ||
          (n.body || '').toLowerCase().includes(q) ||
          (n.className || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }

  function renderNotesList() {
    const list = getFilteredNotes();
    const dict = I18N[state.lang].folders;
    els.notesCount.textContent = String(list.length);
    els.notesList.innerHTML = '';

    if (!list.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.style.padding = '16px';
      empty.style.textAlign = 'center';
      empty.textContent = state.lang === 'bm' ? 'Tiada nota dijumpai.' : 'No notes found.';
      els.notesList.appendChild(empty);
      return;
    }

    for (const note of list) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `note-item${note.id === state.activeId ? ' active' : ''}`;

      const top = document.createElement('div');
      top.className = 'note-item-top';

      const titleEl = document.createElement('span');
      titleEl.className = 'note-item-title';
      titleEl.textContent = note.title || (state.lang === 'bm' ? 'Tanpa Tajuk' : 'Untitled Note');
      top.appendChild(titleEl);

      if (note.pinned) {
        const pin = document.createElement('span');
        pin.className = 'pin-badge';
        pin.textContent = '★';
        top.appendChild(pin);
      }

      const preview = document.createElement('p');
      preview.className = 'note-item-preview';
      preview.textContent = (note.body || '').replace(/\s+/g, ' ').trim() || '—';

      const meta = document.createElement('div');
      meta.className = 'note-item-meta';

      const tag = document.createElement('span');
      tag.className = 'tag-pill';
      tag.textContent = note.className || dict[note.folder] || note.folder;

      const dt = document.createElement('span');
      dt.textContent = formatShortDate(note.updatedAt);

      meta.appendChild(tag);
      meta.appendChild(dt);

      btn.appendChild(top);
      btn.appendChild(preview);
      btn.appendChild(meta);

      btn.addEventListener('click', () => {
        state.activeId = note.id;
        renderNotesList();
        renderEditor();
      });

      els.notesList.appendChild(btn);
    }
  }

  function updateWordCount(text) {
    const words = (text || '').trim() ? (text || '').trim().split(/\s+/).length : 0;
    els.noteWords.textContent = state.lang === 'bm' ? `${words} patah perkataan` : `${words} words`;
  }

  function renderEditor() {
    const note = getActiveNote();
    if (!note) {
      els.editorEmpty.hidden = false;
      els.editorWrap.hidden = true;
      return;
    }
    els.editorEmpty.hidden = true;
    els.editorWrap.hidden = false;

    els.noteFolderSelect.value = note.folder || 'rph';
    els.noteClassInput.value = note.className || '';
    els.noteTitle.value = note.title || '';
    els.noteBody.value = note.body || '';
    els.btnPin.classList.toggle('pinned', Boolean(note.pinned));
    els.btnPin.textContent = note.pinned ? '★ Pinned' : 'Pin';
    els.noteUpdated.textContent =
      (state.lang === 'bm' ? 'Disimpan · ' : 'Saved · ') +
      new Date(note.updatedAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    updateWordCount(note.body);
  }

  function createNote(preset) {
    const folder = preset ? preset.folder : state.folder === 'all' ? 'rph' : state.folder;
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      folder,
      className: preset ? preset.className : '',
      title: preset ? preset.title : '',
      body: preset ? preset.body : '',
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    state.notes.unshift(note);
    state.activeId = note.id;
    if (state.folder !== 'all' && state.folder !== note.folder) {
      state.folder = note.folder;
    }
    saveNotes();
    renderFolders();
    renderNotesList();
    renderEditor();
    els.sidebar.classList.remove('open');
    els.noteTitle.focus();
  }

  function updateActiveNote(patch) {
    const note = getActiveNote();
    if (!note) return;
    Object.assign(note, patch, { updatedAt: new Date().toISOString() });
    saveNotes();
    renderFolders();
    renderNotesList();
    els.noteUpdated.textContent =
      (state.lang === 'bm' ? 'Disimpan · ' : 'Saved · ') +
      new Date(note.updatedAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    updateWordCount(note.body);
  }

  function encodeShareNote(note) {
    const payload = JSON.stringify({
      t: note.title || 'Untitled Note',
      f: note.className || note.folder,
      d: formatShortDate(note.updatedAt),
      b: note.body || '',
    });
    const bytes = new TextEncoder().encode(payload);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeShareNote(hashStr) {
    const b64 = hashStr.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function checkShareHash() {
    const hash = window.location.hash || '';
    if (!hash.startsWith('#share=')) return false;
    try {
      const data = decodeShareNote(hash.slice(7));
      els.shareTitle.textContent = data.t || 'Shared Note';
      els.shareFolder.textContent = data.f || 'CikguNote';
      els.shareDate.textContent = data.d || '';
      els.shareBody.textContent = data.b || '';
      els.shareView.hidden = false;
      els.gateScreen.hidden = true;
      els.appShell.hidden = true;
      return true;
    } catch (_err) {
      return false;
    }
  }

  function openWorkspace() {
    els.gateScreen.hidden = true;
    els.appShell.hidden = false;
    loadNotes();
    applyLanguage();
    applyTeacherProfile();
    renderEditor();
  }

  function switchGateTab(mode) {
    const isReg = mode === 'register';
    els.tabUnlock.classList.toggle('active', !isReg);
    els.tabRegister.classList.toggle('active', isReg);
    els.tabUnlock.setAttribute('aria-selected', String(!isReg));
    els.tabRegister.setAttribute('aria-selected', String(isReg));
    els.gateForm.hidden = isReg;
    els.registerForm.hidden = !isReg;
    els.regResult.hidden = true;
    els.gateError.hidden = true;
    els.regError.hidden = true;
  }

  function showGate() {
    els.appShell.hidden = true;
    els.gateScreen.hidden = false;
    applyLanguage();
    switchGateTab('unlock');
    els.codeInput.value = '';
    els.codeInput.focus();
  }

  // Event Listeners
  els.gateLangBtn.addEventListener('click', toggleLanguage);
  els.appLangBtn.addEventListener('click', toggleLanguage);
  els.tabUnlock.addEventListener('click', () => switchGateTab('unlock'));
  els.tabRegister.addEventListener('click', () => switchGateTab('register'));

  els.gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = (els.codeInput.value || '').trim().toUpperCase();
    if (!raw) return;
    try {
      const ok = await isValidAccessCode(raw);
      if (ok) {
        localStorage.setItem(STORAGE_AUTH, raw);
        els.gateError.hidden = true;
        openWorkspace();
        showToast(state.lang === 'bm' ? 'Selamat datang, Cikgu!' : 'Welcome back, Cikgu!');
      } else {
        els.gateError.textContent = I18N[state.lang].gate_invalid;
        els.gateError.hidden = false;
      }
    } catch (_err) {
      els.gateError.textContent = 'Browser crypto unavailable. Please open via HTTPS.';
      els.gateError.hidden = false;
    }
  });

  let pendingGeneratedCode = '';

  els.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (els.regName.value || '').trim();
    const school = (els.regSchool.value || '').trim();
    const email = (els.regEmail.value || '').trim().toLowerCase();
    if (!name || !school || !email.includes('@')) {
      els.regError.textContent = state.lang === 'bm'
        ? 'Sila lengkapkan nama, sekolah, dan emel yang sah.'
        : 'Please enter your name, school, and a valid email.';
      els.regError.hidden = false;
      return;
    }
    els.regError.hidden = true;
    pendingGeneratedCode = await generatePersonalCode(email);
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify({ name, school, email }));
    localStorage.setItem(STORAGE_AUTH, pendingGeneratedCode);
    els.regGeneratedCode.textContent = pendingGeneratedCode;
    els.registerForm.hidden = true;
    els.regResult.hidden = false;
  });

  els.btnCopyCode.addEventListener('click', async () => {
    if (!pendingGeneratedCode) return;
    try {
      await navigator.clipboard.writeText(pendingGeneratedCode);
      showToast(state.lang === 'bm' ? 'Kod disalin!' : 'Code copied!');
    } catch (_err) {
      window.prompt('Copy your personal code:', pendingGeneratedCode);
    }
  });

  els.btnEnterNow.addEventListener('click', () => {
    openWorkspace();
    showToast(state.lang === 'bm' ? 'Selamat datang ke CikguNote!' : 'Welcome to CikguNote!');
  });

  els.btnLock.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_AUTH);
    showGate();
    showToast(state.lang === 'bm' ? 'Meja nota dikunci.' : 'Desk locked.');
  });

  els.btnOpenSidebar.addEventListener('click', () => els.sidebar.classList.add('open'));
  els.btnCloseSidebar.addEventListener('click', () => els.sidebar.classList.remove('open'));

  els.btnNewNote.addEventListener('click', () => createNote(null));
  els.btnEmptyNew.addEventListener('click', () => createNote(null));

  document.querySelectorAll('[data-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-template');
      if (TEMPLATES[key]) {
        createNote(TEMPLATES[key]());
        showToast(state.lang === 'bm' ? 'Templat dimuatkan!' : 'Template ready!');
      }
    });
  });

  els.searchInput.addEventListener('input', () => {
    state.search = els.searchInput.value;
    renderNotesList();
  });

  els.noteTitle.addEventListener('input', () => updateActiveNote({ title: els.noteTitle.value }));
  els.noteBody.addEventListener('input', () => updateActiveNote({ body: els.noteBody.value }));
  els.noteClassInput.addEventListener('input', () => updateActiveNote({ className: els.noteClassInput.value }));
  els.noteFolderSelect.addEventListener('change', () => updateActiveNote({ folder: els.noteFolderSelect.value }));

  els.btnPin.addEventListener('click', () => {
    const note = getActiveNote();
    if (!note) return;
    updateActiveNote({ pinned: !note.pinned });
    renderEditor();
  });

  els.btnChecklist.addEventListener('click', () => {
    const el = els.noteBody;
    const start = el.selectionStart || el.value.length;
    const prefix = start > 0 && el.value[start - 1] !== '\n' ? '\n- [ ] ' : '- [ ] ';
    el.value = el.value.slice(0, start) + prefix + el.value.slice(el.selectionEnd || start);
    el.focus();
    el.selectionStart = el.selectionEnd = start + prefix.length;
    updateActiveNote({ body: el.value });
  });

  els.btnShare.addEventListener('click', async () => {
    const note = getActiveNote();
    if (!note) return;
    const encoded = encodeShareNote(note);
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    if (shareUrl.length > 6000) {
      showToast('Note is too long for a URL link — use Export instead.');
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(state.lang === 'bm' ? 'Pautan kongsi disalin!' : 'Read-only share link copied!');
    } catch (_err) {
      window.prompt('Copy share link:', shareUrl);
    }
  });

  els.btnPrint.addEventListener('click', () => window.print());
  if (els.btnSharePrint) els.btnSharePrint.addEventListener('click', () => window.print());

  els.btnExportTxt.addEventListener('click', () => {
    const note = getActiveNote();
    if (!note) return;
    const content = `# ${note.title || 'Untitled'}\n${note.className ? `Class: ${note.className}\n` : ''}\n${note.body || ''}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(note.title || 'cikgunote').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(state.lang === 'bm' ? 'Fail nota dimuat turun.' : 'Note exported as .txt');
  });

  els.btnDelete.addEventListener('click', () => {
    const note = getActiveNote();
    if (!note) return;
    const ok = window.confirm(state.lang === 'bm' ? 'Padam nota ini?' : 'Delete this note?');
    if (!ok) return;
    state.notes = state.notes.filter((n) => n.id !== note.id);
    state.activeId = state.notes[0] ? state.notes[0].id : null;
    saveNotes();
    renderFolders();
    renderNotesList();
    renderEditor();
    showToast(state.lang === 'bm' ? 'Nota dipadam.' : 'Note deleted.');
  });

  els.btnBackup.addEventListener('click', () => {
    const payload = JSON.stringify({ app: 'CikguNote', exportedAt: new Date().toISOString(), notes: state.notes }, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cikgunote-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(state.lang === 'bm' ? 'Sandaran JSON dimuat turun.' : 'Backup JSON downloaded.');
  });

  els.btnRestore.addEventListener('click', () => els.restoreInput.click());
  els.restoreInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target.result || ''));
        const incoming = Array.isArray(parsed) ? parsed : parsed.notes;
        if (!Array.isArray(incoming)) throw new Error('Invalid backup file');
        state.notes = incoming;
        state.activeId = incoming[0] ? incoming[0].id : null;
        saveNotes();
        renderFolders();
        renderNotesList();
        renderEditor();
        showToast(state.lang === 'bm' ? `Dipulihkan: ${incoming.length} nota.` : `Restored ${incoming.length} notes.`);
      } catch (_err) {
        showToast('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    els.restoreInput.value = '';
  });

  // Boot
  (async function boot() {
    if (checkShareHash()) return;
    const savedAuth = localStorage.getItem(STORAGE_AUTH);
    if (savedAuth && (VALID_CODE_HASHES.has(savedAuth) || (await isValidAccessCode(savedAuth)))) {
      openWorkspace();
    } else {
      showGate();
    }
  })();
})();
