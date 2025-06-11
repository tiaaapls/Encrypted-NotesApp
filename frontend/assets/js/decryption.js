function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

let currentNoteToDecrypt = null;

async function loadNotesToTable() {
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
                <td>${note.status === "Terdekripsi" ? "Terdekripsi" : "Terenkripsi"}</td>
                <td>${formatDate(note.created_at)}</td>
                <td>
                    <div class="btn-container">
                        <button class="btnDecrypt">Dekripsi</button>
                        <button class="btnDelete" style="background-color: red; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 5px;">Hapus</button>
                    </div>
                </td>
            `;

            const decryptBtn = row.querySelector(".btnDecrypt");
            decryptBtn.addEventListener("click", () => {
                currentNoteToDecrypt = note;
                showDecryptModal();
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
                        loadNotesToTable(); 
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

function showDecryptModal() {
    const modalHtml = `
        <div id="decryptModal" class="modal" style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: #fff; padding: 20px; border-radius: 10px; width: 300px; text-align: center;">
                <span class="closeBtn" style="float:right; cursor:pointer;">&times;</span>
                <p style="text-align: left;">Key:</p>
                <input type="password" id="decryptPassword" placeholder="Password" style="width: 100%; padding: 8px; margin: 10px 0;">
                <button id="confirmDecryptBtn" style="padding: 6px 12px;">Dekripsi</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    document.querySelector(".closeBtn").addEventListener("click", closeDecryptModal);
    document.getElementById("confirmDecryptBtn").addEventListener("click", handleDecrypt);
}

function closeDecryptModal() {
    const modal = document.getElementById("decryptModal");
    if (modal) modal.remove();
}

async function handleDecrypt() {
    const password = document.getElementById("decryptPassword").value.trim();
    if (!password) {
        alert("Masukkan password!");
        return;
    }

    const note = currentNoteToDecrypt;

    try {
        const salt = CryptoJS.enc.Hex.parse(note.salt);
        const iv = CryptoJS.enc.Hex.parse(note.iv);
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 1000,
        });

        const decrypted = CryptoJS.AES.decrypt(note.encrypted_note, key, { iv });
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

        if (!plaintext) {
            alert("Password salah atau catatan rusak.");
        } else {
            closeDecryptModal(); 
            showDecryptedModal(plaintext); 

            const token = localStorage.getItem("token");
            const updateRes = await fetch(`http://localhost:5000/api/notes/${note.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "Terdekripsi" }) 
            });

            if (updateRes.ok) {
                await loadNotesToTable();
            } else {
                console.error("Gagal update status.");
            }
        }
    } catch (err) {
        console.error("Dekripsi error:", err);
    }
}

function showDecryptedModal(content) {
    const modalHtml = `
        <div id="decryptedModal" class="modal" style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: #fff; padding: 20px; border-radius: 10px; width: 350px; text-align: center;">
                <span class="closeBtn" style="float:right; cursor:pointer;">&times;</span>
                <p>Hasil Dekripsi Catatan:</p>
                <textarea readonly style="width: 100%; height: 150px; padding: 8px;">${content}</textarea>
                <button id="closeDecryptedBtn" style="margin-top: 10px; padding: 6px 12px;">Tutup</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    document.querySelector(".closeBtn").addEventListener("click", closeDecryptedModal);
    document.getElementById("closeDecryptedBtn").addEventListener("click", closeDecryptedModal);
}

function closeDecryptedModal() {
    const modal = document.getElementById("decryptedModal");
    if (modal) modal.remove();
}