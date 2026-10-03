/**
 * 04_import_test_db.cjs
 * Imports upgraded JSON collections into cine_redesign_test database.
 * Safety guard: MUST pass --confirm-db-name=cine_redesign_test
 */
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const args = process.argv.slice(2);
const confirmArg = args.find(a => a.startsWith('--confirm-db-name='));
const targetDbName = confirmArg ? confirmArg.split('=')[1] : null;

if (targetDbName !== 'cine_redesign_test') {
  console.error('❌ SAFETY ABORT: You must specify --confirm-db-name=cine_redesign_test to run this script.');
  process.exit(1);
}

const MONGO_URI = process.env.DATABASE_API || 'mongodb://127.0.0.1:27017';
const upDir = path.join(__dirname, '../upgraded');

function deserializeBSON(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deserializeBSON);

  if ('$oid' in obj && Object.keys(obj).length === 1) {
    return new ObjectId(obj.$oid);
  }
  if ('$date' in obj && Object.keys(obj).length === 1) {
    return new Date(obj.$date);
  }

  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = deserializeBSON(v);
  }
  return result;
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log(`✓ Connected to Mongo. Target DB: ${targetDbName}`);
    const db = client.db(targetDbName);

    const files = fs.readdirSync(upDir).filter(f => f.endsWith('.upgraded.json'));

    for (const file of files) {
      // e.g. test.movies.upgraded.json -> collection: movies
      const collName = file.replace('test.', '').replace('.upgraded.json', '');
      const rawData = JSON.parse(fs.readFileSync(path.join(upDir, file), 'utf8'));
      const docs = deserializeBSON(rawData);

      if (docs.length > 0) {
        await db.collection(collName).deleteMany({});
        await db.collection(collName).insertMany(docs);
        console.log(`✓ [${collName}] Imported ${docs.length} documents.`);
      }
    }
    console.log('✅ Import to cine_redesign_test completed successfully.');
  } catch (err) {
    console.error('❌ Import failed:', err);
  } finally {
    await client.close();
  }
}

run();
