const API_BASE_URL = "http://localhost:8080";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("lms_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to parse stored user", e);
    return null;
  }
}

function storeUser(user) {
  localStorage.setItem("lms_user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("lms_user");
}

async function apiRequest(path, options = {}) {
  const url = API_BASE_URL + path;
  const baseHeaders = { "Content-Type": "application/json" };
  const opts = {
    method: "GET",
    ...options,
    headers: { ...baseHeaders, ...(options.headers || {}) },
  };

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

// Auth flows

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const errorBox = document.getElementById("login-error");

  errorBox.classList.add("hidden");
  errorBox.textContent = "";

  try {
    const user = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    storeUser(user);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorBox.textContent = err.message || "Login failed";
    errorBox.classList.remove("hidden");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const role = form.role.value || "MEMBER";

  const errorBox = document.getElementById("register-error");
  const successBox = document.getElementById("register-success");

  errorBox.classList.add("hidden");
  errorBox.textContent = "";
  successBox.classList.add("hidden");
  successBox.textContent = "";

  try {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    successBox.textContent = "Registration successful. You can now log in.";
    successBox.classList.remove("hidden");
    form.reset();
  } catch (err) {
    errorBox.textContent = err.message || "Registration failed";
    errorBox.classList.remove("hidden");
  }
}

// Dashboard

async function loadDashboard() {
  const user = getStoredUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");
  const userRoleEl = document.getElementById("user-role");
  const booksContainer = document.getElementById("books-container");
  const booksEmptyEl = document.getElementById("books-empty");
  const dashboardError = document.getElementById("dashboard-error");

  userNameEl.textContent = user.name;
  userEmailEl.textContent = user.email;
  userRoleEl.textContent = user.role;

  dashboardError.classList.add("hidden");
  dashboardError.textContent = "";
  booksContainer.innerHTML = "";
  booksEmptyEl.classList.add("hidden");

  try {
    const books = await apiRequest("/api/books");
    if (!books || books.length === 0) {
      booksEmptyEl.classList.remove("hidden");
      return;
    }

    books.forEach((book) => {
      const card = document.createElement("div");
      card.className = "book-card";

      const title = document.createElement("div");
      title.className = "book-title";
      title.textContent = book.title;

      const meta = document.createElement("div");
      meta.className = "book-meta";
      meta.textContent = `${book.author} • ISBN: ${book.isbn}`;

      const availability = document.createElement("div");
      availability.className =
        (book.availableCopies ?? 0) > 0 ? "tag-available" : "tag-unavailable";
      availability.textContent =
        (book.availableCopies ?? 0) > 0
          ? `Available: ${book.availableCopies}/${book.totalCopies}`
          : "Not available";

      const actions = document.createElement("div");
      actions.className = "book-actions";

      const issueBtn = document.createElement("button");
      issueBtn.className = "btn btn-secondary";
      issueBtn.textContent = "Issue";
      issueBtn.disabled = (book.availableCopies ?? 0) <= 0;
      issueBtn.onclick = () => issueBookForUser(user, book.id);

      const info = document.createElement("span");
      info.className = "muted";
      info.textContent = "Return is by transaction ID for now.";

      actions.appendChild(issueBtn);
      actions.appendChild(info);

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(availability);
      card.appendChild(actions);

      booksContainer.appendChild(card);
    });
  } catch (err) {
    dashboardError.textContent = err.message || "Failed to load dashboard.";
    dashboardError.classList.remove("hidden");
  }
}

async function issueBookForUser(user, bookId) {
  const dashboardError = document.getElementById("dashboard-error");
  dashboardError.classList.add("hidden");
  dashboardError.textContent = "";

  try {
    const tx = await apiRequest("/api/transactions/issue", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, bookId }),
    });
    alert(
      `Book issued successfully.\nTransaction ID: ${tx.id}\nDue date: ${tx.dueDate}`
    );
    await loadDashboard();
  } catch (err) {
    dashboardError.textContent = err.message || "Failed to issue book.";
    dashboardError.classList.remove("hidden");
  }
}

async function returnByTransactionId(event) {
  event.preventDefault();
  const input = document.getElementById("return-transaction-id");
  const txId = input.value.trim();
  const dashboardError = document.getElementById("dashboard-error");

  if (!txId) return;

  dashboardError.classList.add("hidden");
  dashboardError.textContent = "";

  try {
    const tx = await apiRequest(`/api/transactions/return/${encodeURIComponent(txId)}`, {
      method: "POST",
    });
    alert(
      `Book returned.\nFine: ${tx.fineAmount != null ? tx.fineAmount : 0} currency units.`
    );
    input.value = "";
    await loadDashboard();
  } catch (err) {
    dashboardError.textContent = err.message || "Failed to return book.";
    dashboardError.classList.remove("hidden");
  }
}

function logout() {
  clearUser();
  window.location.href = "login.html";
}

