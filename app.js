const editor = document.querySelector("#textInput");
const fileNameInput = document.querySelector("#fileName");
const docTitleInput = document.querySelector("#docTitle");
const pageSizeInput = document.querySelector("#pageSize");
const textColorInput = document.querySelector("#textColor");
const boldTextButton = document.querySelector("#boldText");
const fontFamilyInput = document.querySelector("#fontFamily");
const fontSizeInput = document.querySelector("#fontSize");
const applyColorButton = document.querySelector("#applyColor");
const applyFontButton = document.querySelector("#applyFont");
const applySizeButton = document.querySelector("#applySize");
const previewTitle = document.querySelector("#previewTitle");
const previewContent = document.querySelector("#previewContent");
const wordCount = document.querySelector("#wordCount");
const conversation = document.querySelector("#conversation");
const form = document.querySelector("#pdfForm");
const previewBtn = document.querySelector("#previewBtn");
const clearBtn = document.querySelector("#clearBtn");
const templateCards = document.querySelectorAll(".template-card");

let savedRange = null;

const letterTemplates = {
  formal: {
    title: "Formal Letter",
    fileName: "formal-letter",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #202124;">
        <div style="text-align: right; color: #0f766e; font-weight: 700;">[Your Name]<br>[Your Address]<br>[City, State, ZIP]</div>
        <br>
        <div>[Date]</div>
        <br>
        <div style="font-weight: 700;">[Recipient Name]</div>
        <div>[Recipient Address]</div>
        <br>
        <div style="font-weight: 700; font-size: 16px; color: #0f766e;">Subject: Request for Information</div>
        <br>
        <div>Dear [Recipient Name],</div>
        <br>
        <div>I am writing to request information regarding [topic or purpose]. Please share the relevant details at your earliest convenience.</div>
        <br>
        <div>I would appreciate your support and look forward to your response.</div>
        <br>
        <div>Sincerely,</div>
        <div style="font-weight: 700;">[Your Name]</div>
      </div>
    `,
  },
  job: {
    title: "Job Application Letter",
    fileName: "job-application-letter",
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #202124;">
        <div style="font-size: 20px; font-weight: 700; color: #c2410c;">[Your Name]</div>
        <div style="color: #667085;">[Phone] | [Email] | [Location]</div>
        <br>
        <div>[Date]</div>
        <br>
        <div style="font-weight: 700;">Hiring Manager</div>
        <div>[Company Name]</div>
        <br>
        <div style="font-weight: 700; color: #c2410c;">Subject: Application for [Job Title]</div>
        <br>
        <div>Dear Hiring Manager,</div>
        <br>
        <div>I am excited to apply for the [Job Title] position at [Company Name]. My experience in [skill or field] and my ability to [strength] make me a strong fit for this role.</div>
        <br>
        <div>I would welcome the opportunity to discuss how I can contribute to your team.</div>
        <br>
        <div>Thank you for your time and consideration.</div>
        <br>
        <div>Sincerely,</div>
        <div style="font-weight: 700;">[Your Name]</div>
      </div>
    `,
  },
  business: {
    title: "Business Proposal Letter",
    fileName: "business-proposal-letter",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #202124;">
        <div style="font-size: 18px; font-weight: 700; color: #0f766e;">Business Proposal</div>
        <div style="color: #667085;">Prepared for [Client Name]</div>
        <br>
        <div>Dear [Client Name],</div>
        <br>
        <div>We are pleased to propose a solution for [project or need]. Our goal is to help your team improve [benefit] through a clear and practical approach.</div>
        <br>
        <div style="font-weight: 700; color: #0f766e;">Scope of Work</div>
        <div>- [Service or deliverable 1]</div>
        <div>- [Service or deliverable 2]</div>
        <div>- [Timeline or milestone]</div>
        <br>
        <div style="font-weight: 700; color: #0f766e;">Next Step</div>
        <div>Please review this proposal and let us know a convenient time to discuss the details.</div>
        <br>
        <div>Best regards,</div>
        <div style="font-weight: 700;">[Your Name / Company]</div>
      </div>
    `,
  },
  thankyou: {
    title: "Thank You Letter",
    fileName: "thank-you-letter",
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: #202124;">
        <div style="font-size: 20px; font-weight: 700; color: #c2410c;">Thank You</div>
        <br>
        <div>Dear [Name],</div>
        <br>
        <div>Thank you for [reason]. I truly appreciate your time, support, and consideration.</div>
        <br>
        <div>Your help made a meaningful difference, and I am grateful for the opportunity to connect with you.</div>
        <br>
        <div>With appreciation,</div>
        <div style="font-weight: 700; color: #c2410c;">[Your Name]</div>
      </div>
    `,
  },
};

