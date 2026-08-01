const fs = require("fs");
const { Document, Packer, HeadingLevel } = require("docx");
const { body } = require("./generate");

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } } // 11pt
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: "1F3864" },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: "2E5395" },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, italics: true, color: "2E5395" },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } }
      },
      children: body
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/work/output.docx", buf);
  console.log("Saved output.docx, size:", buf.length);
}).catch(e => {
  console.error("ERROR:", e);
  process.exit(1);
});
