const terminalOutput = document.getElementById("terminal-output");
const cursor = document.getElementById("terminal-cursor");
const terminalScreen = document.querySelector(".terminal-screen");
const sections = document.querySelectorAll(".terminal-section");
const sectionMap = new Map([...sections].map((section) => [section.id, section]));
const themeToggle = document.querySelector(".theme-toggle");
const wrapper = document.querySelector(".terminal-wrapper");
const footerYear = document.getElementById("footer-year");
const body = document.body;
const portfolioSection = document.querySelector(".portfolio");
const normalNavLinks = document.querySelectorAll(".normal-nav__link");
const normalPageSections = document.querySelectorAll(".normal-page");
const normalPageLinks = document.querySelectorAll("[data-page-link]");
const blogFeed = document.getElementById("blog-feed");
const promptText = "lostboy@ops:~$ ";
const IDLE_AUTO_DELAY = 9000;
const MAX_TERMINAL_LINES = 36;
const commandSequence = [
  {
    command: "whoami",
    sectionId: "section-whoami",
    message: "Identity verified. Operator profile decrypted."
  },
  {
    command: "skills",
    sectionId: "section-skills",
    message: "Capabilities enumerated. Offensive/defensive stack ready."
  },
  {
    command: "projects",
    sectionId: "section-projects",
    message: "Repository intel synced from GitHub."
  },
  {
    command: "certifications",
    sectionId: "section-certifications",
    message: "Credential vault decrypted."
  },
  {
    command: "contact",
    sectionId: "section-contact",
    message: "Secure comms channel established."
  },
  {
    command: "blog",
    sectionId: "section-blog",
    message: "Latest writeups piped in from /blog feed."
  }
];
const keyCommandMap = {
  Digit1: "whoami",
  Digit2: "skills",
  Digit3: "projects",
  Digit4: "certifications",
  Digit5: "contact",
  Digit6: "blog",
  Numpad1: "whoami",
  Numpad2: "skills",
  Numpad3: "projects",
  Numpad4: "certifications",
  Numpad5: "contact",
  Numpad6: "blog"
};
const projectData = [
  {
    name: "Stegg",
    description: "Lightweight steganography utility that hides payloads in media with operator-friendly CLI flags.",
    url: "https://github.com/div3107/Stegg",
    stack: "Python · Pillow · argparse"
  },
  {
    name: "PowerShell Network Scanners",
    description: "Modular PowerShell scripts for internal recon, service fingerprinting, and quick-share reporting.",
    url: "https://github.com/div3107/Powershell_network_scanning_scripts",
    stack: "PowerShell · Windows API"
  },
  {
    name: "Flags & Labs Hub",
    description: "Chill Guy challenge hub documenting solve paths, payloads, and retainer notes.",
    url: "https://github.com/div3107/Chill-guy/blob/main/README.md",
    stack: "CTF Notes · Markdown"
  }
];
const blogData = [
  {
    title: "Bug Bounty 101 — First Report, First Reward",
    date: "Nov 2025",
    summary: "The mindset, mistakes, and lessons from earning my very first bounty with a humble finding.",
    url: "bugbounty101.html"
  }
];
const terminalSummaries = {
  "section-whoami": [
    "Hi, I'm Divyanshu Gupta — VAPT, web/API testing, and bug bounty practitioner.",
    "CTF addict. Virat Kohli watcher. Clash of Clans raider.",
    "Links: lostboy.in | geek.divyanshu@gmail.com | @lostboy"
  ],
  "section-skills": [
    "Web/Network: Burp Suite Pro, OWASP ZAP, Nmap, Nessus, OpenVAS.",
    "Recon: Subfinder, Amass, Shodan, Gobuster, Censys.",
    "Post-Exploitation: Hydra, Medusa, CrackMapExec, BloodHound, Mimikatz.",
    "Automation: Python, Bash, PowerShell. Cloud/OS: AWS, Cloudflare, Kali, Parrot, Ubuntu.",
    "Certs: CEH Practical v13, eJPT, ISO/IEC 27001 (ISA), CRTA/MCRTA, ICCA, IoT (Samsung Innovation Campus)."
  ],
  "section-certifications": [
    "CEH Practical v13 · eJPT · ISO/IEC 27001 (ISA).",
    "CRTA + MCRTA · INE ICCA · IoT (Samsung Innovation Campus)."
  ],
  "section-contact": [
    "Email: geek.divyanshu@gmail.com",
    "Phone: +91 63927 00866",
    "LinkedIn: linkedin.com/in/divyanshu-gupta-sec3107/",
    "TryHackMe: tryhackme.com/p/lostboy.31"
  ],
  "section-blog": [
    "Read: Bug Bounty 101 — First Report, First Reward (bugbounty101.html).",
    "More drops at medium.com/@geek.divyanshu"
  ]
};
class TerminalAudio {
  constructor() {
    this.context = null;
    this.enabled = true;
  }
  init() {
    if (this.context || !this.enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      this.enabled = false;
      return;
    }
    this.context = new AudioContext();
  }
  click() {
    if (!this.enabled) return;
    this.init();
    if (!this.context || this.context.state === "suspended") return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    osc.type = "square";
    osc.frequency.value = 440 + Math.random() * 120;
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }
}
const audio = new TerminalAudio();
let bootStarted = false;
let bootComplete = false;
let userHasTyped = false;
let autoStartTimer = null;
let commandQueuePromise = Promise.resolve();
let currentNormalPage = "home";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * (90 - 35 + 1)) + 35;

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let rafId = null;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const STAR_COUNT = 220;
  const SPEED_MIN = 0.08;
  const SPEED_MAX = 0.45;
  const stars = [];

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = Math.floor(window.innerWidth);
    height = Math.floor(window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetStar(star, initial = false) {
    star.x = rand(0, width);
    star.y = initial ? rand(0, height) : -rand(0, height * 0.2);
    star.z = rand(0.2, 1);
    star.r = rand(0.6, 1.8) * star.z;
    star.v = rand(SPEED_MIN, SPEED_MAX) * (0.35 + star.z);
    star.a = rand(0.25, 0.9);
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const star = { x: 0, y: 0, z: 1, r: 1, v: 0.2, a: 0.6 };
      resetStar(star, true);
      stars.push(star);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width * 0.25, height * 0.2, 0, width * 0.25, height * 0.2, Math.max(width, height));
    gradient.addColorStop(0, "rgba(103, 255, 138, 0.08)");
    gradient.addColorStop(0.55, "rgba(123, 213, 255, 0.05)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (let i = 0; i < stars.length; i += 1) {
      const s = stars[i];
      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick() {
    if (!prefersReducedMotion) {
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        s.y += s.v;
        s.x += Math.sin((s.y / 110) * s.z) * 0.15;
        if (s.y - s.r > height) resetStar(s);
      }
    }
    draw();
    rafId = window.requestAnimationFrame(tick);
  }

  resize();
  initStars();
  tick();

  window.addEventListener("resize", () => {
    resize();
    initStars();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }
    if (!rafId) tick();
  });
}
const showCursor = () => {
  if (cursor) cursor.style.display = "block";
};
const hideCursor = () => {
  if (cursor) cursor.style.display = "none";
};
function updateCursorPosition(target) {
  if (!target || !cursor) return;
  const screenRect = terminalScreen.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const top = targetRect.bottom - screenRect.top - 6;
  const left = targetRect.right - screenRect.left + 4;
  cursor.style.top = `${Math.max(12, top)}px`;
  cursor.style.left = `${Math.max(20, left)}px`;
}
function appendLine(text, options = {}) {
  const line = document.createElement("div");
  line.className = `line ${options.variant || ""}`.trim();
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  updateCursorPosition(line);
  trimTerminalHistory(MAX_TERMINAL_LINES);
  return line;
}
function renderCommandSummary(sectionId) {
  const summary = getCommandSummary(sectionId);
  summary.forEach((line) => appendLine(line));
}
function getCommandSummary(sectionId) {
  if (sectionId === "section-projects") {
    return projectData.map((project, index) => `${index + 1}. ${project.name} — ${project.description}`);
  }
  if (sectionId === "section-blog") {
    return blogData.map((post) => `${post.date}: ${post.title} — ${post.summary} (${post.url})`);
  }
  return terminalSummaries[sectionId] || [];
}
async function typeLine(text, { withPrompt = false } = {}) {
  showCursor();
  const line = document.createElement("div");
  line.className = "line";
  terminalOutput.appendChild(line);
  const content = withPrompt ? `${promptText}${text}` : text;
  let index = 0;
  return new Promise((resolve) => {
    const typeNext = () => {
      line.textContent = content.slice(0, index);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      updateCursorPosition(line);
      if (index < content.length) {
        audio.click();
        index += 1;
        setTimeout(typeNext, randomDelay());
      } else {
        hideCursor();
        resolve(line);
      }
    };
    typeNext();
  });
}
async function executeCommand(commandConfig) {
  await typeLine(commandConfig.command, { withPrompt: true });
  await pause(250);
  appendLine(commandConfig.message);
  revealSection(commandConfig.sectionId);
  renderCommandSummary(commandConfig.sectionId);
  await pause(200);
}
function enqueueCommand(config) {
  commandQueuePromise = commandQueuePromise.then(() => executeCommand(config));
  return commandQueuePromise;
}
function revealSection(sectionId) {
  const section = sectionMap.get(sectionId);
  if (!section) return;
  section.classList.add("active");
}
function displayCommandSection(sectionId) {
  const command = commandSequence.find((item) => item.sectionId === sectionId);
  if (command) {
    appendLine(command.message);
  }
  renderCommandSummary(sectionId);
}
function handleManualCommand(commandName) {
  if (!bootComplete) {
    appendLine("> System booting. Please wait a moment...", { variant: "system" });
    return;
  }
  markUserInteraction();
  handleCommandSubmission(commandName);
}
function markUserInteraction() {
  userHasTyped = true;
  if (autoStartTimer) {
    clearTimeout(autoStartTimer);
    autoStartTimer = null;
  }
}
function scheduleAutoStart() {}
function handleCommandSubmission(rawInput, options = {}) {
  const { echoPrompt = true, clearHistory = false } = options;
  const inputValue = rawInput ?? "";
  const trimmed = inputValue.trim();
  if (clearHistory && trimmed) {
    clearTerminal();
  }
  if (echoPrompt) {
    appendLine(`${promptText}${inputValue}`);
  }
  if (!trimmed) return;
  processCommand(trimmed);
}
function processCommand(inputValue) {
  const normalized = inputValue.toLowerCase();
  if (normalized === "help") {
    printHelp();
    return;
  }
  if (normalized === "clear") {
    clearTerminal();
    return;
  }
  if (normalized === "sudo su") {
    showSudoSuResponse();
    return;
  }
  const command = commandSequence.find((item) => item.command === normalized);
  if (command) {
    displayCommandSection(command.sectionId);
    return;
  }
  appendLine("Command not found. Type `help` to check commands.");
}
function showSudoSuResponse() {
  const lines = [
    "[!] Privilege escalation request detected.",
    "    Access limited to root badge + biometric token.",
    "    Event logged, multi-factor challenge dispatched.",
    "    Tip: drop `help` to enumerate safe commands."
  ];
  lines.forEach((line) => appendLine(line));
}
function printHelp() {
  const lines = [
    "Available commands:",
    "  whoami          — profile introduction",
    "  skills          — offensive & defensive toolkit",
    "  projects        — featured GitHub work",
    "  certifications  — current credentials",
    "  contact         — secure comms channels",
    "  blog            — latest writeups overview",
    "  clear           — clear terminal history",
    "  help            — show this reference"
  ];
  lines.forEach((line) => appendLine(line));
}
function clearTerminal() {
  terminalOutput.innerHTML = "";
  hideCursor();
}
function trimTerminalHistory(limit) {
  const lines = terminalOutput.querySelectorAll(".line");
  const overflow = lines.length - limit;
  if (overflow <= 0) return;
  for (let i = 0; i < overflow; i += 1) {
    lines[i].remove();
  }
}
function initKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    const commandName = keyCommandMap[event.code];
    if (!commandName) return;
    event.preventDefault();
    handleManualCommand(commandName);
  });
}
function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  grid.innerHTML = "";
  projectData.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <a href="${project.url}" target="_blank" rel="noopener">${project.name}</a>
      <p>${project.description}</p>
      <span class="project-stack">${project.stack}</span>
    `;
    grid.appendChild(card);
  });
}
function renderBlogFeed() {
  if (!blogFeed) return;
  blogFeed.innerHTML = "";
  blogData.forEach((post) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <span class="blog-card__date">${post.date}</span>
      <h3><a href="${post.url}" target="_blank" rel="noopener">${post.title}</a></h3>
      <p>${post.summary}</p>
    `;
    blogFeed.appendChild(article);
  });
}
function updateTheme(nextTheme) {
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("lostboy-theme", nextTheme);
  renderContactQr();
}
function initThemeToggle() {
  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    updateTheme(current);
  });
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (event) => {
    const storedTheme = localStorage.getItem("lostboy-theme");
    if (storedTheme) return;
    updateTheme(event.matches ? "dark" : "light");
  });
}
async function runBootSequence() {
  if (bootStarted) return;
  bootStarted = true;
  appendLine("> lostboy terminal ready. Type `help` or use shortcuts 1-6.", { variant: "system" });
  bootComplete = true;
  commandInput?.focus({ preventScroll: true });
}
function renderContactQr() {
  const canvas = document.getElementById("contact-qr");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 25;
  const cellSize = size / cells;
  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--color-bg").trim() || "#000";
  const fg = styles.getPropertyValue("--color-text").trim() || "#fff";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  let hash = 0;
  const seedText = "geek.divyanshu@gmail.com";
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }
  const totalCells = cells * cells;
  for (let index = 0; index < totalCells; index += 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    const bit = hash & 1;
    const x = index % cells;
    const y = Math.floor(index / cells);
    const isReserved =
      (x < 3 && y < 3) ||
      (x > cells - 4 && y < 3) ||
      (x < 3 && y > cells - 4);
    ctx.fillStyle = bit && !isReserved ? fg : bg;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.2, cellSize + 0.2);
  }
  const finderSquares = [
    { x: 0, y: 0 },
    { x: cells - 3, y: 0 },
    { x: 0, y: cells - 3 }
  ];
  finderSquares.forEach(({ x, y }) => {
    ctx.fillStyle = fg;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize * 3, cellSize * 3);
    ctx.fillStyle = bg;
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, cellSize, cellSize);
  });
}
function initFooterYear() {
  if (!footerYear) return;
  const year = new Date().getFullYear();
  footerYear.textContent = year;
}
function initNeonModeToggle() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    wrapper?.classList.add("neon-mode");
  }
  window.addEventListener("keydown", (event) => {
    if (event.altKey && event.key.toLowerCase() === "n") {
      wrapper?.classList.toggle("neon-mode");
    }
  });
}
function initCommandInput() {
  if (!commandInput) return;
  commandInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const value = commandInput.value;
    commandInput.value = "";
    if (!bootComplete) {
      appendLine("> System booting. Please wait a moment...", { variant: "system" });
      return;
    }
    markUserInteraction();
    handleCommandSubmission(value);
  });
  commandInput.addEventListener("input", () => {
    if (!bootComplete) return;
    markUserInteraction();
  });
}
function showNormalPage(page) {
  if (!normalPageSections.length) return;
  const matched = [...normalPageSections].find((section) => section.dataset.page === page);
  if (!matched) return;
  currentNormalPage = page;
  normalPageSections.forEach((section) => {
    section.classList.toggle("normal-page--active", section === matched);
  });
  normalNavLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}
function initNormalPages() {
  if (!normalPageSections.length) return;
  showNormalPage(currentNormalPage);
  normalNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      showNormalPage(link.dataset.page);
    });
  });
  normalPageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = link.dataset.pageLink;
      if (!target) return;
      showNormalPage(target);
    });
  });
}
function init() {
  renderBlogFeed();
  initThemeToggle();
  renderContactQr();
  initStarfield();
  initNormalPages();
  window.addEventListener(
    "pointerdown",
    () => {
      audio.init();
    },
    { once: true }
  );
}
document.addEventListener("DOMContentLoaded", init);
