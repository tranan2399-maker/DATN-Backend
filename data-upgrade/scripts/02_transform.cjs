const fs = require('fs');
const path = require('path');

const beDir = 'E:/my study/FPT Polytechnic/DATN/BE/Graduation_Project_BE-main';
const origDir = path.join(beDir, 'data-upgrade/original');
const upDir = path.join(beDir, 'data-upgrade/upgraded');
const scriptsDir = path.join(beDir, 'data-upgrade/scripts');

if (!fs.existsSync(upDir)) {
  fs.mkdirSync(upDir, { recursive: true });
}

const files = fs.readdirSync(origDir).filter(f => f.endsWith('.json'));

let stats = {
  moviesUpdated: 0,
  junkSoftDeleted: 0,
  cinemasUpdated: 0,
  roomsUpdated: 0,
  filesProcessed: 0
};

files.forEach(filename => {
  const content = fs.readFileSync(path.join(origDir, filename), 'utf8');
  let data = JSON.parse(content);

  if (filename === 'test.movies.json') {
    data = data.map(m => {
      // 1. Soft delete junk
      if (m.name === 'adfghsdf' || m.name === 'hellomotherfucker') {
        m.destroy = true;
        stats.junkSoftDeleted++;
      }
      // 2. Rename MAI 123 -> Mai
      if (m.name === 'MAI 123') {
        m.name = 'Mai';
        m.slug = 'mai';
        stats.moviesUpdated++;
      }
      // 3. Subtitle / audio format
      if (!m.subtitleType || m.subtitleType.length === 0) {
        if (m.name === 'KATAK: THE BRAVE BELUGA' || m.name === 'Migration') {
          m.subtitleType = ['Lồng tiếng', 'Phụ đề'];
        } else {
          m.subtitleType = ['Phụ đề'];
        }
      }
      // 4. Featured flag
      if (['Oppenheimer', 'Mai', 'WONKA HOLA', 'AQUAMAN AND THE LOST KINGDOM'].includes(m.name)) {
        m.isFeatured = true;
      }
      return m;
    });
  } else if (filename === 'test.cinemas.json') {
    data = data.map(c => {
      c.city = 'Đà Nẵng';
      c.hotline = '1900 2099';
      c.amenities = [
        'Âm thanh Dolby Atmos',
        'Ghế da cao cấp',
        'Máy lạnh',
        'Bắp rang bơ',
        'Phòng chiếu quốc tế'
      ];
      stats.cinemasUpdated++;
      return c;
    });
  } else if (filename === 'test.screeningrooms.json') {
    const formatMap = {
      'Phòng chiếu 1': 'IMAX',
      'Phòng chiếu 2': '3D',
      'Phòng chiếu 3': '2D',
      'Phòng chiếu 5': 'ScreenX',
      'Phòng chiếu 6': '4DX',
      'Phòng chiếu 7': '2D'
    };
    data = data.map(r => {
      r.format = formatMap[r.name] || '2D';
      stats.roomsUpdated++;
      return r;
    });
  }

  // Target filename: e.g. test.movies.upgraded.json
  const outName = filename.replace('.json', '.upgraded.json');
  fs.writeFileSync(path.join(upDir, outName), JSON.stringify(data, null, 2), 'utf8');
  stats.filesProcessed++;
});

console.log('TRANSFORM SUMMARY:', stats);

// Save self to BE/data-upgrade/scripts/02_transform.cjs
const selfContent = fs.readFileSync(__filename, 'utf8');
fs.writeFileSync(path.join(scriptsDir, '02_transform.cjs'), selfContent, 'utf8');
console.log('✓ Saved 02_transform.cjs');
