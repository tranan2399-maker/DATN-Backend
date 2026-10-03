const fs = require('fs');
const path = require('path');

const beDir = 'E:/my study/FPT Polytechnic/DATN/BE/Graduation_Project_BE-main';
const scriptsDir = path.join(beDir, 'data-upgrade/scripts');

// 1. Movie.js
const moviePath = path.join(beDir, 'src/model/Movie.js');
let movieCode = fs.readFileSync(moviePath, 'utf8');
if (!movieCode.includes('subtitleType:')) {
  movieCode = movieCode.replace(
    'isFeatured: {',
    "subtitleType: {\n      type: [String],\n      default: ['Phụ đề']\n    },\n    isFeatured: {"
  );
  fs.writeFileSync(moviePath, movieCode, 'utf8');
  console.log('✓ Updated Movie.js');
} else {
  console.log('- Movie.js already has subtitleType');
}

// 2. ScreenRoom.js
const screenRoomPath = path.join(beDir, 'src/model/ScreenRoom.js');
let screenRoomCode = fs.readFileSync(screenRoomPath, 'utf8');
if (!screenRoomCode.includes('FORMAT_2D')) {
  const insertConsts = `export const FORMAT_2D = '2D'\nexport const FORMAT_3D = '3D'\nexport const FORMAT_IMAX = 'IMAX'\nexport const FORMAT_4DX = '4DX'\nexport const FORMAT_SCREENX = 'ScreenX'\nexport const screenFormats = [FORMAT_2D, FORMAT_3D, FORMAT_IMAX, FORMAT_4DX, FORMAT_SCREENX]\n`;
  screenRoomCode = screenRoomCode.replace('export const projectors', insertConsts + 'export const projectors');
  screenRoomCode = screenRoomCode.replace(
    'projector: {',
    "format: {\n      type: String,\n      enum: screenFormats,\n      default: FORMAT_2D\n    },\n    projector: {"
  );
  fs.writeFileSync(screenRoomPath, screenRoomCode, 'utf8');
  console.log('✓ Updated ScreenRoom.js');
} else {
  console.log('- ScreenRoom.js already has format');
}

// 3. Cinema.js
const cinemaPath = path.join(beDir, 'src/model/Cinema.js');
let cinemaCode = fs.readFileSync(cinemaPath, 'utf8');
if (!cinemaCode.includes('city:')) {
  cinemaCode = cinemaCode.replace(
    'ScreeningRoomId: {',
    "city: {\n      type: String,\n      default: ''\n    },\n    amenities: {\n      type: [String],\n      default: []\n    },\n    hotline: {\n      type: String,\n      default: ''\n    },\n    ScreeningRoomId: {"
  );
  fs.writeFileSync(cinemaPath, cinemaCode, 'utf8');
  console.log('✓ Updated Cinema.js');
} else {
  console.log('- Cinema.js already has city');
}

// 4. validations/movie.js
const valMoviePath = path.join(beDir, 'src/validations/movie.js');
let valMovieCode = fs.readFileSync(valMoviePath, 'utf8');
if (!valMovieCode.includes('subtitleType:')) {
  valMovieCode = valMovieCode.replace(
    'actor: Joi.string()',
    "isFeatured: Joi.boolean(),\n  backdrop: Joi.string().allow(''),\n  subtitleType: Joi.array().items(Joi.string()),\n  slug: Joi.string().allow(''),\n  destroy: Joi.boolean(),\n  actor: Joi.string()"
  );
  fs.writeFileSync(valMoviePath, valMovieCode, 'utf8');
  console.log('✓ Updated validations/movie.js');
} else {
  console.log('- validations/movie.js already updated');
}

// 5. validations/screenRoom.js
const valScreenPath = path.join(beDir, 'src/validations/screenRoom.js');
let valScreenCode = fs.readFileSync(valScreenPath, 'utf8');
if (!valScreenCode.includes('format:')) {
  valScreenCode = valScreenCode.replace(
    'projector: Joi.string()',
    "format: Joi.string().valid('2D', '3D', 'IMAX', '4DX', 'ScreenX'),\n  projector: Joi.string()"
  );
  fs.writeFileSync(valScreenPath, valScreenCode, 'utf8');
  console.log('✓ Updated validations/screenRoom.js');
} else {
  console.log('- validations/screenRoom.js already updated');
}

// 6. validations/cinema.js
const valCinemaPath = path.join(beDir, 'src/validations/cinema.js');
let valCinemaCode = fs.readFileSync(valCinemaPath, 'utf8');
if (!valCinemaCode.includes('city:')) {
  valCinemaCode = valCinemaCode.replace(
    'CinemaAdress: Joi.string().required(),',
    "CinemaAdress: Joi.string().required(),\n  city: Joi.string().allow(''),\n  amenities: Joi.array().items(Joi.string()),\n  hotline: Joi.string().allow(''),"
  );
  fs.writeFileSync(valCinemaPath, valCinemaCode, 'utf8');
  console.log('✓ Updated validations/cinema.js');
} else {
  console.log('- validations/cinema.js already updated');
}

// Also copy this script into BE/data-upgrade/scripts/01_apply_schema.cjs for persistent record
const selfContent = fs.readFileSync(__filename, 'utf8');
fs.writeFileSync(path.join(scriptsDir, '01_apply_schema.cjs'), selfContent, 'utf8');
console.log('✓ Saved to BE/data-upgrade/scripts/01_apply_schema.cjs');
