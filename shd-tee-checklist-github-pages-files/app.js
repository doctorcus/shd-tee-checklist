const procedures = [
  { id: "mteer", name: "MR / 僧帽弁TEER", short: "MR" }
];

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

const checklist = [
  {
    title: "共通: 画像品質と安全確認",
    stage: "pre",
    items: [
      ["common", "TEE適応・禁忌・鎮静/麻酔計画", "食道疾患、出血リスク、抗凝固、気道・循環リスクを確認。"],
      ["common", "ベースライン包括TEE", "ME/TG/大動脈ビューを系統的に取得し、左右心機能、弁膜症、心嚢液、大動脈病変を把握。"],
      ["common", "3D画像の準備", "必要手技で3D zoom、multiplanar reconstruction、en face表示がすぐ出せる設定にする。"],
      ["common", "血栓・疣贅・デバイス干渉の除外", "LA/LAA、弁、カテーテル経路、既存デバイス周囲を確認。"]
    ]
  },
  {
    title: "MR / 僧帽弁TEER: 術前評価",
    stage: "pre",
    items: [
      ["mteer", "MR機序と標的segment", "一次性/二次性、A/P scallop、flail/prolapse/tethering、jet数と方向を同定。"],
      ["mteer", "接合条件", "coaptation length/depth、flail gap/width、leaflet長、石灰化、cleft、弁口面積、前後径、左右径を確認。"],
      ["mteer", "経中隔穿刺計画", "後上方穿刺の高さ、IAS形態、既存PFO/ASD、LAサイズを確認。"],
      ["mteer", "除外・注意所見", "LAA/LA血栓、活動性感染、リウマチ性変化、高度MSリスクを確認。"]
    ]
  },
  {
    title: "術中: ナビゲーション",
    stage: "intra",
    items: [
      ["common", "カテーテル/ワイヤ位置", "RA/LA/LV内での位置を透視と同期して確認。"],
      ["common", "経中隔穿刺", "tenting位置、高さ、前後方向、穿刺後の心嚢液増加を確認。"],
      ["mteer", "clip grasping評価", "leaflet insertion、MR低減、mean gradient、弁口面積、SLDAリスクを確認。"],
      ["mteer", "clip追加判断", "残存MR、弁口面積、平均圧較差、jet位置を確認して追加clipの可否を判断。"]
    ]
  },
  {
    title: "終了前: 合併症と記録",
    stage: "post",
    items: [
      ["common", "心嚢液・タンポナーデ徴候", "ベースラインと比較し、少量でも増加傾向があれば共有。"],
      ["common", "新規弁膜症・心機能変化", "MR/TR/AR、LV/RV機能、局所壁運動、流出路狭窄を確認。"],
      ["common", "残存短絡・残存逆流", "定量/半定量、方向、複数jet、肺静脈/肝静脈所見を記録。"],
      ["common", "デバイス位置と安定性", "リリース前後、呼吸/拍動での安定性、周辺構造干渉を確認。"],
      ["common", "保存画像セット", "主要2D/Color/3D、計測、術前後比較、合併症除外画像を保存。"]
    ]
  }
];

const state = {
  procedure: "mteer",
  tab: "all",
  checks: JSON.parse(localStorage.getItem("shdChecks") || "{}"),
  notes: JSON.parse(localStorage.getItem("shdNotes") || "{}"),
  planner: JSON.parse(localStorage.getItem("shdPlanner") || "{}")
};
localStorage.setItem("shdProcedure", "mteer");

const procedureList = document.querySelector("#procedureList");
const checklistEl = document.querySelector("#checklist");
const sectionTemplate = document.querySelector("#sectionTemplate");
const progressArc = document.querySelector("#progressArc");
const progressText = document.querySelector("#progressText");
const progressCount = document.querySelector("#progressCount");
const teerPlanner = document.querySelector("#teerPlanner");
const plannerTitle = document.querySelector("#plannerTitle");
const plannerIntro = document.querySelector("#plannerIntro");
const plannerDevice = document.querySelector("#plannerDevice");
const mitralPlanner = document.querySelector("#mitralPlanner");
const tricuspidPlanner = document.querySelector("#tricuspidPlanner");
const laaoPlanner = document.querySelector("#laaoPlanner");
const tavrPlanner = document.querySelector("#tavrPlanner");
const septalPlanner = document.querySelector("#septalPlanner");
const eligibilityCard = document.querySelector("#eligibilityCard");
const eligibilityText = document.querySelector("#eligibilityText");
const eligibilityDetail = document.querySelector("#eligibilityDetail");
const clipCard = document.querySelector("#clipCard");
const clipText = document.querySelector("#clipText");
const clipDetail = document.querySelector("#clipDetail");
const criteriaList = document.querySelector("#criteriaList");
const caseFields = ["caseName", "operator", "caseDate"];
const helpDialog = document.querySelector("#helpDialog");
const helpTitle = document.querySelector("#helpTitle");
const helpFigure = document.querySelector("#helpFigure");
const helpText = document.querySelector("#helpText");
const helpClose = document.querySelector("#helpClose");
const clipDimensions = {
  NT: "NT: arm 9 mm / width 4 mm",
  NTW: "NTW: arm 9 mm / width 6 mm",
  XT: "XT: arm 12 mm / width 4 mm",
  XTW: "XTW: arm 12 mm / width 6 mm"
};

const plannerConfig = {
  mteer: { title: "MR TEERデバイス選択", device: "MitraClip G4" }
};

const watchmanSizes = [
  { size: 20, min: 14, max: 18 },
  { size: 24, min: 16.8, max: 21.6 },
  { size: 27, min: 18.9, max: 24.3 },
  { size: 31, min: 21.7, max: 27.9 },
  { size: 35, min: 24.5, max: 31.5 },
  { size: 40, min: 28, max: 36 }
];

const amuletSizes = [
  { size: 16, min: 11, max: 13, depth: 10 },
  { size: 18, min: 13, max: 15, depth: 10 },
  { size: 20, min: 15, max: 17, depth: 10 },
  { size: 22, min: 17, max: 19, depth: 10 },
  { size: 25, min: 19, max: 22, depth: 12 },
  { size: 28, min: 22, max: 25, depth: 12 },
  { size: 31, min: 25, max: 28, depth: 12 },
  { size: 34, min: 28, max: 31, depth: 12 }
];

const sapienSizes = [
  { size: 20, areaMin: 273, areaMax: 345, diaMin: 18.6, diaMax: 21 },
  { size: 23, areaMin: 338, areaMax: 430, diaMin: 20.7, diaMax: 23.4 },
  { size: 26, areaMin: 430, areaMax: 546, diaMin: 23.4, diaMax: 26.4 },
  { size: 29, areaMin: 540, areaMax: 683, diaMin: 26.2, diaMax: 29.5 }
];

const evolutSizes = [
  { size: 23, diaMin: 18, diaMax: 20, perMin: 56.5, perMax: 62.8 },
  { size: 26, diaMin: 20, diaMax: 23, perMin: 62.8, perMax: 72.3 },
  { size: 29, diaMin: 23, diaMax: 26, perMin: 72.3, perMax: 81.7 },
  { size: 34, diaMin: 26, diaMax: 30, perMin: 81.7, perMax: 94.2 }
];

