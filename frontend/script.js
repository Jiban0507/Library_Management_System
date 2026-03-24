// @ts-nocheck
const API_BASE_URL = "https://library-management-system-s7gj.onrender.com";

// ---------- USER STORAGE ----------
function getStoredUser() { return JSON.parse(localStorage.getItem("lms_user")); }
function storeUser(user) { localStorage.setItem("lms_user", JSON.stringify(user)); }
function clearUser() { localStorage.removeItem("lms_user"); }

// ---------- API REQUEST ----------
async function apiRequest(path, options = {}) {
  const res = await fetch(API_BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch(e){}
  if(!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// ---------- DASHBOARD ----------
let allBooks = [];
async function loadDashboard(){
  const user = getStoredUser();
  if(!user) return window.location.href="login.html";

  document.getElementById("user-name").innerText=user.name;
  document.getElementById("user-email").innerText=user.email;
  document.getElementById("user-role").innerText=user.role;

  if(user.role==="ADMIN") document.getElementById("admin-panel").style.display="block";
  else document.getElementById("admin-panel").style.display="none";

  allBooks = await apiRequest("/api/books");
  renderBooks(allBooks);
}

// ---------- RENDER BOOKS ----------
function renderBooks(books){
  const user = getStoredUser();
  const container = document.getElementById("books-container");
  container.innerHTML="";

  if(books.length===0){
    container.innerHTML="<p class='muted'>No books found</p>";
    return;
  }

  books.forEach(book=>{
    const div = document.createElement("div");
    div.className="book-card";
    div.classList.add(book.availableCopies>0 ? "available" : "unavailable");
    div.innerHTML = `
      <div class="book-title">${book.title}</div>
      <div class="book-meta">Author: ${book.author}</div>
      <div class="book-meta">ISBN: ${book.isbn}</div>
      <div class="book-meta">Available: ${book.availableCopies}/${book.totalCopies}</div>
    `;

    const actionsDiv = document.createElement("div");
    actionsDiv.className="book-actions";

    if(book.availableCopies>0 && (!user.issuedBooks || !user.issuedBooks.includes(book.id))){
      const btn = document.createElement("button");
      btn.innerText="Issue";
      btn.className="btn-issue";
      btn.onclick = ()=>issueBook(book.id);
      actionsDiv.appendChild(btn);
    } else if(user.issuedBooks && user.issuedBooks.includes(book.id)){
      const span = document.createElement("span");
      span.className="muted";
      span.innerText="Already Issued";
      actionsDiv.appendChild(span);
    } else {
      const span = document.createElement("span");
      span.className="muted";
      span.innerText="Not Available";
      actionsDiv.appendChild(span);
    }

    if(user.role==="ADMIN"){
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText="Delete";
      deleteBtn.className="btn-delete";
      deleteBtn.onclick=()=>deleteBook(book.id);
      actionsDiv.appendChild(deleteBtn);
    }

    div.appendChild(actionsDiv);
    container.appendChild(div);
  });
}

// ---------- SEARCH ----------
function searchBooks(){
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  if(!query) renderBooks(allBooks);
  else{
    const filtered = allBooks.filter(b=>
      b.title.toLowerCase().includes(query) || 
      b.author.toLowerCase().includes(query) ||
      b.isbn.toLowerCase().includes(query)
    );
    renderBooks(filtered.length ? filtered : []);
  }
}

// ---------- ADD BOOK ----------
function showAddBookForm(){ 
  const user = getStoredUser();
  if(user.role !== "ADMIN") return;
  const form = document.getElementById("add-book-form");
  form.style.display = form.style.display === "block" ? "none" : "block";
}

async function addBook(){
  const user = getStoredUser();
  if(user.role !== "ADMIN"){ alert("Members cannot add books!"); return; }

  const title=document.getElementById("book-title").value.trim();
  const author=document.getElementById("book-author").value.trim();
  const isbn=document.getElementById("book-isbn").value.trim();
  const copies=parseInt(document.getElementById("book-copies").value);

  if(!title || !author || !isbn || !copies){ alert("Please fill all fields"); return; }

  await apiRequest("/api/books",{
    method:"POST",
    body:JSON.stringify({title,author,isbn,totalCopies:copies,availableCopies:copies})
  });

  alert("Book added successfully ✅");
  document.getElementById("book-title").value="";
  document.getElementById("book-author").value="";
  document.getElementById("book-isbn").value="";
  document.getElementById("book-copies").value="";
  document.getElementById("add-book-form").style.display="none";
  loadDashboard();
}

// ---------- DELETE BOOK ----------
async function deleteBook(id){
  const user = getStoredUser();
  if(user.role !== "ADMIN"){ alert("Members cannot delete books!"); return; }
  if(!confirm("Delete this book?")) return;
  await apiRequest(`/api/books/${id}`,{method:"DELETE"});
  alert("Deleted ✅");
  loadDashboard();
}

// ---------- ISSUE / RETURN ----------
async function issueBook(bookId){
  const user = getStoredUser();
  const tx = await apiRequest("/api/transactions/issue",{method:"POST",body:JSON.stringify({userId:user.id,bookId})});
  alert("Issued. Transaction ID: "+tx.id);

  user.issuedBooks = user.issuedBooks || [];
  if(!user.issuedBooks.includes(bookId)) user.issuedBooks.push(bookId);
  storeUser(user);
  loadDashboard();
}

async function returnBook(){
  const id = document.getElementById("return-transaction-id").value.trim();
  if(!id){ alert("Enter Transaction ID!"); return; }

  try{
    const tx = await apiRequest(`/api/transactions/return/${id}`,{method:"POST"});
    alert("Returned. Fine: "+tx.fineAmount);

    const user = getStoredUser();
    if(user.issuedBooks && user.issuedBooks.includes(tx.bookId)){
      user.issuedBooks = user.issuedBooks.filter(bid=>bid!==tx.bookId);
      storeUser(user);
    }
  } catch(e){ alert("Invalid Transaction ID ❌"); }

  document.getElementById("return-transaction-id").value="";
  loadDashboard();
}

// ---------- LOGOUT ----------
function logout(){ clearUser(); window.location.href="login.html"; }

const loader = document.getElementById("loader");

document.getElementById("login-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  const errorBox = document.getElementById("login-error");
  errorBox.style.display = "none";

  try {
    loader.style.display = "flex"; // Show loader

    const user = await apiRequest("/api/auth/login", {
      method:"POST",
      body: JSON.stringify({email,password})
    });

    localStorage.setItem("lms_user", JSON.stringify(user));
    window.location.href = "dashboard.html";

  } catch(err){
    errorBox.innerText = err.message || "Login failed ❌";
    errorBox.style.display = "block";
  } finally {
    loader.style.display = "none"; // Hide loader no matter what
  }
});
