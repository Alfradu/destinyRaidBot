const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    dbPath: './db.sqlite',
    create() {
        const db = new sqlite3.Database(this.dbPath);
        db.run(`
            CREATE TABLE Raids (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Leader TEXT,
                Date INTEGER,
                Raid TEXT,
                Comment TEXT
            );
        `);
        db.close();
    }
}