const goreAsdSizes = [
  { size: 27, min: 8, max: 15, sheath: "10 Fr" },
  { size: 32, min: 13, max: 20, sheath: "10 Fr" },
  { size: 37, min: 18, max: 25, sheath: "11 Fr" },
  { size: 44, min: 23, max: 30, sheath: "12 Fr" },
  { size: 48, min: 28, max: 35, sheath: "14 Fr" }
];

const helpEntries = {
  mrJetWidth: ["MR jet width", "color Dopplerで標的jetの幅を、leaflet接合線に近い位置で測ります。広いjetや複数jetではwide clipや複数clipを考えます。", "valveJet"],
  mvApDiameter: ["僧帽弁前後径", "3D en faceまたはMPRで僧帽弁輪の前後方向を測ります。弁口が小さい場合は術後MSリスクを意識します。", "mitralAnnulus"],
  mvCommissuralDiameter: ["僧帽弁左右径", "3D en faceまたはMPRで交連間方向を測ります。wide clipや複数clipを置く余地の確認に使います。", "mitralAnnulus"],
  anteriorLeaflet: ["前尖長", "grasp予定部位で、自由縁から弁尖基部方向へ使える長さを見ます。短いと把持量が不足します。", "leafletLength"],
  posteriorLeaflet: ["後尖長", "grasp予定部位で、自由縁から弁尖基部方向へ使える長さを見ます。後尖が短い病変ではclip保持に注意します。", "leafletLength"],
  leafletInsertion: ["leaflet insertion", "clip arm上に入る弁尖長の見込みです。NT/NTWはおおむね6 mm以上、XT/XTWは9 mm以上を目安にします。", "insertion"],
  coaptationDepth: ["coaptation depth", "僧帽弁輪平面からcoaptation pointまでの深さです。二次性MRでtetheringが強いほど深くなります。", "coaptation"],
  coaptationLength: ["coaptation length", "前尖と後尖が重なっている長さです。短いとgraspが難しくなります。", "coaptation"],
  flailGap: ["flail gap", "flail leaflet先端と対側弁尖接合点までの距離です。gapが大きいとXT系や複数clipを考えます。", "flail"],
  flailWidth: ["flail width", "flailしている幅をcommissure方向に測ります。幅が広いとwide clipや複数clipを検討します。", "flail"],
  mva: ["MVA", "3D planimetryまたはPHTなどで僧帽弁口面積を確認します。小さい場合は術後MSリスクに注意します。", "orifice"],
  mvGradient: ["平均MV圧較差", "PW/CW Dopplerで僧帽弁流入の平均圧較差を測ります。心拍数とflow依存性も一緒に確認します。", "doppler"],
  tvGap: ["三尖弁coaptation gap", "主にsepto-lateral方向で、標的弁尖間の最大gapを測ります。gapが大きいほどT-TEERは難しくなります。", "tricuspidGap"],
  tvLeafletLength: ["三尖弁尖長", "clipで把持する予定の弁尖で、自由縁から使える弁尖長を測ります。", "leafletLength"],
  trVenaContracta: ["TR VC幅", "color DopplerでTR jetの最狭部を測ります。広いjetではwide clipや複数clipを検討します。", "valveJet"],
  tvTethering: ["tethering height", "三尖弁輪平面からcoaptation pointまでの距離です。右室拡大やtetheringの強さを反映します。", "coaptation"],
  tvGradient: ["平均TV圧較差", "三尖弁流入の平均圧較差です。clip後のTSリスクを見るために術前値を確認します。", "doppler"],
  pasp: ["PASP", "TR jet velocityと右房圧から推定します。高度肺高血圧では治療適応とリスクを再確認します。", "doppler"],
  laaMaxOstium: ["LAA ostium径", "0/45/90/135度など複数断面でLAA入口部を測り、最大径を使います。WATCHMANではostium径がサイズ選択の中心です。", "laa"],
  laaLanding: ["LAA landing zone径", "Amuletではostiumより少し奥のlanding zoneを測ります。複数角度で最大径を確認します。", "laa"],
  laaDepth: ["LAA depth", "ostiumまたはlanding zoneから主葉の奥までの深さです。浅いLAAではデバイスが収まるか注意します。", "laa"],
  annulusArea: ["大動脈弁輪area", "CTのvirtual basal ringで面積を測ります。SAPIEN系ではarea sizingの中心になります。", "aorticAnnulus"],
  annulusDiameter: ["area-derived径", "弁輪areaから換算した径、または平均径です。デバイスサイズ表と照合します。", "aorticAnnulus"],
  annulusPerimeter: ["弁輪perimeter", "CTのvirtual basal ring周囲長です。Evolut系ではperimeter sizingも確認します。", "aorticAnnulus"],
  coronaryHeight: ["冠動脈高", "弁輪平面から冠動脈入口部までの距離です。低い場合は冠閉塞リスクを評価します。", "coronary"],
  sovDiameter: ["SOV径", "Valsalva洞の径です。小さい場合は冠閉塞やsinus sequestrationに注意します。", "coronary"],
  pfoTunnel: ["PFO tunnel長", "右房側入口から左房側出口までのトンネル長です。長い場合は大きめdeviceを検討します。", "septum"],
  pfoSeparation: ["PFO separation", "septum primumとsecundumの開大幅です。大きい場合はdevice選択に影響します。", "septum"],
  asdDiameter: ["ASD径", "2D/3Dで最大径を測り、必要時stop-flow balloon径を使います。device waist選択の中心です。", "septum"],
  aorticRim: ["aortic rim", "ASD辺縁から大動脈側までのrimです。欠損だけなら許容されることもありますがerosionに注意します。", "septum"],
  posteriorRim: ["posterior rim", "ASD後壁側のrimです。短いとdevice安定性が低下します。", "septum"],
  ivcRim: ["IVC rim", "下大静脈側のrimです。短い場合はdevice closureが不利になります。", "septum"]
};

function itemId(sectionTitle, itemTitle) {
  return `${sectionTitle}::${itemTitle}`;
}

function appliesToCurrentProcedure(tag) {
  return tag === "common" || state.procedure === "common" || tag === state.procedure;
}

function tagShortName(tag) {
  if (tag === "common") return "共通";
  return procedures.find((p) => p.id === tag)?.short || tag;
}

function visibleSections() {
  return checklist
    .filter((section) => state.tab === "all" || section.stage === state.tab)
    .map((section) => ({
      ...section,
      items: section.items.filter(([tag]) => appliesToCurrentProcedure(tag))
    }))
    .filter((section) => section.items.length > 0);
}

function renderProcedures() {
  procedureList.innerHTML = "";
  procedures.forEach((procedure) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `procedure-button${procedure.id === state.procedure ? " active" : ""}`;
    button.textContent = procedure.name;
    button.addEventListener("click", () => {
      state.procedure = procedure.id;
      localStorage.setItem("shdProcedure", state.procedure);
      render();
    });
    procedureList.append(button);
  });
}

