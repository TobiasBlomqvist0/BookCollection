exports.db = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data/database.db"
    }
});