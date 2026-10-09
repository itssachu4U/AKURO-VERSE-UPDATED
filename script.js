const CONFIG = {
  fallback: "https://t.me/+LWr2hcTQomQ4NmY1"
};

const params = new URLSearchParams(location.search);
const fbclid = params.get("fbclid") || "";
const campaign = params.get("utm_campaign") || "";
const ad = params.get("utm_content") || "";
const source = params.get("utm_source") || "";
const medium = params.get("utm_medium") || "";
const term = params.get("utm_term") || "";
const visitId = createId("visit");
let inviteLink = CONFIG.fallback;

function createId(prefix) {
  const uuid = window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${uuid}`;
}

function trackPixel(eventName, data, eventId, custom = false) {
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq(custom ? "trackCustom" : "track", eventName, data, {eventID: eventId});
  } catch (_) {}
}

function serverEvent(type, eid) {
  const payload = JSON.stringify({
    type,
    vid: visitId,
    eid,
    fbclid,
    source,
    medium,
    campaign,
    ad,
    term
  });
  const body = new Blob([payload], {type: "application/json"});
  if (navigator.sendBeacon && navigator.sendBeacon("/api/event", body)) return;
  fetch("/api/event", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: payload,
    keepalive: true
  }).catch(() => {});
}

const viewEventId = createId("view");
trackPixel("ViewContent", {content_name: "telegram_landing_page"}, viewEventId);
serverEvent("ViewContent", viewEventId);

const btn = document.getElementById("joinBtn");
const statusText = document.getElementById("statusText");
btn.href = CONFIG.fallback;

async function getLink() {
  try {
    const r = await fetch("/api/get-link", {cache: "no-store"});
    if (!r.ok) throw new Error(`get-link returned ${r.status}`);
    const d = await r.json();
    const candidate = d.url || d.link;
    if (typeof candidate === "string" && /^https:\/\/(t\.me|telegram\.me)\//i.test(candidate)) {
      inviteLink = candidate;
    }
  } catch (_) {}
  btn.href = inviteLink;
}

getLink();

btn.addEventListener("click", function(e) {
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width,r.height);
  const rip = document.createElement("span");
  rip.className = "ripple";
  rip.style.width = rip.style.height = size+"px";
  rip.style.left = (e.clientX-r.left-size/2)+"px";
  rip.style.top = (e.clientY-r.top-size/2)+"px";
  btn.appendChild(rip);
  setTimeout(()=>rip.remove(),650);

  e.preventDefault();
  btn.classList.add("busy");
  if(statusText) statusText.textContent = "Opening…";

  const eid = createId("telegram_join");
  const go = () => { window.location.assign(inviteLink || CONFIG.fallback); };

  trackPixel("TelegramJoinClick", {content_name: "telegram_channel"}, eid, true);
  serverEvent("TelegramJoinClick", eid);

  setTimeout(go, 180);
});

const sheet = document.getElementById("sheet");
const backdrop = document.getElementById("sheetBackdrop");
const closeBtn = document.getElementById("sheetClose");
const tabs = document.querySelectorAll(".sheet-tab");
const panels = document.querySelectorAll(".sheet-panel");
const openTriggers = document.querySelectorAll("[data-open]");

function replayAnim(panel) {
  panel.querySelectorAll("p,li").forEach(el=>{
    el.style.animation="none"; void el.offsetWidth; el.style.animation="";
  });
}
function setTab(name) {
  tabs.forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  panels.forEach(p=>{
    const active=p.dataset.panel===name;
    p.classList.toggle("active",active);
    if(active) replayAnim(p);
  });
}
function openSheet(name) {
  setTab(name); backdrop.classList.add("open"); sheet.classList.add("open");
  document.body.classList.add("sheet-lock");
}
function closeSheet() {
  backdrop.classList.remove("open"); sheet.classList.remove("open");
  document.body.classList.remove("sheet-lock");
}
openTriggers.forEach(b=>b.addEventListener("click",()=>openSheet(b.dataset.open)));
tabs.forEach(t=>t.addEventListener("click",()=>setTab(t.dataset.tab)));
closeBtn.addEventListener("click",closeSheet);
backdrop.addEventListener("click",closeSheet);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSheet()});

const card=document.getElementById("card");
if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
  card.addEventListener("mousemove",e=>{
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5;
    const py=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateY(${px*4}deg) rotateX(${py*-4}deg)`;
  });
  card.addEventListener("mouseleave",()=>card.style.transform="");
}