function renderChecklist() {
  checklistEl.innerHTML = "";
  visibleSections().forEach((section) => {
    const node = sectionTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".section-head span").textContent = section.title;
    node.querySelector(".section-head").addEventListener("click", () => {
      node.classList.toggle("collapsed");
    });

    const itemsEl = node.querySelector(".items");
    section.items.forEach(([tag, title, detail]) => {
      const id = itemId(section.title, title);
      const item = document.createElement("label");
      item.className = "item";
      item.innerHTML = `
        <input type="checkbox" ${state.checks[id] ? "checked" : ""} />
        <span class="item-main">
          <span class="item-title">
            <span>${title}</span>
            <span class="badge">${tagShortName(tag)}</span>
          </span>
          <span class="item-detail">${detail}</span>
        </span>
      `;
      item.querySelector("input").addEventListener("change", (event) => {
        state.checks[id] = event.target.checked;
        persistChecks();
        updateProgress();
      });
      itemsEl.append(item);
    });

    checklistEl.append(node);
  });
}

function updateProgress() {
  const ids = visibleSections().flatMap((section) => section.items.map(([, title]) => itemId(section.title, title)));
  const done = ids.filter((id) => state.checks[id]).length;
  const total = ids.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressText.textContent = `${pct}%`;
  progressCount.textContent = `${done} / ${total}`;
  progressArc.style.strokeDashoffset = String(301.59 - (301.59 * pct) / 100);
}

function persistChecks() {
  localStorage.setItem("shdChecks", JSON.stringify(state.checks));
}

function render() {
  renderProcedures();
  renderPlanner();
  renderChecklist();
  updateProgress();
}

function numericValue(key) {
  const value = Number(state.planner[key]);
  return Number.isFinite(value) && state.planner[key] !== "" ? value : null;
}

function fieldValue(key, fallback = "") {
  return state.planner[key] ?? fallback;
}

function addCriterion(list, status, text) {
  list.push({ status, text });
}

function worstStatus(criteria) {
  if (criteria.some((item) => item.status === "stop")) return "stop";
  if (criteria.some((item) => item.status === "caution")) return "caution";
  if (criteria.some((item) => item.status === "good")) return "good";
  return "";
}

function setResultCard(card, status) {
  card.classList.remove("good", "caution", "stop");
  if (status) card.classList.add(status);
}

function renderCriteria(criteria) {
  criteriaList.innerHTML = "";
  criteria.forEach((criterion) => {
    const node = document.createElement("div");
    node.className = `criterion ${criterion.status}`;
    node.textContent = criterion.text;
    criteriaList.append(node);
  });
}

