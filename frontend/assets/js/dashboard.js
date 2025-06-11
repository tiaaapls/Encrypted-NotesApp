async function loadNoteStatistics() {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!user_id || !token) {
        alert("Anda belum login.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/notes/statistics?user_id=${user_id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data statistik");
        }

        const stats = await response.json();

        const nama_lengkap = localStorage.getItem("nama_lengkap");

        document.getElementById("totalNotes").textContent = stats.total || 0;
        document.getElementById("encryptedNotes").textContent = stats.jumlah_terenkripsi || 0;
        document.getElementById("decryptedNotes").textContent = stats.jumlah_terdekripsi || 0;
        document.getElementById("welcomeMsg").textContent = `Selamat Datang, ${nama_lengkap}!`;

    } catch (error) {
        console.error("Error statistik:", error);
        document.getElementById("totalNotes").textContent = "Gagal";
        document.getElementById("encryptedNotes").textContent = "Gagal";
        document.getElementById("decryptedNotes").textContent = "Gagal";
        document.getElementById("welcomeMsg").textContent = "Selamat Datang";
    }
}

document.addEventListener("DOMContentLoaded", loadNoteStatistics);