function cleanFileName(value) {
  return (value || "text-to-pdf")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "text-to-pdf";
}

function editorText() {
  return editor.innerText.replace(/\u00a0/g, " ").trim();
}

function countWords(text) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function addMessage(role, text) {
  const message = document.createElement("article");
  message.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "You" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.append(avatar, bubble);
  conversation.append(message);
  conversation.scrollTop = conversation.scrollHeight;
}

function useTemplate(templateName) {
  const template = letterTemplates[templateName];
  if (!template) return;

  editor.innerHTML = template.html.replace(/>\s+</g, "><").trim();
  docTitleInput.value = template.title;
  fileNameInput.value = template.fileName;
  savedRange = null;
  templateCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.template === templateName);
  });
  updatePreview();
  addMessage("bot", `${template.title} loaded. You can edit every line before preview or download.`);
  editor.focus();
}

function fontLabel(font) {
  return {
    helvetica: "Helvetica, Arial, sans-serif",
    times: "Georgia, 'Times New Roman', serif",
    courier: "'Courier New', Courier, monospace",
  }[font] || "Helvetica, Arial, sans-serif";
}

function saveSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (editor.contains(range.commonAncestorContainer)) {
    savedRange = range.cloneRange();
  }
}

function restoreSelection() {
  if (!savedRange) return false;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(savedRange);
  return true;
}

function selectedRange() {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange();
      return range;
    }
  }

  if (restoreSelection()) {
    const restored = window.getSelection();
    if (restored && restored.rangeCount > 0 && !restored.isCollapsed) {
      return restored.getRangeAt(0);
    }
  }

  return null;
}

function applyToSelection(styles) {
  const range = selectedRange();
  if (!range) {
    addMessage("bot", "Select a word or letters first, then apply the style.");
    editor.focus();
    return;
  }

  const span = document.createElement("span");
  Object.entries(styles).forEach(([name, value]) => {
    span.style[name] = value;
  });

  span.append(range.extractContents());
  range.insertNode(span);
  range.selectNodeContents(span);
  saveSelection();
  updatePreview();
}

function applyBold() {
  applyToSelection({ fontWeight: "700" });
  boldTextButton.classList.add("active");
  setTimeout(() => boldTextButton.classList.remove("active"), 300);
}

function applyColor() {
  applyToSelection({ color: textColorInput.value });
}

function applyFont() {
  applyToSelection({
    fontFamily: fontLabel(fontFamilyInput.value),
  });
}

function applySize() {
  const size = Math.min(Math.max(Number(fontSizeInput.value) || 12, 8), 32);
  fontSizeInput.value = size;
  applyToSelection({ fontSize: `${size}px` });
}

function updatePreview() {
  const text = editorText();
  const title = docTitleInput.value.trim() || "Untitled PDF";
  const totalWords = countWords(text);

  previewTitle.textContent = title;
  previewContent.innerHTML = text ? editor.innerHTML : "Your PDF preview will appear here.";
  wordCount.textContent = `${totalWords} ${totalWords === 1 ? "word" : "words"}`;
}