function diagram(type) {
  const diagrams = {
    leafletLength: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M70 150 Q120 60 175 124 Q235 56 292 150" />
        <path class="figure-measure" d="M175 124 Q158 98 140 75" />
        <path class="figure-measure" d="M175 124 Q198 98 220 75" />
        <text class="figure-label" x="92" y="42">弁尖長</text>
        <text class="figure-label" x="132" y="178">自由縁から使える長さ</text>
      </svg>`,
    insertion: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M68 80 Q122 138 174 112 Q228 138 292 80" />
        <rect class="figure-fill" x="142" y="112" width="72" height="52" rx="8" />
        <path class="figure-measure" d="M146 116 L174 132 M214 116 L186 132" />
        <text class="figure-label" x="106" y="46">clip内に入る弁尖長</text>
      </svg>`,
    coaptation: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M70 56 H292" />
        <path class="figure-soft" d="M80 160 Q140 80 178 132 Q220 84 282 160" />
        <path class="figure-measure" d="M178 56 V132" />
        <path class="figure-measure" d="M160 132 H196" />
        <text class="figure-label" x="190" y="96">depth</text>
        <text class="figure-label" x="133" y="156">length</text>
      </svg>`,
    flail: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M70 150 Q126 78 170 128 Q224 72 292 150" />
        <path class="figure-soft" d="M170 128 Q150 86 128 42" />
        <path class="figure-measure" d="M128 42 L168 126" />
        <path class="figure-measure" d="M112 48 H172" />
        <text class="figure-label" x="182" y="86">gap</text>
        <text class="figure-label" x="102" y="28">width</text>
      </svg>`,
    valveJet: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M70 126 Q130 74 180 126 Q230 74 292 126" />
        <path d="M160 132 C158 160 145 178 122 195 M178 132 C185 162 184 182 176 202 M196 132 C214 158 224 178 238 195" fill="none" stroke="#d96b35" stroke-width="10" stroke-linecap="round" opacity="0.75"/>
        <path class="figure-measure" d="M151 126 H205" />
        <text class="figure-label" x="126" y="54">color jetの幅</text>
      </svg>`,
    orifice: `
      <svg viewBox="0 0 360 210" role="img">
        <ellipse class="figure-fill" cx="180" cy="112" rx="92" ry="48" />
        <ellipse cx="180" cy="112" rx="44" ry="20" fill="#fff" stroke="#d96b35" stroke-width="5" />
        <text class="figure-label" x="126" y="178">3D en faceで弁口をtrace</text>
      </svg>`,
    mitralAnnulus: `
      <svg viewBox="0 0 360 210" role="img">
        <ellipse class="figure-fill" cx="180" cy="112" rx="100" ry="58" />
        <path class="figure-measure" d="M180 54 V170" />
        <path class="figure-measure" d="M80 112 H280" />
        <text class="figure-label" x="198" y="94">前後径</text>
        <text class="figure-label" x="124" y="144">左右径</text>
      </svg>`,
    doppler: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M62 160 H310 M80 34 V174" />
        <path class="figure-line" d="M88 156 C122 150 120 60 156 64 C192 68 184 152 226 154 C262 156 260 88 296 92" />
        <path class="figure-measure" d="M92 62 H302" />
        <text class="figure-label" x="120" y="32">Doppler波形から測定</text>
      </svg>`,
    tricuspidGap: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M92 150 Q135 78 178 128 Q224 78 268 150" />
        <path class="figure-measure" d="M164 126 H194" />
        <text class="figure-label" x="112" y="58">弁尖間の最大gap</text>
      </svg>`,
    laa: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M82 118 C112 70 158 76 182 108 C214 64 276 74 300 132 C258 124 224 144 188 134 C144 154 108 142 82 118Z" />
        <path class="figure-measure" d="M96 116 H184" />
        <path class="figure-measure" d="M184 116 C224 116 260 130 286 132" />
        <text class="figure-label" x="90" y="52">ostium / landing zone</text>
        <text class="figure-label" x="210" y="174">depth</text>
      </svg>`,
    aorticAnnulus: `
      <svg viewBox="0 0 360 210" role="img">
        <ellipse class="figure-fill" cx="180" cy="112" rx="92" ry="58" />
        <path class="figure-measure" d="M92 112 H268" />
        <path class="figure-measure" d="M180 54 V170" />
        <text class="figure-label" x="86" y="36">virtual basal ring</text>
        <text class="figure-label" x="118" y="190">area / perimeter / derived径</text>
      </svg>`,
    coronary: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M92 148 H268 M120 148 C120 84 238 84 238 148" />
        <circle class="figure-fill" cx="238" cy="84" r="12" />
        <path class="figure-measure" d="M238 148 V84" />
        <text class="figure-label" x="152" y="44">弁輪平面から冠入口部</text>
      </svg>`,
    septum: `
      <svg viewBox="0 0 360 210" role="img">
        <path class="figure-soft" d="M128 42 C168 82 170 128 130 170" />
        <path class="figure-soft" d="M220 42 C184 82 184 130 224 170" />
        <path class="figure-measure" d="M146 108 H206" />
        <path class="figure-measure" d="M126 154 H224" />
        <text class="figure-label" x="104" y="34">PFO/ASDの開大幅・径</text>
        <text class="figure-label" x="86" y="190">周囲rimも同じ断面で確認</text>
      </svg>`
  };
  return diagrams[type] || diagrams.valveJet;
}

function installMeasurementHelp() {
  Object.entries(helpEntries).forEach(([fieldId, entry]) => {
    const label = document.querySelector(`label[for="${fieldId}"]`);
    if (!label) return;
    if (label.parentElement.querySelector(`.inline-help[data-help-field="${fieldId}"]`)) return;
    label.querySelector(".help-button")?.remove();
    label.classList.add("with-help");
    const row = document.createElement("div");
    row.className = "label-help-row";
    label.before(row);
    row.append(label);

    const details = document.createElement("details");
    details.className = "inline-help";
    details.dataset.helpField = fieldId;
    details.innerHTML = `
      <summary aria-label="${entry[0]}の測定位置">?</summary>
      <div class="inline-help-card text-only">
        <p><strong>${entry[0]}</strong><br>${entry[1]}</p>
      </div>
    `;
    row.append(details);
  });
}

function openHelp(entry) {
  helpTitle.textContent = entry[0];
  helpText.textContent = entry[1];
  helpFigure.innerHTML = diagram(entry[2]);
  try {
    if (typeof helpDialog.showModal === "function" && !helpDialog.open) {
      helpDialog.showModal();
      return;
    }
    helpDialog.setAttribute("open", "");
  } catch {
    helpDialog.setAttribute("open", "");
  }
}

function openHelpByField(fieldId) {
  const entry = helpEntries[fieldId];
  if (entry) openHelp(entry);
}

window.openHelpByField = openHelpByField;

function mitralAssessment() {
  const etiology = fieldValue("mrEtiology", "primary");
  const target = fieldValue("mvTarget", "a2p2");
  const lesion = fieldValue("mrLesion", "simple");
  const mvApDiameter = numericValue("mvApDiameter");
  const mvCommissuralDiameter = numericValue("mvCommissuralDiameter");
  const anteriorLeaflet = numericValue("anteriorLeaflet");
  const posteriorLeaflet = numericValue("posteriorLeaflet");
  const insertion = numericValue("leafletInsertion");
  const coaptationLength = numericValue("coaptationLength");
  const coaptationDepth = numericValue("coaptationDepth");
  const flailGap = numericValue("flailGap");
  const flailWidth = numericValue("flailWidth");
  const jetWidth = numericValue("mrJetWidth");
  const mva = numericValue("mva");
  const gradient = numericValue("mvGradient");
  const calcification = Boolean(state.planner.graspCalcification);
  const contraindication = Boolean(state.planner.contraMitral);
  const criteria = [];
  const centralTarget = target === "a2p2";
  const offCenterTarget = target === "a1p1" || target === "a3p3";

  if (contraindication) addCriterion(criteria, "stop", "血栓、活動性感染、リウマチ性MSなどは原則としてTEER適応を再検討。");
  if (centralTarget) addCriterion(criteria, "good", "A2-P2は標準的に狙いやすい留置部位。");
  if (offCenterTarget) addCriterion(criteria, "caution", `${target.toUpperCase().replace("P", "-P")}は画像追跡とclip角度を慎重に確認。`);
  if (target === "commissure") addCriterion(criteria, "caution", "交連近傍は弁口面積、残存MR、clip角度の確認が重要。");
  if (target === "cleft") addCriterion(criteria, "stop", "cleft / perforation近傍は標準TEERとしては不利。");
  if (lesion === "calcified") addCriterion(criteria, "caution", "石灰化・肥厚病変: grasping zoneとSLDAリスクを重点確認。");
  if (lesion === "wide") addCriterion(criteria, "caution", "wide / multiple jet: wide clipまたは複数clip戦略を検討。");

  if (mvApDiameter !== null) {
    if (mvApDiameter < 25) addCriterion(criteria, "caution", "僧帽弁前後径 <25 mm: 弁口が小さめで術後MSリスクに注意。");
    else addCriterion(criteria, "good", "僧帽弁前後径は極端に小さくない。");
  }

  if (mvCommissuralDiameter !== null) {
    if (mvCommissuralDiameter < 30) addCriterion(criteria, "caution", "僧帽弁左右径 <30 mm: wide clipや複数clipの余地を慎重に確認。");
    else addCriterion(criteria, "good", "僧帽弁左右径はclip配置の余地を評価しやすい。");
  }

  if (anteriorLeaflet !== null) {
    if (anteriorLeaflet < 7) addCriterion(criteria, "stop", "前尖長 <7 mm: grasp不十分の懸念が強い。");
    else if (anteriorLeaflet < 10) addCriterion(criteria, "caution", "前尖長 7-10 mm: 可能だが余裕は少ない。");
    else addCriterion(criteria, "good", "前尖長 >=10 mm: graspに好ましい。");
  }

  if (posteriorLeaflet !== null) {
    if (posteriorLeaflet < 7) addCriterion(criteria, "stop", "後尖長 <7 mm: grasp不十分の懸念が強い。");
    else if (posteriorLeaflet < 10) addCriterion(criteria, "caution", "後尖長 7-10 mm: 可能だが余裕は少ない。");
    else addCriterion(criteria, "good", "後尖長 >=10 mm: graspに好ましい。");
  }

  if (insertion !== null) {
    if (insertion < 6) addCriterion(criteria, "stop", "leaflet insertion <6 mm: G4 NT/NTWにも不足。");
    else if (insertion < 9) addCriterion(criteria, "caution", "leaflet insertion 6-9 mm: NT/NTWは検討、XT/XTWは不足。");
    else addCriterion(criteria, "good", "leaflet insertion >=9 mm: NT/NTWとXT/XTWを検討可能。");
  }

  if (mva !== null) {
    if (mva < 3) addCriterion(criteria, "stop", "MVA <3.0 cm2: 術後MSリスクが高く原則不適。");
    else if (mva < 4) addCriterion(criteria, "caution", "MVA 3.0-4.0 cm2: 複数clipやwide clipでMSリスクに注意。");
    else addCriterion(criteria, "good", "MVA >=4.0 cm2: TEER前評価として望ましい。");
  }

  if (gradient !== null) {
    if (gradient > 5) addCriterion(criteria, "stop", "平均MV圧較差 >5 mmHg: 術後MSリスクが高い。");
    else if (gradient >= 4) addCriterion(criteria, "caution", "平均MV圧較差 4-5 mmHg: clip数とサイズを慎重に。");
    else addCriterion(criteria, "good", "平均MV圧較差 <4 mmHg: ベースライン狭窄リスクは比較的低い。");
  }

  if (calcification) addCriterion(criteria, "caution", "grasping zone石灰化あり: leaflet insertionとSLDAリスクを重点確認。");
  if (jetWidth !== null) {
    if (jetWidth > 10) addCriterion(criteria, "caution", "jet width >10 mm: wide clipや複数clipを検討。");
    else addCriterion(criteria, "good", "jet width <=10 mm: 単一clip戦略を検討しやすい。");
  }

  if (etiology === "primary") {
    if (flailGap !== null) {
      if (flailGap > 15) addCriterion(criteria, "stop", "flail gap >15 mm: 標準的TEERではかなり困難。");
      else if (flailGap > 10) addCriterion(criteria, "caution", "flail gap >10 mm: 複雑病変として経験あるチームで検討。");
      else addCriterion(criteria, "good", "flail gap <=10 mm: 従来基準では好ましい。");
    }
    if (flailWidth !== null) {
      if (flailWidth > 20) addCriterion(criteria, "stop", "flail width >20 mm: 単純な1 clip戦略では困難。");
      else if (flailWidth > 15) addCriterion(criteria, "caution", "flail width >15 mm: wide clipや複数clip戦略を検討。");
      else addCriterion(criteria, "good", "flail width <=15 mm: 従来基準では好ましい。");
    }
  } else {
    if (coaptationDepth !== null) {
      if (coaptationDepth > 11) addCriterion(criteria, "stop", "coaptation depth >11 mm: leaflet approximation困難。");
      else addCriterion(criteria, "good", "coaptation depth <=11 mm: 従来基準では好ましい。");
    }
    if (coaptationLength !== null) {
      if (coaptationLength < 2) addCriterion(criteria, "stop", "coaptation length <2 mm: grasp困難。");
      else addCriterion(criteria, "good", "coaptation length >=2 mm: grasp条件を満たす。");
    }
  }

  const status = worstStatus(criteria);
  const clip = mitralClipSuggestion({
    insertion,
    flailGap,
    flailWidth,
    jetWidth,
    mvApDiameter,
    mvCommissuralDiameter,
    mva,
    gradient,
    target,
    lesion,
    calcification
  });
  return { status, criteria, clip };
}

function mitralClipSuggestion(values) {
  const insertion = values.insertion;
  const stenosisConcern = (values.mva !== null && values.mva < 4) || (values.gradient !== null && values.gradient >= 4);
  const smallAnnulus =
    (values.mvApDiameter !== null && values.mvApDiameter < 25) ||
    (values.mvCommissuralDiameter !== null && values.mvCommissuralDiameter < 30);
  const broadTarget =
    values.lesion === "wide" ||
    (values.jetWidth !== null && values.jetWidth > 10) ||
    (values.flailWidth !== null && values.flailWidth > 15) ||
    values.target === "a1p1" ||
    values.target === "a3p3";
  const largeGap = values.flailGap !== null && values.flailGap > 10;
  const complexTarget = values.target === "commissure" || values.target === "cleft" || values.lesion === "calcified";

  if (insertion !== null && insertion < 6) {
    return {
      status: "stop",
      text: "候補なし",
      detail: "G4 NT/NTWには6 mm以上、XT/XTWには9 mm以上のleaflet insertion確認が必要。"
    };
  }

  const shortClips = ["NT", "NTW"];
  const longClips = insertion === null || insertion >= 9 ? ["XT", "XTW"] : [];
  let candidates = largeGap ? longClips : shortClips.concat(longClips);
  if (broadTarget && !stenosisConcern) candidates = candidates.filter((clip) => clip.endsWith("W"));
  if (stenosisConcern || smallAnnulus) candidates = candidates.filter((clip) => !clip.endsWith("W"));
  if (!candidates.length) candidates = insertion !== null && insertion < 9 ? shortClips : ["NT", "XT"];

  const unique = [...new Set(candidates)];
  const first = unique[0];
  const alternatives = unique.slice(1);
  const notes = [];
  if (largeGap) notes.push("flail/prolapse gapが大きい場合はXT系が候補。");
  if (broadTarget && !stenosisConcern) notes.push("幅広いjetや広いflailではNTW/XTWを検討。");
  if (stenosisConcern) notes.push("MVA/圧較差からwide clipや複数clipは慎重に。");
  if (smallAnnulus) notes.push("僧帽弁径が小さめのためwide clipや複数clipは慎重に。");
  if (values.calcification) notes.push("石灰化部位を避け、leaflet insertionを再確認。");
  if (complexTarget) notes.push("複雑部位のため、候補は術中画像で上書き。");

  return {
    status: stenosisConcern || complexTarget ? "caution" : "good",
    text: `第一候補: ${first}`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。${clipDimensions[first]}。${notes.join(" ") || "標的jet幅、弁口面積、残存MRを見ながら選択。"}`
  };
}

