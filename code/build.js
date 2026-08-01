const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, Bookmark, InternalHyperlink,
  ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, ExternalHyperlink
} = require("docx");
const fs = require("fs");
const { execSync } = require("child_process");
const { REF_BY_ID } = require("./refs");

function sizeOf(buf, path) {
  const out = execSync(`identify -format "%w %h" "${path}"`).toString().trim();
  const [w, h] = out.split(" ").map(Number);
  return { width: w, height: h };
}

function narrativeLabel(label) {
  const idx = label.lastIndexOf(", ");
  const authors = label.slice(0, idx);
  const year = label.slice(idx + 2);
  return `${authors} (${year})`;
}

// Build inline runs for parenthetical citation: (Author, Year; Author2, Year2)
function cite(ids) {
  const runs = [];
  runs.push(new TextRun("("));
  ids.forEach((id, i) => {
    const r = REF_BY_ID[id];
    runs.push(new InternalHyperlink({
      anchor: id,
      children: [new TextRun({ text: r.label, style: "Hyperlink" })]
    }));
    if (i < ids.length - 1) runs.push(new TextRun("; "));
  });
  runs.push(new TextRun(")"));
  return runs;
}

// Build narrative citation: Author et al. (Year)
function citeN(id) {
  const r = REF_BY_ID[id];
  return [new InternalHyperlink({
    anchor: id,
    children: [new TextRun({ text: narrativeLabel(r.label), style: "Hyperlink" })]
  })];
}

// Convert a "runspec" array into TextRun/InternalHyperlink objects
function runs(spec) {
  const out = [];
  spec.forEach(item => {
    if (typeof item === "string") {
      out.push(new TextRun(item));
    } else if (item.b) {
      out.push(new TextRun({ text: item.b, bold: true }));
    } else if (item.i) {
      out.push(new TextRun({ text: item.i, italics: true }));
    } else if (item.sup) {
      out.push(new TextRun({ text: item.sup, superScript: true }));
    } else if (item.sub) {
      out.push(new TextRun({ text: item.sub, subScript: true }));
    } else if (item.cite) {
      out.push(...cite(item.cite));
    } else if (item.citeN) {
      out.push(...citeN(item.citeN));
    } else if (item.link) {
      out.push(new ExternalHyperlink({ link: item.link, children: [new TextRun({ text: item.text, style: "Hyperlink" })] }));
    }
  });
  return out;
}

function P(spec, opts = {}) {
  return new Paragraph({ children: runs(spec), spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED, ...opts });
}

function H1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } });
}
function H2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 140 } });
}
function H3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } });
}

function refEntry(id) {
  const r = REF_BY_ID[id];
  const children = [new Bookmark({ id, children: [new TextRun(r.text)] })];
  if (r.url) {
    children.push(new TextRun(" "));
    children.push(new ExternalHyperlink({ link: r.url, children: [new TextRun({ text: r.url, style: "Hyperlink" })] }));
  }
  return new Paragraph({ children, spacing: { after: 180 }, alignment: AlignmentType.JUSTIFIED });
}

function figure(imgPath, caption, maxWidthIn = 6.3) {
  const dims = sizeOf(null, imgPath);
  const ratio = dims.height / dims.width;
  const widthPx = Math.round(maxWidthIn * 96);
  const heightPx = Math.round(widthPx * ratio);
  return [
    new Paragraph({
      children: [new ImageRun({ data: fs.readFileSync(imgPath), transformation: { width: widthPx, height: heightPx }, type: "jpg" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 }
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, bold: true, size: 20 })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 220 }
    })
  ];
}

function simpleTable(headerRow, rows, colWidths) {
  const totalWidth = 9350;
  const widths = colWidths || headerRow.map(() => Math.floor(totalWidth / headerRow.length));
  const mkCell = (text, header) => new TableCell({
    width: { size: widths[0], type: WidthType.DXA },
    shading: header ? { fill: "D9D9D9", type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: !!header, size: 20 })] })]
  });
  const trows = [];
  trows.push(new TableRow({ children: headerRow.map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text: String(h), bold: true, size: 20 })] })]
  })) }));
  rows.forEach(row => {
    trows.push(new TableRow({ children: row.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: String(c), size: 20 })] })]
    })) }));
  });
  return new Table({ rows: trows, columnWidths: widths, width: { size: totalWidth, type: WidthType.DXA } });
}

function equation(runsSpec, eqNum) {
  // Centered formula with right-aligned equation number, using tab stops
  const formulaRuns = runs(runsSpec);
  return new Paragraph({
    tabStops: [
      { type: "center", position: 4680 },
      { type: "right", position: 9350 },
    ],
    children: [
      new TextRun("\t"),
      ...formulaRuns,
      new TextRun(`\t(${eqNum})`),
    ],
    spacing: { before: 160, after: 160 },
  });
}

module.exports = { P, H1, H2, H3, refEntry, figure, simpleTable, cite, citeN, runs, PageBreak, equation };
