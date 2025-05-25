import * as SQLite from "expo-sqlite";

class DatabaseHelper {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync("GeoTag.db");
  }

  createTables() {
    this.db.withTransactionSync(() => {
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS CalibratedRooms (
          roomName TEXT PRIMARY KEY,
          minLat REAL,
          maxLat REAL,
          minLon REAL,
          maxLon REAL
        );
      `);
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS Lights (
          lightName TEXT,
          roomName TEXT,
          brightness INTEGER,
          manualControl INTEGER,
          FOREIGN KEY (roomName) REFERENCES CalibratedRooms(roomName)
        );
      `);
    });
  }

  async getCalibratedRooms() {
    return await this.db.getAllAsync("SELECT * FROM CalibratedRooms");
  }
}

export default new DatabaseHelper();