function tricuspidAssessment() {
  const target = fieldValue("tvTarget", "as");
  const gap = numericValue("tvGap");
  const jet = fieldValue("tvJet", "anteroseptal");
  const morphology = fieldValue("tvMorphology", "trileaflet");
  const leafletLength = numericValue("tvLeafletLength");
  const venaContracta = numericValue("trVenaContracta");
  const tethering = numericValue("tvTethering");
  const gradient = numericValue("tvGradient");
  const pasp = numericValue("pasp");
  const lead = Boolean(state.planner.leadImpingement);
  const poorImage = Boolean(state.planner.poorTvImage);
  const criteria = [];

  if (gap !== null) {
    if (gap > 10) addCriterion(criteria, "stop", "coaptation gap >10 mm: T-TEERは不利。代替治療も含め検討。");
    else if (gap > 7) addCriterion(criteria, "caution", "coaptation gap 7-10 mm: 実施可能なことはあるが難度が上がる。");
    else addCriterion(criteria, "good", "coaptation gap <=7 mm: T-TEER成功を予測しやすい。");
  }

  if (target === "as") addCriterion(criteria, "good", "前尖-中隔尖はT-TEERで第一標的になりやすい。");
  if (target === "ps") addCriterion(criteria, "caution", "後尖-中隔尖は画像窓とデバイス角度を重点確認。");
  if (target === "ap") addCriterion(criteria, "stop", "前尖-後尖主体はT-TEERで不利なことが多い。");
  if (target === "central") addCriterion(criteria, "caution", "central / multi-clip戦略はgap分布と残存TRを見ながら判断。");

  if (jet === "anteroseptal") addCriterion(criteria, "good", "anteroseptal / central jetはT-TEERで狙いやすい。");
  if (jet === "posteroseptal") addCriterion(criteria, "caution", "posteroseptal jetは画像窓とデバイス角度を重点確認。");
  if (jet === "anteroposterior") addCriterion(criteria, "stop", "anteroposterior / 交連主体jetはT-TEERに不利。");
  if (morphology === "quad") addCriterion(criteria, "caution", "4尖以上 / complex morphology: grasp対象の同定と複数clip戦略を確認。");
  if (morphology === "restricted") addCriterion(criteria, "caution", "高度tethering / restriction: leaflet approximation不良に注意。");

  if (leafletLength !== null) {
    if (leafletLength < 7) addCriterion(criteria, "stop", "標的弁尖長 <7 mm: grasp困難。");
    else if (leafletLength < 10) addCriterion(criteria, "caution", "標的弁尖長 7-10 mm: 可能だが余裕は少ない。");
    else addCriterion(criteria, "good", "標的弁尖長 >=10 mm: graspに好ましい。");
  }

  if (tethering !== null) {
    if (tethering > 10) addCriterion(criteria, "caution", "tethering height >10 mm: leaflet approximation不良に注意。");
    else addCriterion(criteria, "good", "tethering height <=10 mm: 極端なtetheringではない。");
  }

  if (venaContracta !== null) {
    if (venaContracta > 11) addCriterion(criteria, "caution", "VC幅 >11 mm: 残存TRと複数clip戦略に注意。");
    else addCriterion(criteria, "good", "VC幅 <=11 mm: TEERで減量を狙いやすい範囲。");
  }

  if (gradient !== null && gradient >= 3) addCriterion(criteria, "caution", "平均TV圧較差 >=3 mmHg: 術後TSリスクを確認。");
  if (pasp !== null && pasp > 70) addCriterion(criteria, "caution", "PASP >70 mmHg: TriClip G4で安全性・有効性未確立の範囲に該当。");
  if (lead) addCriterion(criteria, "caution", "リードimpingement / adhesionあり: clip位置とリード処理方針を確認。");
  if (poorImage) addCriterion(criteria, "stop", "TEE画像追跡が不十分: 安全なgrasp確認が困難。");

  const status = worstStatus(criteria);
  const clip = tricuspidClipSuggestion({ gap, leafletLength, gradient, target, jet, morphology, venaContracta });
  return { status, criteria, clip };
}

