function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

async function submitNewNote(e) {
    e.preventDefault();

    const noteInput = document.getElementById("notesInput");
    const keyInput = document.getElementById("keyInput");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!noteInput || !keyInput) return;

    const plainText = noteInput.value.trim();
    const password = keyInput.value.trim();

    if (!plainText || !password) {
        alert("Catatan dan kunci rahasia wajib diisi!");
        return;
    }

    try {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 1000,
        });

        const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv: iv }).toString();

        const response = await fetch("http://localhost:5000/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                user_id: userId,
                encrypted_note: encrypted,
                iv: iv.toString(CryptoJS.enc.Hex),
                salt: salt.toString(CryptoJS.enc.Hex)
            }),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Catatan berhasil dienkripsi!");
            noteInput.value = "";
            keyInput.value = "";
            closeAddNoteModal();
            loadNotes(); 
        } else {
            alert(result.message || "Gagal menyimpan catatan.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat enkripsi catatan.");
    }
}

async function loadNotes() {
    const notesTable = document.getElementById("notesTable");
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    try {
        const response = await fetch("http://localhost:5000/api/notes/list", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: user_id })
        });

        const data = await response.json();
        const notes = data.notes;

        if (!Array.isArray(notes)) throw new Error("Data tidak valid");

        notesTable.innerHTML = "";

        notes.forEach((note, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${note.name}</td>
                <td>${note.status === "decrypted" ? "Terdekripsi" : "Terenkripsi"}</td>
                <td>${formatDate(note.created_at)}</td>
                <td>
                    <div class="btn-container">
                        <button class="btnEncrypt">Enkripsi</button>
                        <button class="btnDelete" style="background-color: red; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 5px;">Hapus</button>
                    </div>
                </td>
            `;

            const encryptBtn = row.querySelector(".btnEncrypt");
            encryptBtn.addEventListener("click", () => {
                showEncryptModal(note.encrypted_note);
            });

            const deleteBtn = row.querySelector(".btnDelete");
            deleteBtn.addEventListener("click", async () => {
                const confirmDelete = confirm("Yakin ingin menghapus catatan ini?");
                if (!confirmDelete) return;

                try {
                    const deleteRes = await fetch(`http://localhost:5000/api/notes/${note.id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (deleteRes.ok) {
                        alert("Catatan berhasil dihapus.");
                        loadNotes(); 
                    } else {
                        alert("Gagal menghapus catatan.");
                    }
                } catch (err) {
                    console.error("Error hapus:", err);
                }
            });

            notesTable.appendChild(row);
        });

    } catch (error) {
        console.error("Gagal memuat data:", error);
        notesTable.innerHTML = "<tr><td colspan='5'>Gagal memuat data.</td></tr>";
    }
}

// === MODAL ===

function showAddNoteModal() {
    const modalHtml = `
        <div id="addNoteModal" class="modal" style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: #fff; padding: 20px; border-radius: 10px; width: 350px;">
                <span class="closeBtn" style="float:right; cursor:pointer;">&times;</span>
                <h3 style="margin-bottom: 12px; text-align: center">Tambah Catatan Baru</h3>
                <p style="text-align: left; margin-bottom: 6px;">Catatan:</p>
                <textarea id="notesInput" placeholder="Tulis catatan..." style="width: 100%; height: 100px; padding: 8px;"></textarea>
                <p style="text-align: left; margin-top: 10px; margin-bottom: 6px;">Key:</p>
                <input type="password" id="keyInput" placeholder="Masukkan kunci" style="width: 100%; padding: 8px; margin-bottom: 12px;">
                <button id="btnEnkripsi" style="padding: 8px 16px;">Enkripsi</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    document.querySelector(".closeBtn").addEventListener("click", closeAddNoteModal);
    document.getElementById("btnEnkripsi").addEventListener("click", submitNewNote);
}

function closeAddNoteModal() {
    const modal = document.getElementById("addNoteModal");
    if (modal) modal.remove();
}

function showEncryptModal(content) {
    const modalHtml = `
        <div id="encryptedModal" class="modal" style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: #fff; padding: 20px; border-radius: 10px; width: 350px; text-align: center;">
                <span class="closeBtn" style="float:right; cursor:pointer;">&times;</span>
                <p>Hasil Enkripsi Catatan:</p>
                <textarea readonly style="width: 100%; height: 150px; padding: 8px;">${content}</textarea>
                <button id="closeEncryptedBtn" style="margin-top: 10px; padding: 6px 12px;">Tutup</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    document.querySelector(".closeBtn").addEventListener("click", closeEncryptedModal);
    document.getElementById("closeEncryptedBtn").addEventListener("click", closeEncryptedModal);
}

function closeEncryptedModal() {
    const modal = document.getElementById("encryptedModal");
    if (modal) modal.remove();
}
