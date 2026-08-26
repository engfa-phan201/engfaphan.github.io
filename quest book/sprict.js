(function () {
  /* NGÔN NGỮ (VI / EN) */
  const LANG = {
    vi: {
      label: "✦ Sổ Nhận Xét Giảng Viên",
      draw: "✏ Vẽ",
      type: "⌨ Gõ",
      pen: "✏ Bút",
      eraser: "⬜ Tẩy",
      save: "Lưu",
      clear: "Xóa",
      translate: "🌐 Dịch",
      prev: "‹ Trước",
      next: "Tiếp ›",
      newpage: "+ Trang mới",
      sigLabel: "Chữ ký giảng viên",
      sigOpen: "+ Thêm chữ ký",
      sigClose: "− Ẩn chữ ký",
      sigClear: "Xóa",
      saved: "✓ Đã lưu",
      chars: "ký tự",
      go: "Đi",
      pageof: "/",
      placeholder:
        "Bắt đầu nhập ghi chú, nhận xét...\n\nChuyển sang chế độ Vẽ để viết tay.",
      translating: "⏳ Đang dịch...",
      transLang: "TIẾNG ANH",
    },
    en: {
      label: "✦ Lecturer's Feedback Book",
      draw: "✏ Draw",
      type: "⌨ Type",
      pen: "✏ Pen",
      eraser: "⬜ Eraser",
      save: "Save",
      clear: "Clear",
      translate: "🌐 Translate",
      prev: "‹ Prev",
      next: "Next ›",
      newpage: "+ New page",
      sigLabel: "Lecturer Signature",
      sigOpen: "+ Add Signature",
      sigClose: "− Hide",
      sigClear: "Clear",
      saved: "✓ Saved",
      chars: "characters",
      go: "Go",
      pageof: "of",
      placeholder:
        "Start typing notes, feedback, remarks...\n\nSwitch to Draw mode for handwriting.",
      translating: "⏳ Translating...",
      transLang: "ENGLISH",
    },
  };

  let lang = "vi"; // ngôn ngữ mặc định

  /* ELEMENTS */
  const canvas = document.getElementById("draw-canvas");
  const ctx = canvas.getContext("2d");
  const drawWrap = document.getElementById("drawWrap");
  const typeWrap = document.getElementById("typeWrap");
  const typeArea = document.getElementById("typeArea");
  const charCount = document.getElementById("charCount");
  const toolbarDraw = document.getElementById("toolbarDraw");
  const toolbarType = document.getElementById("toolbarType");
  const scv = document.getElementById("sig-canvas");
  const sctx = scv.getContext("2d");

  /* STATE — 50 trang*/
  const MAX_PAGES = 50;
  let pages = Array.from({ length: MAX_PAGES }, () => ({
    canvas: null,
    text: "",
    mode: "draw",
    sig: null,
    sigOpen: false,
  }));
  let cur = 0;
  let drawing = false;
  let sigDrawing = false;
  let tool = "pen";
  let inkColor = "#1a1a1a";
  let inkSize = 2;
  let currentMode = "draw";

  /*  CANVAS RESIZE*/
  function resizeCanvas() {
    const w = drawWrap.offsetWidth || 600;
    const h = Math.max(280, Math.round(w * 0.48));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    buildRuledLines(h);

    if (pages[cur] && pages[cur].canvas) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = pages[cur].canvas;
    }
  }

  function resizeSig() {
    const w = scv.parentElement.offsetWidth || 500;
    const dpr = window.devicePixelRatio || 1;

    scv.width = w * dpr;
    scv.height = 80 * dpr;
    scv.style.width = w + "px";
    scv.style.height = "80px";
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (pages[cur] && pages[cur].sig) {
      const img = new Image();
      img.onload = () => sctx.drawImage(img, 0, 0, w, 80);
      img.src = pages[cur].sig;
    }
  }

  window.addEventListener("resize", () => {
    saveCurrentCanvas();
    resizeCanvas();
    resizeSig();
  });

  /* RULED LINES*/
  function buildRuledLines(canvasH) {
    const container = document.getElementById("ruledLines");
    container.innerHTML = "";
    container.style.height = canvasH + "px";
    const spacing = 24;
    for (let y = spacing; y < canvasH; y += spacing) {
      const line = document.createElement("div");
      line.className = "ruled-line";
      line.style.top = y + "px";
      container.appendChild(line);
    }
  }

  /* SAVE / LOAD CANVAS*/
  function saveCurrentCanvas() {
    pages[cur].canvas = canvas.toDataURL();
    pages[cur].sig = scv.toDataURL();
    pages[cur].text = typeArea.value;
  }

  function loadCanvas(idx) {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    if (pages[idx] && pages[idx].canvas) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = pages[idx].canvas;
    }
    const sw = scv.offsetWidth;
    sctx.clearRect(0, 0, sw, 80);
    if (pages[idx] && pages[idx].sig) {
      const img = new Image();
      img.onload = () => sctx.drawImage(img, 0, 0, sw, 80);
      img.src = pages[idx].sig;
    }
  }

  /* SWITCH MODE*/
  function switchMode(mode) {
    currentMode = mode;
    pages[cur].mode = mode;

    document
      .getElementById("btnDraw")
      .classList.toggle("active", mode === "draw");
    document
      .getElementById("btnType")
      .classList.toggle("active", mode === "type");

    if (mode === "draw") {
      drawWrap.classList.remove("hidden");
      typeWrap.classList.remove("active");
      toolbarDraw.style.display = "";
      toolbarType.style.display = "none";
    } else {
      drawWrap.classList.add("hidden");
      typeWrap.classList.add("active");
      toolbarDraw.style.display = "none";
      toolbarType.style.display = "";
      typeArea.focus();
    }
  }

  /* CHAR COUNT*/
  function updateCharCount() {
    const L = LANG[lang];
    charCount.textContent = (typeArea.value || "").length + " " + L.chars;
  }

  /* DRAW  */
  function getPos(e, target) {
    const rect = target.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDraw(e) {
    drawing = true;
    const p = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.preventDefault();
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e, canvas);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = inkSize * 8;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = inkSize;
      ctx.strokeStyle = inkColor;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function endDraw() {
    drawing = false;
    ctx.beginPath();
    ctx.globalCompositeOperation = "source-over";
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  /* SIGNATURE */
  function startSig(e) {
    sigDrawing = true;
    const p = getPos(e, scv);
    sctx.beginPath();
    sctx.moveTo(p.x, p.y);
    e.preventDefault();
  }

  function drawSig(e) {
    if (!sigDrawing) return;
    e.preventDefault();
    const p = getPos(e, scv);
    sctx.lineWidth = 1.5;
    sctx.lineCap = "round";
    sctx.lineJoin = "round";
    sctx.strokeStyle = "#1a1a1a";
    sctx.globalCompositeOperation = "source-over";
    sctx.lineTo(p.x, p.y);
    sctx.stroke();
    sctx.beginPath();
    sctx.moveTo(p.x, p.y);
  }

  function endSig() {
    sigDrawing = false;
    sctx.beginPath();
  }

  scv.addEventListener("mousedown", startSig);
  scv.addEventListener("mousemove", drawSig);
  scv.addEventListener("mouseup", endSig);
  scv.addEventListener("mouseleave", endSig);
  scv.addEventListener("touchstart", startSig, { passive: false });
  scv.addEventListener("touchmove", drawSig, { passive: false });
  scv.addEventListener("touchend", endSig);

  /* toggle ô ký tên */
  document.getElementById("sigToggle").addEventListener("click", function () {
    const wrap = document.getElementById("sigWrap");
    const open = !wrap.classList.contains("open");
    wrap.classList.toggle("open", open);
    pages[cur].sigOpen = open;
    if (open) resizeSig();
    this.textContent = open ? LANG[lang].sigClose : LANG[lang].sigOpen;
  });

  /* xóa chữ ký */
  document.getElementById("sigClearBtn").addEventListener("click", () => {
    sctx.clearRect(0, 0, scv.offsetWidth, 80);
    pages[cur].sig = null;
  });

  /* MODE BUTTONS */
  document.getElementById("btnDraw").addEventListener("click", () => {
    saveCurrentCanvas();
    switchMode("draw");
  });
  document.getElementById("btnType").addEventListener("click", () => {
    saveCurrentCanvas();
    switchMode("type");
  });
  typeArea.addEventListener("input", () => {
    pages[cur].text = typeArea.value;
    updateCharCount();
  });

  /* PEN / ERAE*/
  document.getElementById("penBtn").addEventListener("click", function () {
    tool = "pen";
    this.classList.add("active");
    document.getElementById("eraserBtn").classList.remove("active");
  });

  document.getElementById("eraserBtn").addEventListener("click", function () {
    tool = "eraser";
    this.classList.add("active");
    document.getElementById("penBtn").classList.remove("active");
  });

  /*  COLORS*/
  document.getElementById("colorGroup").addEventListener("click", function (e) {
    const dot = e.target.closest(".color-dot");
    if (!dot) return;
    document
      .querySelectorAll(".color-dot")
      .forEach((d) => d.classList.remove("active"));
    dot.classList.add("active");
    inkColor = dot.dataset.color;
    tool = "pen";
    document.getElementById("penBtn").classList.add("active");
    document.getElementById("eraserBtn").classList.remove("active");
  });

  /*SIZES*/
  document.getElementById("sizeGroup").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-size]");
    if (!btn) return;
    document
      .querySelectorAll("[data-size]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    inkSize = parseInt(btn.dataset.size);
  });

  /* BOLD / ITALIC / FONT SIZE */
  document.getElementById("boldBtn").addEventListener("click", function () {
    this.classList.toggle("active");
    typeArea.style.fontWeight = this.classList.contains("active")
      ? "700"
      : "300";
  });

  document.getElementById("italicBtn").addEventListener("click", function () {
    this.classList.toggle("active");
    typeArea.style.fontStyle = this.classList.contains("active")
      ? "italic"
      : "normal";
  });

  document
    .getElementById("fontSizeGroup")
    .addEventListener("click", function (e) {
      const btn = e.target.closest("[data-fs]");
      if (!btn) return;
      document
        .querySelectorAll("[data-fs]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      typeArea.style.fontSize = btn.dataset.fs + "px";
    });

  /*TRANSLATE*/
  document
    .getElementById("translateBtn")
    .addEventListener("click", async function () {
      const text = typeArea.value.trim();
      if (!text) return;

      const L = LANG[lang];
      const targetLang = lang === "vi" ? "en" : "vi";
      const langPair = lang === "vi" ? "vi|en" : "en|vi";

      this.textContent = L.translating;
      this.disabled = true;

      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
        const res = await fetch(url);
        const data = await res.json();
        const result = data.responseData.translatedText;

        document.getElementById("translateResult").textContent = result;
        document.getElementById("translateLang").textContent =
          lang === "vi" ? "ENGLISH" : "TIẾNG VIỆT";
        document.getElementById("translateBox").style.display = "block";
      } catch (err) {
        alert("Lỗi dịch: " + err.message);
      } finally {
        this.textContent = LANG[lang].translate;
        this.disabled = false;
      }
    });

  document.getElementById("translateClose").addEventListener("click", () => {
    document.getElementById("translateBox").style.display = "none";
  });

  /* SAVE / CLEAR*/
  function showBadge(id) {
    const badge = document.getElementById(id);
    badge.classList.add("show");
    setTimeout(() => badge.classList.remove("show"), 2000);
  }

  function saveToStorage() {
    try {
      const store = {
        pages: pages.map((p) => ({
          canvas: p.canvas || null,
          text: p.text || "",
          mode: p.mode || "draw",
          sig: p.sig || null,
          sigOpen: p.sigOpen || false,
        })),
      };
      localStorage.setItem("portfolio-book", JSON.stringify(store));
    } catch (err) {
      console.warn("Lỗi lưu storage:", err);
    }
  }

  function doSave() {
    saveCurrentCanvas();
    saveToStorage();
    showBadge(currentMode === "type" ? "savedBadge2" : "savedBadge1");
  }

  function doClear() {
    if (currentMode === "draw") {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      pages[cur].canvas = null;
    } else {
      typeArea.value = "";
      pages[cur].text = "";
      updateCharCount();
    }
  }

  document.getElementById("saveBtn1").addEventListener("click", doSave);
  document.getElementById("saveBtn2").addEventListener("click", doSave);
  document.getElementById("clearBtn1").addEventListener("click", doClear);
  document.getElementById("clearBtn2").addEventListener("click", doClear);

  /*  PAGE NAVIGATION + FLIP ANIMATION */
  function flipAnimate(dir) {
    const nb = document.getElementById("notebook");
    nb.classList.remove("flip-left", "flip-right");
    void nb.offsetWidth; // reflow để reset animation
    nb.classList.add(dir === "next" ? "flip-left" : "flip-right");
    setTimeout(() => nb.classList.remove("flip-left", "flip-right"), 460);
  }

  function updateNavUI() {
    const L = LANG[lang];
    document.getElementById("pageNum").textContent =
      "Page " + String(cur + 1).padStart(2, "0");
    document.getElementById("pageInd").textContent =
      "Page " + (cur + 1) + " " + L.pageof + " " + pages.length;
    document.getElementById("pageInput").value = cur + 1;
    document.getElementById("pageInput").max = pages.length;
    document.getElementById("prevBtn").disabled = cur === 0;
    document.getElementById("nextBtn").disabled = cur === pages.length - 1;
    document.getElementById("prevBtn").textContent = L.prev;
    document.getElementById("nextBtn").textContent = L.next;
    document.getElementById("addPageBtn").textContent = L.newpage;
    document.getElementById("pageGo").textContent = L.go;
  }

  function goToPage(idx) {
    if (idx < 0 || idx >= pages.length) return;
    const dir = idx > cur ? "next" : "prev";

    saveCurrentCanvas();
    flipAnimate(dir);

    setTimeout(() => {
      cur = idx;
      const p = pages[cur];

      // load sig open state
      const sigWrap = document.getElementById("sigWrap");
      sigWrap.classList.toggle("open", !!p.sigOpen);
      document.getElementById("sigToggle").textContent = p.sigOpen
        ? LANG[lang].sigClose
        : LANG[lang].sigOpen;

      switchMode(p.mode || "draw");
      loadCanvas(cur);
      typeArea.value = p.text || "";
      updateCharCount();
      updateNavUI();
    }, 230);
  }

  document
    .getElementById("prevBtn")
    .addEventListener("click", () => goToPage(cur - 1));
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => goToPage(cur + 1));
  document.getElementById("addPageBtn").addEventListener("click", () => {
    if (pages.length >= MAX_PAGES) return;
    saveCurrentCanvas();
    pages.push({
      canvas: null,
      text: "",
      mode: "draw",
      sig: null,
      sigOpen: false,
    });
    goToPage(pages.length - 1);
  });

  document.getElementById("pageGo").addEventListener("click", jumpPage);
  document.getElementById("pageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") jumpPage();
  });

  function jumpPage() {
    let v = parseInt(document.getElementById("pageInput").value);
    if (isNaN(v) || v < 1) v = 1;
    if (v > pages.length) v = pages.length;
    goToPage(v - 1);
  }

  /*LANGUAGE TOGGLE*/
  function applyLang() {
    const L = LANG[lang];
    document.getElementById("lbLabel").textContent = L.label;
    document.getElementById("btnDraw").textContent = L.draw;
    document.getElementById("btnType").textContent = L.type;
    document.getElementById("penBtn").textContent = L.pen;
    document.getElementById("eraserBtn").textContent = L.eraser;
    document.getElementById("sigLabel").textContent = L.sigLabel;
    document.getElementById("sigClearBtn").textContent = L.sigClear;
    const tb = document.getElementById("translateBtn");
    tb.querySelector(".btn-text")
      ? (tb.querySelector(".btn-text").textContent = L.translate)
      : (tb.textContent = L.translate);
    document.getElementById("savedBadge1").textContent = L.saved;
    document.getElementById("savedBadge2").textContent = L.saved;
    document.getElementById("typeArea").placeholder = L.placeholder;

    // save buttons
    document
      .querySelectorAll(".action-btn.save .btn-text")
      .forEach((el) => (el.textContent = L.save));
    document
      .querySelectorAll(".action-btn.clear .btn-text")
      .forEach((el) => (el.textContent = L.clear));

    // sig toggle
    const sigOpen = document
      .getElementById("sigWrap")
      .classList.contains("open");
    document.getElementById("sigToggle").textContent = sigOpen
      ? L.sigClose
      : L.sigOpen;

    document.getElementById("lbVI").classList.toggle("active", lang === "vi");
    document.getElementById("lbEN").classList.toggle("active", lang === "en");

    updateNavUI();
    updateCharCount();
  }

  document.getElementById("lbVI").addEventListener("click", () => {
    lang = "vi";
    applyLang();
  });
  document.getElementById("lbEN").addEventListener("click", () => {
    lang = "en";
    applyLang();
  });

  /* LOAD FROM STORAGE*/
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem("portfolio-book");
      if (!raw) return;
      const store = JSON.parse(raw);
      if (store.pages && store.pages.length > 0) {
        // merge — giữ MAX_PAGES, ghép data đã lưu vào
        store.pages.forEach((p, i) => {
          if (i < MAX_PAGES) pages[i] = p;
        });
        cur = 0;
        const p = pages[0];
        const sigWrap = document.getElementById("sigWrap");
        sigWrap.classList.toggle("open", !!p.sigOpen);
        switchMode(p.mode || "draw");
        loadCanvas(0);
        typeArea.value = p.text || "";
        updateCharCount();
      }
    } catch (err) {
      console.warn("Lỗi đọc storage:", err);
    }
  }

  /* INIT */
  document.getElementById("pageDate").textContent =
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  resizeCanvas();
  resizeSig();
  loadFromStorage();
  applyLang();

  function buildPagePanel() {
    const inner = document.getElementById("pagePanelInner");
    inner.innerHTML = "";
    for (let i = 1; i <= pages.length; i++) {
      const chip = document.createElement("div");
      chip.className = "pg-chip";
      chip.textContent = i;
      chip.dataset.idx = i - 1;
      chip.title = "trang" + i;
      inner.appendChild(chip);
    }
    refreshPanelChips();
  }
  function refreshPanelChips() {
    document.querySelectorAll(".pg-chip").forEach((chip) => {
      const idx = parseInt(chip.dataset.idx);
      const p = pages[idx];
      const hasContent = p && (p.canvas || p.text);
      chip.classList.toggle("current", idx === cur);
      chip.classList.toggle("has-content", !!hasContent && idx !== cur);
    });
  }
  let panelOpen = false;
  function togglePagePanel() {
    panelOpen = !panelOpen;
    document.getElementById("pagePanel").classList.toggle("open", panelOpen);
    document
      .getElementById("panelToggleIcon")
      .classList.toggle("open", panelOpen);
    document.getElementById("panelToggleLabel").textContent = panelOpen
      ? "Close the list"
      : "Page list";
  }
  document
    .getElementById("panelPageInner")
    .addEventListener("click", function (e) {
      const chip = e.target.closest(".pg-chip");
      if (!chip) return;
      const idx = panelInt(chip.dataset.idx);
      if (idx === cur) {
        togglePagePanel();
        return;
      }
      goToPage(idx);
      togglePagePanel();
    });
  document
    .getElementById("panelToggleBtn")
    .addEventListener("click", togglePagePanel);
  buildPagePanel();
})();
