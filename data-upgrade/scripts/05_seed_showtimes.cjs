/**
 * 05_seed_showtimes.cjs
 * Seeds rolling 7-day realistic showtimes with 72 seats per showtime
 * strictly on cine_redesign_test.
 * Safety guard: MUST pass --confirm-db-name=cine_redesign_test
 */
const { MongoClient, ObjectId } = require('mongodb');

const args = process.argv.slice(2);
const confirmArg = args.find(a => a.startsWith('--confirm-db-name='));
const targetDbName = confirmArg ? confirmArg.split('=')[1] : null;

if (targetDbName !== 'cine_redesign_test') {
  console.error('❌ SAFETY ABORT: You must specify --confirm-db-name=cine_redesign_test to run this script.');
  process.exit(1);
}

const MONGO_URI = process.env.DATABASE_API || 'mongodb://127.0.0.1:27017';

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log(`✓ Connected to Mongo. Target DB: ${targetDbName}`);
    const db = client.db(targetDbName);

    const moviesColl = db.collection('movies');
    const roomsColl = db.collection('screeningrooms');
    const showtimesColl = db.collection('showtimes');
    const seatsColl = db.collection('seats');

    const activeMovies = await moviesColl.find({ destroy: false, status: 'IS_SHOWING' }).toArray();
    const rooms = await roomsColl.find({ destroy: false }).toArray();

    if (activeMovies.length === 0 || rooms.length === 0) {
      console.warn('⚠️ No active movies or rooms found. Please run 04_import_test_db.cjs first.');
      return;
    }

    console.log(`Found ${activeMovies.length} active movies and ${rooms.length} screening rooms.`);

    // Daily time slots: 09:30, 13:00, 16:30, 20:00
    const slotTimes = [
      { startH: 9, startM: 30, durationM: 120 },
      { startH: 13, startM: 0, durationM: 120 },
      { startH: 16, startM: 30, durationM: 120 },
      { startH: 20, startM: 0, durationM: 120 }
    ];

    let createdShowtimes = 0;
    let createdSeats = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);

      for (let rIdx = 0; rIdx < rooms.length; rIdx++) {
        const room = rooms[rIdx];
        // Assign movies in round-robin fashion
        const movie = activeMovies[(dayOffset + rIdx) % activeMovies.length];

        for (const slot of slotTimes) {
          const timeFrom = new Date(currentDay);
          timeFrom.setHours(slot.startH, slot.startM, 0, 0);

          const timeTo = new Date(timeFrom.getTime() + slot.durationM * 60 * 1000);

          const showtimeId = new ObjectId();
          const seatIds = [];
          const seatsToInsert = [];

          // Generate 72 seats: 8 rows x 9 columns
          for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 9; col++) {
              const seatId = new ObjectId();
              seatIds.push(seatId);
              const isVip = row >= 3 && row <= 6;
              seatsToInsert.push({
                _id: seatId,
                typeSeat: isVip ? 'VIP' : 'normal',
                price: isVip ? 95000 : 75000,
                row,
                column: col,
                status: 'Available',
                ScreeningRoomId: room._id,
                ShowScheduleId: showtimeId,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }

          await seatsColl.insertMany(seatsToInsert);
          createdSeats += seatsToInsert.length;

          const showtimeDoc = {
            _id: showtimeId,
            screenRoomId: room._id,
            movieId: movie._id,
            date: currentDay,
            timeFrom,
            timeTo,
            status: 'Available',
            SeatId: seatIds,
            destroy: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await showtimesColl.insertOne(showtimeDoc);
          createdShowtimes++;

          // Link showtime to room and movie
          await roomsColl.updateOne({ _id: room._id }, { $addToSet: { ShowtimesId: showtimeId } });
          await moviesColl.updateOne({ _id: movie._id }, { $addToSet: { showTimes: showtimeId } });
        }
      }
    }

    console.log(`✅ Seeded ${createdShowtimes} showtimes and ${createdSeats} seats across 7 days for test database.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.close();
  }
}

run();
