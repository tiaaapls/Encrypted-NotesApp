const db = require("../config/db");

const createUser = (nama_lengkap, email, username, hashedPassword, callback) => {
    const sql = "INSERT INTO users (nama_lengkap, email, username, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [nama_lengkap, email, username, hashedPassword], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

const findUserByUsername = (username, callback) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, result) => {
        if (err) return callback(err, null);
        if (result.length === 0) return callback(null, null);

        let user = result[0];
        return callback(null, user);
    });
};

const findUserById = (id, callback) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err, null);
        if (result.length === 0) return callback(null, null);

        let user = result[0];
        return callback(null, user);
    });
};

module.exports = {
    createUser,
    findUserByUsername,
    findUserById,
};