function pdfEscape(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "");
}

function hexToRgb(hex) {
  const normalized = (hex || "#202124").replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized.padEnd(6, "0").slice(0, 6);

  return {
    r: parseInt(value.slice(0, 2), 16) || 0,
    g: parseInt(value.slice(2, 4), 16) || 0,
    b: parseInt(value.slice(4, 6), 16) || 0,
  };
}

function rgbStringToHex(value) {
  if (!value || value.startsWith("#")) return value || "#202124";
  const parts = value.match(/\d+/g);
  if (!parts || parts.length < 3) return "#202124";
  return `#${parts.slice(0, 3).map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
}

function fontKeyFromFamily(family) {
  const value = (family || "").toLowerCase();
  if (value.includes("courier")) return "courier";
  if (value.includes("times") || value.includes("georgia")) return "times";
  return "helvetica";
}

function normalizeRun(run) {
  return {
    text: run.text,
    color: rgbStringToHex(run.color),
    bold: Number(run.fontWeight) >= 600 || run.fontWeight === "bold",
    font: fontKeyFromFamily(run.fontFamily),
    fontSize: Math.min(Math.max(parseFloat(run.fontSize) || 12, 8), 32),
  };
}

function collectRuns() {
  const runs = [];

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        const parent = node.parentElement || editor;
        const styles = getComputedStyle(parent);
        runs.push(normalizeRun({
          text: node.textContent,
          color: styles.color,
          fontWeight: styles.fontWeight,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
        }));
      }
      return;
    }

    if (node.nodeName === "BR") {
      runs.push({ text: "\n", color: "#202124", bold: false, font: "helvetica", fontSize: 12 });
      return;
    }

    node.childNodes.forEach(walk);
    if (node !== editor && ["DIV", "P"].includes(node.nodeName)) {
      runs.push({ text: "\n", color: "#202124", bold: false, font: "helvetica", fontSize: 12 });
    }
  }

  editor.childNodes.forEach(walk);
  return runs.length ? runs : [{ text: editorText(), color: "#202124", bold: false, font: "helvetica", fontSize: 12 }];
}

function splitRunWords(run) {
  return run.text.split(/(\s+)/).filter(Boolean).map((text) => ({ ...run, text }));
}

function measureText(text, run) {
  const factor = run.font === "courier" ? 0.6 : run.font === "times" ? 0.5 : 0.52;
  return text.length * run.fontSize * factor;
}

function layoutRuns(runs, maxWidth) {
  const lines = [[]];
  let lineWidth = 0;

  runs.flatMap(splitRunWords).forEach((run) => {
    const parts = run.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) {
        lines.push([]);
        lineWidth = 0;
      }
      if (!part) return;

      const width = measureText(part, run);
      const isOnlySpace = !part.trim();
      if (lineWidth + width > maxWidth && lineWidth > 0 && !isOnlySpace) {
        lines.push([]);
        lineWidth = 0;
      }
      lines[lines.length - 1].push({ ...run, text: part });
      lineWidth += width;
    });
  });

  return lines;
}

function fontResource(run) {
  const key = `${run.font}-${run.bold ? "bold" : "normal"}`;
  return {
    "helvetica-normal": "F1",
    "helvetica-bold": "F2",
    "times-normal": "F3",
    "times-bold": "F4",
    "courier-normal": "F5",
    "courier-bold": "F6",
  }[key] || "F1";
}

function createPdfBlob({ title, runs, pageSize }) {
  const size = pageSize === "letter"
    ? { width: 612, height: 792 }
    : { width: 595.28, height: 841.89 };
  const margin = 56;
  const titleSize = 18;
  const maxWidth = size.width - margin * 2;
  const lines = layoutRuns(runs, maxWidth);
  const pages = [[]];
  let y = size.height - margin - 36;

  lines.forEach((line) => {
    const tallest = Math.max(...line.map((run) => run.fontSize), 12);
    const lineHeight = Math.round(tallest * 1.45);
    if (y < margin) {
      pages.push([]);
      y = size.height - margin - 36;
    }
    pages[pages.length - 1].push({ y, line });
    y -= lineHeight;
  });

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontIds = {
    F1: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    F2: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
    F3: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>"),
    F4: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>"),
    F5: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>"),
    F6: addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>"),
  };
  const fontResources = Object.entries(fontIds)
    .map(([name, id]) => `/${name} ${id} 0 R`)
    .join(" ");
  const pageIds = [];

  pages.forEach((page) => {
    const commands = [
      "BT",
      `/F2 ${titleSize} Tf`,
      "0.12 0.13 0.14 rg",
      `${margin} ${size.height - margin} Td`,
      `(${pdfEscape(title)}) Tj`,
      "ET",
    ];

    page.forEach(({ y: lineY, line }) => {
      let x = margin;
      line.forEach((run) => {
        const color = hexToRgb(run.color);
        commands.push(
          "BT",
          `/${fontResource(run)} ${run.fontSize} Tf`,
          `${(color.r / 255).toFixed(3)} ${(color.g / 255).toFixed(3)} ${(color.b / 255).toFixed(3)} rg`,
          `${x.toFixed(2)} ${lineY.toFixed(2)} Td`,
          `(${pdfEscape(run.text)}) Tj`,
          "ET"
        );
        x += measureText(run.text, run);
      });
    });

    const stream = commands.join("\n");
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${size.width} ${size.height}] /Resources << /Font << ${fontResources} >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
}

function buildPdf() {
  const text = editorText();
  const title = docTitleInput.value.trim() || "Untitled PDF";
  const fileName = cleanFileName(fileNameInput.value);
  const pageSize = pageSizeInput.value;

  if (!text) {
    addMessage("bot", "Please add some text first, then I can create your PDF.");
    editor.focus();
    return;
  }

  const pdfBlob = createPdfBlob({ title, runs: collectRuns(), pageSize });
  downloadBlob(pdfBlob, `${fileName}.pdf`);
  addMessage("user", text.length > 160 ? `${text.slice(0, 160)}...` : text);
  addMessage("bot", `Download started for ${fileName}.pdf.`);
}

editor.addEventListener("input", updatePreview);
editor.addEventListener("keyup", saveSelection);
editor.addEventListener("mouseup", saveSelection);
editor.addEventListener("paste", () => setTimeout(updatePreview, 0));
docTitleInput.addEventListener("input", updatePreview);
textColorInput.addEventListener("mousedown", saveSelection);
textColorInput.addEventListener("focus", saveSelection);
fontFamilyInput.addEventListener("mousedown", saveSelection);
fontFamilyInput.addEventListener("focus", saveSelection);
fontSizeInput.addEventListener("mousedown", saveSelection);
fontSizeInput.addEventListener("focus", saveSelection);
applyColorButton.addEventListener("mousedown", saveSelection);
applyFontButton.addEventListener("mousedown", saveSelection);
applySizeButton.addEventListener("mousedown", saveSelection);
boldTextButton.addEventListener("mousedown", saveSelection);
applyColorButton.addEventListener("click", applyColor);
boldTextButton.addEventListener("click", applyBold);
applyFontButton.addEventListener("click", applyFont);
applySizeButton.addEventListener("click", applySize);
templateCards.forEach((card) => {
  card.addEventListener("click", () => useTemplate(card.dataset.template));
});

previewBtn.addEventListener("click", () => {
  updatePreview();
  addMessage("bot", "Preview updated with your selected styles.");
});

clearBtn.addEventListener("click", () => {
  editor.innerHTML = "";
  savedRange = null;
  updatePreview();
  addMessage("bot", "Cleared. Paste fresh text whenever you are ready.");
  editor.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updatePreview();
  buildPdf();
});

updatePreview();
