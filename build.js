/* build.js – FinController Pro
   Combines src/ files into a single HTML file.
   Run: node build.js                              */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const read = (f) => fs.readFileSync(path.join(srcDir, f), 'utf8');

const html = read('index.html');
const css = read('style.css');
const dataJs = read('data.js');
const appJs = read('app.js');

const output = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinController Pro — Nexova Group S.A.</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- ApexCharts -->
  <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js"><\/script>

  <!-- XLSX (SheetJS) -->
  <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"><\/script>

  <!-- PptxGenJS -->
  <script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"><\/script>

  <style>
${css}
  </style>
</head>
<body>
${html}

<script>
${dataJs}
</script>
<script>
${appJs}
</script>
</body>
</html>`;

// Output as index.html (main) + management-controller-board-report.html (alias)
const outFile = path.join(__dirname, 'index.html');
fs.writeFileSync(outFile, output, 'utf8');
const outFile2 = path.join(__dirname, 'management-controller-board-report.html');
fs.writeFileSync(outFile2, output, 'utf8');
console.log('✓ Built → ' + outFile + ' (' + (output.length / 1024).toFixed(0) + ' KB)');
