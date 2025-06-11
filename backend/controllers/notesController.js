const db = require("../config/db");

const encryptNotes = (req, res) => {
    const { user_id, encrypted_note, iv, salt } = req.body;

    if (!user_id || !encrypted_note || !iv || !salt) {
        return res.status(400).json({ message: "Data tidak lengkap!" });
    }

    const countQuery = "SELECT COUNT(*) AS total FROM notes WHERE user_id = ?";
    db.query(countQuery, [user_id], (countErr, countResult) => {
        if (countErr) {
            console.error("Gagal menghitung catatan:", countErr);
            return res.status(500).json({ message: "Gagal menyimpan catatan." });
        }

        const totalNotes = countResult[0].total;
        const name = `Catatan ${totalNotes + 1}`;
        const status = "Terenkripsi";

        const insertQuery = "INSERT INTO notes (user_id, name, notes, iv, salt, status) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(
            insertQuery,
            [user_id, name, encrypted_note, iv, salt, "Terenkripsi"],
            (err, result) => {
                if (err) {
                    console.error("Gagal menyimpan catatan:", err);
                    return res.status(500).json({ message: "Gagal menyimpan catatan." });
                }
                res.status(201).json({ message: "Catatan berhasil dienkripsi!", noteId: result.insertId });
            }
        );
    });
};

const decryptedNotes = (req, res) => {
    const user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "User ID tidak ditemukan!" });
    }

    const sql = "SELECT * FROM notes WHERE user_id = ?";
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Gagal ambil catatan:", err);
            return res.status(500).json({ message: "Terjadi kesalahan server!" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Catatan tidak ditemukan!" });
        }
        const notesList = results.map(note => ({
            id: note.id,
            name: note.name,
            encrypted_note: note.notes,
            status: note.status,
            salt: note.salt,
            iv: note.iv,
            created_at: note.created_at
        }));

        res.status(200).json({ notes: notesList });
    });
};

const updateNoteStatus = (req, res) => {
    const note_id = req.params.id;

    if (!note_id) {
        return res.status(400).json({ message: "Note ID tidak ditemukan!" });
    }

    const sql = "UPDATE notes SET status = 'Terdekripsi' WHERE id = ?";
    db.query(sql, [note_id], (err, result) => {
        if (err) {
            console.error("Gagal update status:", err);
            return res.status(500).json({ message: "Gagal update status catatan." });
        }

        res.status(200).json({ message: "Status catatan berhasil diperbarui." });
    });
};

const getNoteStatistics = (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "User ID tidak ditemukan!" });
    }

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM notes WHERE user_id = ?) AS total,
            (SELECT COUNT(*) FROM notes WHERE user_id = ? AND status = 'Terenkripsi') AS jumlah_terenkripsi,
            (SELECT COUNT(*) FROM notes WHERE user_id = ? AND status = 'Terdekripsi') AS jumlah_terdekripsi,
            (SELECT nama_lengkap FROM users WHERE id = ?) AS nama_lengkap
    `;

    db.query(sql, [user_id, user_id, user_id, user_id], (err, result) => {
        if (err) {
            console.error("Gagal ambil statistik:", err);
            return res.status(500).json({ message: "Gagal ambil data statistik." });
        }

        res.status(200).json(result[0]);
    });
};

const deleteNote = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "ID catatan diperlukan!" });
    }

    const sql = "DELETE FROM notes WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Gagal hapus catatan:", err);
            return res.status(500).json({ message: "Terjadi kesalahan server!" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Catatan tidak ditemukan!" });
        }

        res.json({ message: "Catatan berhasil dihapus!" });
    });
};

module.exports = {
    encryptNotes,
    decryptedNotes,
    updateNoteStatus,
    getNoteStatistics,
    deleteNote
};