function tricuspidClipSuggestion(values) {
  if (values.leafletLength !== null && values.leafletLength < 7) {
    return { status: "stop", text: "候補なし", detail: "標的弁尖長が短く、安定したgraspが困難。" };
  }

  const stenosisConcern = values.gradient !== null && values.gradient >= 3;
  const largeGap = values.gap !== null && values.gap > 7;
  const broadTarget = values.venaContracta !== null && values.venaContracta > 11;
  const unfavorableLine = values.target === "ap" || values.jet === "anteroposterior";
  let candidates = largeGap ? ["XT", "XTW"] : ["NT", "NTW", "XT", "XTW"];
  if (broadTarget && !stenosisConcern) candidates = candidates.filter((clip) => clip.endsWith("W"));
  if (stenosisConcern) candidates = candidates.filter((clip) => !clip.endsWith("W"));
  if (values.gap !== null && values.gap > 10) candidates = ["XT", "XTW"];
  if (!candidates.length) candidates = stenosisConcern ? ["NT", "XT"] : ["NTW", "XTW"];
  const first = candidates[0];
  const alternatives = candidates.slice(1);

  return {
    status: values.gap !== null && values.gap > 10 || unfavorableLine ? "caution" : "good",
    text: `第一候補: ${first}`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。${clipDimensions[first]}。gapが大きい場合はXT系、広いcoaptation面が必要ならW系、狭窄リスクがあれば非W系を優先。`
  };
}

function pickByRange(value, table, minKey = "min", maxKey = "max") {
  if (value === null) return [];
  return table.filter((row) => value >= row[minKey] && value <= row[maxKey]);
}

function laaoAssessment() {
  const family = fieldValue("laaoDeviceFamily", "watchman");
  const ostium = numericValue("laaMaxOstium");
  const landing = numericValue("laaLanding");
  const depth = numericValue("laaDepth");
  const morphology = fieldValue("laaMorphology", "single");
  const thrombus = Boolean(state.planner.laaThrombus);
  const ridgeConcern = Boolean(state.planner.laaRidgeConcern);
  const criteria = [];

  if (thrombus) addCriterion(criteria, "stop", "LAA thrombus / sludgeあり: 原則として留置前に再評価。");
  if (morphology === "single") addCriterion(criteria, "good", "single lobeで軸が合う場合は標準的に留置しやすい。");
  if (morphology === "chicken") addCriterion(criteria, "caution", "chicken wing / bendあり: depthとデバイス軸を重点確認。");
  if (morphology === "multi") addCriterion(criteria, "caution", "multi-lobe: ostium sealと残存leakを重点確認。");
  if (morphology === "shallow") addCriterion(criteria, "caution", "浅いLAA: depth不足に注意。");
  if (ridgeConcern) addCriterion(criteria, "caution", "ridge・LUPV・MV干渉懸念あり: disc/shoulder位置を重点確認。");

  const clip = family === "amulet" ? amuletSuggestion(landing, depth) : watchmanSuggestion(ostium, depth);
  if (clip.criteria) clip.criteria.forEach((item) => addCriterion(criteria, item.status, item.text));
  return { status: worstStatus(criteria), criteria, clip };
}

function watchmanSuggestion(ostium, depth) {
  const matches = pickByRange(ostium, watchmanSizes);
  if (!matches.length) {
    return {
      status: ostium === null ? "" : "stop",
      text: "未判定",
      detail: ostium === null ? "最大ostium径を入力してください。" : "WATCHMAN FLX Proの代表的レンジ外です。",
      criteria: []
    };
  }
  const first = matches[0];
  const alternatives = matches.slice(1).map((row) => `${row.size} mm`);
  const criteria = [];
  if (depth !== null) {
    const requiredDepth = first.size / 2;
    if (depth < requiredDepth) criteria.push({ status: "caution", text: `depth < device径の約1/2: ${first.size} mmでは浅い可能性。` });
    else criteria.push({ status: "good", text: `depthは${first.size} mm WATCHMANの目安を満たす。` });
  }
  return {
    status: criteria.some((item) => item.status === "caution") ? "caution" : "good",
    text: `第一候補: WATCHMAN FLX Pro ${first.size} mm`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。最大ostium ${first.min}-${first.max} mmの範囲。留置後compression 10-30%、seal、anchorを確認。`,
    criteria
  };
}

