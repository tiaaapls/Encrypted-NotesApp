function login(username, password) {
    const loginData = { username, password };

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json()) 
    .then(result => {
        console.log(result); 
        
        if (result.token) {
            alert("Login berhasil!");
            localStorage.setItem("token", result.token);
            localStorage.setItem("user_id", result.user_id);
            localStorage.setItem("nama_lengkap", result.nama_lengkap);
            console.log("Token tersimpan:", localStorage.getItem("token"));
            window.location.href = "dashboard.html";
        } else {
            alert("Login gagal: " + (result.message || "Terjadi kesalahan."));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat login.");
    });
}

function register(namaLengkap, email, username, password) {
    const registerData = { nama_lengkap: namaLengkap, email, username, password };

    fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
    })
    .then(response => {
        if (!response.ok) {  
            return Promise.reject('Registrasi gagal dengan status: ' + response.status); 
        }
        return response.json(); 
    })
    .then(result => {
        console.log(result); 

        if (result && result.message) { 
            alert("Registrasi berhasil!");
            window.location.href = "login.html";
        } else {
            alert("Registrasi gagal: " + (result.message || "Terjadi kesalahan."));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat registrasi.");
    });
}

function handleLoginFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    login(username, password);
}

function handleRegisterFormSubmit(event) {
    event.preventDefault();

    const namaLengkap = document.getElementById("namaLengkap").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    register(namaLengkap, email, username, password);
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof CryptoJS === "undefined") {
        console.error("CryptoJS belum dimuat. Pastikan Anda menyertakan pustaka CryptoJS.");
        return;
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutButton = document.querySelector(".logout");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginFormSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegisterFormSubmit);
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
});

function logout() {
    const confirmLogout = confirm("Apakah kamu yakin ingin logout?");

    if (confirmLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("nama_lengkap");

        alert("Logout berhasil!");
        window.location.href = "login.html";
    }
}
