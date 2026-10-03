const fs = require('fs');
const path = require('path');

const beDir = 'E:/my study/FPT Polytechnic/DATN/BE/Graduation_Project_BE-main';
const origDir = path.join(beDir, 'data-upgrade/original');
const upDir = path.join(beDir, 'data-upgrade/upgraded');
const reportsDir = path.join(beDir, 'data-upgrade/reports');
const scriptsDir = path.join(beDir, 'data-upgrade/scripts');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const origFiles = fs.readdirSync(origDir).filter(f => f.endsWith('.json'));

let results = {
  timestamp: new Date().toISOString(),
  totalCollections: origFiles.length,
  collections: [],
  allPassed: true
};

origFiles.forEach(f => {
  const origData = JSON.parse(fs.readFileSync(path.join(origDir, f), 'utf8'));
  const upName = f.replace('.json', '.upgraded.json');
  const upPath = path.join(upDir, upName);

  if (!fs.existsSync(upPath)) {
    results.collections.push({ file: f, status: 'FAILED', reason: 'Upgraded file missing' });
    results.allPassed = false;
    return;
  }

  const upData = JSON.parse(fs.readFileSync(upPath, 'utf8'));

  // Check 1: Record count match
  if (origData.length !== upData.length) {
    results.collections.push({
      file: f,
      status: 'FAILED',
      reason: `Record count mismatch: orig=${origData.length}, up=${upData.length}`
    });
    results.allPassed = false;
    return;
  }

  // Check 2: ID match
  let idMismatch = 0;
  for (let i = 0; i < origData.length; i++) {
    const oId = origData[i]._id ? (origData[i]._id.$oid || origData[i]._id) : null;
    const uId = upData[i]._id ? (upData[i]._id.$oid || upData[i]._id) : null;
    if (oId !== uId) {
      idMismatch++;
    }
  }

  if (idMismatch > 0) {
    results.collections.push({
      file: f,
      status: 'FAILED',
      reason: `Found ${idMismatch} ID mismatches`
    });
    results.allPassed = false;
    return;
  }

  // Specific collection checks
  let notes = [];
  if (f === 'test.movies.json') {
    const adfghsdf = upData.find(m => m.name === 'adfghsdf');
    const hellomf = upData.find(m => m.name === 'hellomotherfucker');
    const mai = upData.find(m => m.name === 'Mai');
    const mai123 = upData.find(m => m.name === 'MAI 123');

    if (!adfghsdf || !adfghsdf.destroy) {
      results.allPassed = false;
      notes.push('adfghsdf is not soft-deleted!');
    }
    if (!hellomf || !hellomf.destroy) {
      results.allPassed = false;
      notes.push('hellomotherfucker is not soft-deleted!');
    }
    if (!mai || mai.slug !== 'mai') {
      results.allPassed = false;
      notes.push('Mai was not correctly renamed!');
    }
    if (mai123) {
      results.allPassed = false;
      notes.push('MAI 123 still exists!');
    }
    const missingSub = upData.filter(m => !m.subtitleType || m.subtitleType.length === 0);
    if (missingSub.length > 0) {
      results.allPassed = false;
      notes.push(`${missingSub.length} movies missing subtitleType!`);
    }
  } else if (f === 'test.cinemas.json') {
    const c = upData[0];
    if (!c.city || !c.hotline || !c.amenities || c.amenities.length === 0) {
      results.allPassed = false;
      notes.push('Cinema missing city, hotline or amenities!');
    }
  } else if (f === 'test.screeningrooms.json') {
    const missingFormat = upData.filter(r => !r.format);
    if (missingFormat.length > 0) {
      results.allPassed = false;
      notes.push(`${missingFormat.length} rooms missing format!`);
    }
  }

  results.collections.push({
    file: f,
    records: origData.length,
    status: notes.length === 0 ? 'PASSED' : 'FAILED',
    notes: notes.join('; ') || 'OK'
  });
});

console.log('VALIDATION RESULT: ALL PASSED?', results.allPassed);
console.log(JSON.stringify(results.collections, null, 2));

// Save reports
fs.writeFileSync(path.join(reportsDir, '03_validation_report.json'), JSON.stringify(results, null, 2), 'utf8');

const mdReport = `# Data Upgrade Validation Report
**Timestamp**: ${results.timestamp}
**Status**: ${results.allPassed ? '✅ PASSED' : '❌ FAILED'}
**Total Collections**: ${results.totalCollections}

| Collection | Records | Status | Details |
|---|---|---|---|
${results.collections.map(c => `| ${c.file} | ${c.records} | ${c.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'} | ${c.notes} |`).join('\n')}
`;

fs.writeFileSync(path.join(reportsDir, '03_validation_report.md'), mdReport, 'utf8');
console.log('✓ Saved 03_validation_report.json & .md');

// Save self to BE/data-upgrade/scripts/03_validate.cjs
const selfContent = fs.readFileSync(__filename, 'utf8');
fs.writeFileSync(path.join(scriptsDir, '03_validate.cjs'), selfContent, 'utf8');
console.log('✓ Saved 03_validate.cjs');