function amuletSuggestion(landing, depth) {
  const matches = pickByRange(landing, amuletSizes);
  if (!matches.length) {
    return {
      status: landing === null ? "" : "stop",
      text: "未判定",
      detail: landing === null ? "landing zone径を入力してください。" : "Amuletの代表的landing zoneレンジ外です。",
      criteria: []
    };
  }
  const first = matches[0];
  const alternatives = matches.slice(1).map((row) => `${row.size} mm`);
  const criteria = [];
  if (depth !== null) {
    if (depth < first.depth) criteria.push({ status: "stop", text: `LAA depth <${first.depth} mm: Amulet ${first.size} mmには不足。` });
    else criteria.push({ status: "good", text: `LAA depth >=${first.depth} mm: Amulet ${first.size} mmの目安を満たす。` });
  }
  return {
    status: criteria.some((item) => item.status === "stop") ? "stop" : "good",
    text: `第一候補: Amulet ${first.size} mm`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。landing zone ${first.min}-${first.max} mm、必要depth >=${first.depth} mm。disc位置とperi-device leakを確認。`,
    criteria
  };
}

function tavrAssessment() {
  const family = fieldValue("tavrValveFamily", "sapien");
  const area = numericValue("annulusArea");
  const diameter = numericValue("annulusDiameter");
  const perimeter = numericValue("annulusPerimeter");
  const coronaryHeight = numericValue("coronaryHeight");
  const sov = numericValue("sovDiameter");
  const morphology = fieldValue("avMorphology", "tricuspid");
  const calcium = fieldValue("lvotCalcium", "none");
  const criteria = [];

  if (morphology === "tricuspid") addCriterion(criteria, "good", "三尖AS: 標準サイズ表で検討しやすい。");
  if (morphology === "bicuspid") addCriterion(criteria, "caution", "二尖弁: supra-annular sizing、raphe石灰化、楕円率を追加確認。");
  if (morphology === "purear") addCriterion(criteria, "caution", "pure AR: anchoring不足に注意。専用弁やoversizing戦略を施設基準で確認。");
  if (morphology === "vinv") addCriterion(criteria, "caution", "valve-in-valve: true ID、冠閉塞、VTC/VTSTJを別途確認。");
  if (calcium === "moderate") addCriterion(criteria, "caution", "中等度LVOT/弁輪石灰化: PVLと破裂リスクを確認。");
  if (calcium === "severe") addCriterion(criteria, "stop", "高度・偏在LVOT/弁輪石灰化: annular ruptureやPVLリスクを重点検討。");
  if (coronaryHeight !== null && coronaryHeight < 12) addCriterion(criteria, "caution", "冠動脈高 <12 mm: 冠閉塞リスクを確認。");
  if (sov !== null && sov < 27) addCriterion(criteria, "caution", "SOVが小さい: 冠閉塞、sinus sequestrationを確認。");

  const clip = family === "evolut" ? evolutSuggestion(diameter, perimeter) : sapienSuggestion(area, diameter);
  if (clip.criteria) clip.criteria.forEach((item) => addCriterion(criteria, item.status, item.text));
  return { status: worstStatus(criteria), criteria, clip };
}

function sapienSuggestion(area, diameter) {
  const byArea = pickByRange(area, sapienSizes, "areaMin", "areaMax");
  const byDiameter = pickByRange(diameter, sapienSizes, "diaMin", "diaMax");
  const candidates = byArea.length ? byArea : byDiameter;
  if (!candidates.length) {
    return {
      status: area === null && diameter === null ? "" : "stop",
      text: "未判定",
      detail: area === null && diameter === null ? "弁輪areaまたはarea-derived径を入力してください。" : "SAPIEN 3 Ultra RESILIAの代表的レンジ外です。",
      criteria: []
    };
  }
  const first = candidates[0];
  const alternatives = candidates.slice(1).map((row) => `${row.size} mm`);
  return {
    status: "good",
    text: `第一候補: SAPIEN 3 Ultra RESILIA ${first.size} mm`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。area ${first.areaMin}-${first.areaMax} mm2、径 ${first.diaMin}-${first.diaMax} mm。oversizing、石灰化、冠リスクで調整。`,
    criteria: [{ status: "good", text: `SAPIEN ${first.size} mmの代表的サイズレンジ内。` }]
  };
}

function evolutSuggestion(diameter, perimeter) {
  const byPerimeter = pickByRange(perimeter, evolutSizes, "perMin", "perMax");
  const byDiameter = pickByRange(diameter, evolutSizes, "diaMin", "diaMax");
  const candidates = byPerimeter.length ? byPerimeter : byDiameter;
  if (!candidates.length) {
    return {
      status: diameter === null && perimeter === null ? "" : "stop",
      text: "未判定",
      detail: diameter === null && perimeter === null ? "弁輪径またはperimeterを入力してください。" : "Evolutの代表的レンジ外です。",
      criteria: []
    };
  }
  const first = candidates[0];
  const alternatives = candidates.slice(1).map((row) => `${row.size} mm`);
  return {
    status: "good",
    text: `第一候補: Evolut ${first.size} mm`,
    detail: `代替: ${alternatives.join(" / ") || "なし"}。径 ${first.diaMin}-${first.diaMax} mm、perimeter ${first.perMin}-${first.perMax} mm。implant depthとconduction riskも確認。`,
    criteria: [{ status: "good", text: `Evolut ${first.size} mmの代表的サイズレンジ内。` }]
  };
}

function septalAssessment() {
  const type = fieldValue("septalType", "pfo");
  const tunnel = numericValue("pfoTunnel");
  const separation = numericValue("pfoSeparation");
  const asdDiameter = numericValue("asdDiameter");
  const aorticRim = numericValue("aorticRim");
  const posteriorRim = numericValue("posteriorRim");
  const ivcRim = numericValue("ivcRim");
  const shunt = fieldValue("shuntGrade", "small");
  const criteria = [];

  if (aorticRim !== null && aorticRim < 5) addCriterion(criteria, "caution", "aortic rim <5 mm: 単独欠損なら許容されることもあるがerosionに注意。");
  if (posteriorRim !== null && posteriorRim < 5) addCriterion(criteria, "stop", "posterior rim <5 mm: device closureは慎重に再検討。");
  if (ivcRim !== null && ivcRim < 5) addCriterion(criteria, "stop", "IVC rim <5 mm: device closureは不利。");
  if (shunt === "asa") addCriterion(criteria, "caution", "ASAあり: 大きめdiscや柔らかいdeviceを検討。");
  if (shunt === "multi") addCriterion(criteria, "caution", "多孔性 / fenestrated: cribriform系やGore系を検討。");
  if (shunt === "large") addCriterion(criteria, "caution", "large shunt: device安定性と残存短絡を重点確認。");

  const clip = type === "asd" ? asdSuggestion(asdDiameter, shunt) : pfoSuggestion(tunnel, separation, shunt);
  if (clip.criteria) clip.criteria.forEach((item) => addCriterion(criteria, item.status, item.text));
  return { status: worstStatus(criteria), criteria, clip };
}

function pfoSuggestion(tunnel, separation, shunt) {
  let size = 25;
  if ((tunnel !== null && tunnel > 10) || (separation !== null && separation > 4) || shunt === "asa" || shunt === "large") size = 35;
  if ((tunnel !== null && tunnel < 8) && (separation === null || separation <= 2) && shunt === "small") size = 18;
  return {
    status: "good",
    text: `第一候補: Amplatzer PFO ${size} mm`,
    detail: `代替: ${size === 35 ? "25 mm" : "35 mm"}。標準的PFOは25 mm、ASA・長いtunnel・大きな開大では35 mmを検討。`,
    criteria: [{ status: "good", text: "PFO deviceは18/25/35 mmから解剖に合わせて選択。" }]
  };
}

