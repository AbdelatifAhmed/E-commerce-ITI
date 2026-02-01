const loginBtn = document.getElementById('show-login');
const registerBtn = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

registerBtn.onclick = () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active');
};

loginBtn.onclick = () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
};


registerForm.onsubmit = (e) => {
    const fullName = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    e.preventDefault();


    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(u => u.email === email)) {
        return alert("This email is already exists!");
    }

    const newUser = {
        id: Date.now(),
        name: fullName,
        email,
        password: pass,
        cart: [],
        wishlist: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registered Successfully! You can log in now.");
    loginBtn.click();
};
loginForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Welcome ${user.name}`);
        window.location.href = 'index.html';
    } else {
        alert(" Invalid email or password!");
    }
};

const fullName = document.getElementById('reg-name');

fullName.addEventListener('input', function () {
    const regNameError = document.getElementById('reg-name-error');
    const regNameRegex = /^[a-z]{3,}$/i;
    
    if (regNameRegex.test(fullName.value)) {
        regNameError.style.display = 'none';
    }
    else {
        regNameError.style.display = 'block';
        regNameError.style.fontSize = '12px';
        regNameError.style.color = 'red';
        regNameError.textContent = 'Full name must be at least 3 characters long';
    }
})

const regEmail = document.getElementById('reg-email');
regEmail.addEventListener('input', function () {
    const regEmailError = document.getElementById('reg-email-error');
    const regEmailRegex = /^[a-z0-9._]+@(gmail|yahoo|outlook)\.com$/i;
    if (regEmailRegex.test(regEmail.value)) {
        regEmailError.style.display = 'none';
    }
    else {
        regEmailError.style.display = 'block';
        regEmailError.style.fontSize = '12px';
        regEmailError.style.color = 'red';
        regEmailError.textContent = 'Invalid email address';
    }
})

const regPass = document.getElementById('reg-pass');
regPass.addEventListener('input', function () {
    const regPassError = document.getElementById('reg-password-error');
    const regPassRegex = /^[a-zA-Z0-9]{8,}$/;
    if (regPassRegex.test(regPass.value)) {
        regPassError.style.display = 'none';
    }
    else {
        regPassError.style.display = 'block';
        regPassError.style.fontSize = '12px';
        regPassError.style.color = 'red';
        regPassError.textContent = 'Password must be at least 8 characters long';
    }
})