function asdSuggestion(diameter, shunt) {
  if (diameter === null) {
    return { status: "", text: "未判定", detail: "ASD径またはstop-flow balloon径を入力してください。", criteria: [] };
  }
  const waistSizes = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38];
  const amplatzer = waistSizes.find((size) => size >= diameter);
  const gore = pickByRange(diameter, goreAsdSizes)[0];
  if (!amplatzer && !gore) {
    return { status: "stop", text: "候補なし", detail: "代表的ASD deviceレンジ外です。外科/特殊deviceも含め検討。", criteria: [] };
  }
  const preferGore = shunt === "multi" || shunt === "asa";
  const first = preferGore && gore ? `GORE CARDIOFORM ASD ${gore.size} mm` : `Amplatzer Septal Occluder ${amplatzer} mm`;
  const alt = preferGore && amplatzer ? `Amplatzer Septal Occluder ${amplatzer} mm` : gore ? `GORE CARDIOFORM ASD ${gore.size} mm` : "なし";
  return {
    status: "good",
    text: `第一候補: ${first}`,
    detail: `代替: ${alt}。Amplatzerはwaist径をstop-flow径に合わせる。GOREは${gore ? `${gore.min}-${gore.max} mm欠損に${gore.size} mm / ${gore.sheath}` : "対象外"}。`,
    criteria: [{ status: "good", text: "ASD径に応じた代表的閉鎖deviceレンジ内。" }]
  };
}

function renderPlanner() {
  const isMitral = state.procedure === "mteer";
  const isTricuspid = state.procedure === "tteer";
  const isLaao = state.procedure === "laao";
  const isTavr = state.procedure === "tavr";
  const isSeptal = state.procedure === "asd";
  const config = plannerConfig[state.procedure];
  teerPlanner.hidden = !config;
  if (teerPlanner.hidden) return;

  plannerTitle.textContent = config.title;
  plannerDevice.textContent = config.device;
  plannerIntro.textContent = "数値と性状を入力すると、第一候補・代替候補・避けたい条件を表示します。最終判断はIFU、術者、ハートチームで確認してください。";
  mitralPlanner.hidden = !isMitral;
  tricuspidPlanner.hidden = !isTricuspid;
  laaoPlanner.hidden = !isLaao;
  tavrPlanner.hidden = !isTavr;
  septalPlanner.hidden = !isSeptal;

  const assessment = isMitral
    ? mitralAssessment()
    : isTricuspid
      ? tricuspidAssessment()
      : isLaao
        ? laaoAssessment()
        : isTavr
          ? tavrAssessment()
          : septalAssessment();
  const relevantKeys = isMitral
    ? [
        "posteriorLeaflet",
        "anteriorLeaflet",
        "leafletInsertion",
        "mrJetWidth",
        "mvApDiameter",
        "mvCommissuralDiameter",
        "coaptationLength",
        "coaptationDepth",
        "flailGap",
        "flailWidth",
        "mva",
        "mvGradient",
        "graspCalcification",
        "contraMitral"
      ]
    : isTricuspid
      ? [
        "tvGap",
        "tvLeafletLength",
        "trVenaContracta",
        "tvTethering",
        "tvGradient",
        "pasp",
        "leadImpingement",
        "poorTvImage"
      ]
      : isLaao
        ? ["laaMaxOstium", "laaLanding", "laaDepth", "laaThrombus", "laaRidgeConcern"]
        : isTavr
          ? ["annulusArea", "annulusDiameter", "annulusPerimeter", "coronaryHeight", "sovDiameter"]
          : ["pfoTunnel", "pfoSeparation", "asdDiameter", "aorticRim", "posteriorRim", "ivcRim"];
  const hasInput = relevantKeys.some((key) => state.planner[key] !== undefined && state.planner[key] !== "" && state.planner[key] !== false);

  if (!hasInput) {
    setResultCard(eligibilityCard, "");
    setResultCard(clipCard, "");
    eligibilityText.textContent = "数値・部位を入力してください";
    eligibilityDetail.textContent = "留置部位と主要計測値を入力すると、適応上の注意点を表示します。";
    clipText.textContent = "未判定";
    clipDetail.textContent = "第一候補と代替候補を表示します。";
    criteriaList.innerHTML = "";
    return;
  }

  setResultCard(eligibilityCard, assessment.status);
  setResultCard(clipCard, assessment.clip.status);
  eligibilityText.textContent =
    assessment.status === "stop" ? "要再検討" : assessment.status === "caution" ? "条件付きで検討" : "解剖学的には好条件";
  eligibilityDetail.textContent =
    assessment.status === "stop"
      ? "赤色項目があり、標準的なTEER適応や安全なgraspを再確認してください。"
      : assessment.status === "caution"
        ? "注意項目があります。経験、画像品質、clip数、術後狭窄リスクを確認してください。"
        : "入力された範囲では、主要な解剖学的条件はおおむね良好です。";
  clipText.textContent = assessment.clip.text;
  clipDetail.textContent = assessment.clip.detail;
  renderCriteria(assessment.criteria);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((node) => node.classList.remove("active"));
    tab.classList.add("active");
    state.tab = tab.dataset.tab;
    renderChecklist();
    updateProgress();
  });
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  if (!confirm("チェックと入力値をリセットしますか？")) return;
  state.checks = {};
  state.notes = {};
  state.planner = {};
  persistChecks();
  localStorage.setItem("shdNotes", "{}");
  localStorage.setItem("shdPlanner", "{}");
  document.querySelectorAll("[data-plan-field]").forEach((field) => {
    if (field.type === "checkbox") field.checked = false;
    else field.value = field.querySelector("option")?.value || "";
  });
  render();
});

document.querySelector("#printBtn").addEventListener("click", () => window.print());

caseFields.forEach((field) => {
  const input = document.querySelector(`#${field}`);
  input.value = localStorage.getItem(`shd-${field}`) || (field === "caseDate" ? new Date().toISOString().slice(0, 10) : "");
  input.addEventListener("input", () => localStorage.setItem(`shd-${field}`, input.value));
});

document.querySelectorAll("[data-plan-field]").forEach((field) => {
  const key = field.dataset.planField;
  if (field.type === "checkbox") {
    field.checked = Boolean(state.planner[key]);
    field.addEventListener("change", () => {
      state.planner[key] = field.checked;
      localStorage.setItem("shdPlanner", JSON.stringify(state.planner));
      renderPlanner();
    });
  } else {
    field.value = fieldValue(key, field.value);
    const saveField = () => {
      state.planner[key] = field.value;
      localStorage.setItem("shdPlanner", JSON.stringify(state.planner));
      renderPlanner();
    };
    field.addEventListener("input", saveField);
    field.addEventListener("change", saveField);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest?.(".help-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  openHelpByField(button.dataset.helpField);
});

helpClose.addEventListener("click", () => helpDialog.close());
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) helpDialog.close();
});

installMeasurementHelp();
render();
