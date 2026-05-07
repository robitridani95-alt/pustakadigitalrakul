/* app.js */
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // STATE MANAGEMENT (PERSISTENT DATA via LOCALSTORAGE)
    // ----------------------------------------------------
    const STORAGE_KEY = 'pustakapro_books_data';
    const ADMIN_KEY = 'pustakapro_admin_logged_in';
    
    let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let isAdminLoggedIn = sessionStorage.getItem(ADMIN_KEY) === 'true';

    // ----------------------------------------------------
    // DOM ELEMENTS
    // ----------------------------------------------------
    const btnHome = document.getElementById('btn-home');
    const btnAdmin = document.getElementById('btn-admin');
    const viewReader = document.getElementById('view-reader');
    const viewAdmin = document.getElementById('view-admin');
    
    const bookGrid = document.getElementById('book-grid');
    const searchInput = document.getElementById('search-input');
    
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminPassword = document.getElementById('admin-password');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const loginError = document.getElementById('login-error');
    
    const addBookForm = document.getElementById('add-book-form');
    const adminBookList = document.getElementById('admin-book-list');

    // ----------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------
    // Seed default data if completely empty
    if (books.length === 0) {
        books = [
            {
                id: Date.now().toString() + "1",
                title: "Atomic Habits",
                author: "James Clear",
                publisher: "Penguin Random House",
                cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=80",
                link: "https://example.com/baca"
            },
            {
                id: Date.now().toString() + "2",
                title: "The Psychology of Money",
                author: "Morgan Housel",
                publisher: "Harriman House",
                cover: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=500&q=80",
                link: "https://example.com/baca"
            },
            {
                id: Date.now().toString() + "3",
                title: "Seni Bersikap Bodo Amat",
                author: "Mark Manson",
                publisher: "Gramedia",
                cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
                link: "https://example.com/baca"
            }
        ];
        saveBooks();
    }

    renderBooks(books);
    updateAdminView();

    // ----------------------------------------------------
    // NAVIGATION LOGIC
    // ----------------------------------------------------
    btnHome.addEventListener('click', () => {
        btnHome.classList.add('active');
        btnAdmin.classList.remove('active');
        viewReader.classList.add('active');
        viewAdmin.classList.remove('active');
        
        // Reset search & refresh reader view
        searchInput.value = '';
        renderBooks(books);
    });

    btnAdmin.addEventListener('click', () => {
        btnAdmin.classList.add('active');
        btnHome.classList.remove('active');
        viewAdmin.classList.add('active');
        viewReader.classList.remove('active');
    });

    // ----------------------------------------------------
    // READER VIEW LOGIC
    // ----------------------------------------------------
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = books.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query) ||
            (book.publisher && book.publisher.toLowerCase().includes(query))
        );
        renderBooks(filtered);
    });

    function renderBooks(booksToRender) {
        bookGrid.innerHTML = '';
        
        if(booksToRender.length === 0) {
            bookGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-book-journal-whills"></i>
                    <h2>Tidak ada buku ditemukan</h2>
                    <p>Coba gunakan kata kunci lain.</p>
                </div>
            `;
            return;
        }

        booksToRender.forEach(book => {
            const a = document.createElement('a');
            a.href = book.link;
            a.target = "_blank";
            a.className = 'book-card';
            a.innerHTML = `
                <div class="book-img-wrapper">
                    <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/300x450/1e293b/f8fafc?text=Cover+Buku'">
                </div>
                <div class="book-info">
                    <h3 class="book-title" title="${book.title}">${book.title}</h3>
                    <p class="book-author" style="margin-bottom: 0.25rem;"><i class="fa-solid fa-pen-nib" style="margin-right: 5px;"></i> ${book.author}</p>
                    <p class="book-publisher" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; flex-grow: 1;"><i class="fa-solid fa-building" style="margin-right: 5px;"></i> ${book.publisher || '-'}</p>
                    <span class="read-btn">Mulai Baca <i class="fa-solid fa-arrow-right" style="margin-left: 5px;"></i></span>
                </div>
            `;
            bookGrid.appendChild(a);
        });
    }

    // ----------------------------------------------------
    // ADMIN PORTAL LOGIC
    // ----------------------------------------------------
    function updateAdminView() {
        if (isAdminLoggedIn) {
            adminLogin.classList.remove('active');
            adminDashboard.classList.add('active');
            renderAdminTable();
        } else {
            adminLogin.classList.add('active');
            adminDashboard.classList.remove('active');
        }
    }

    // Enter key support for login
    adminPassword.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            btnLogin.click();
        }
    });

    btnLogin.addEventListener('click', () => {
        // Simple client-side auth for demonstration
        if (adminPassword.value === 'admin123') {
            isAdminLoggedIn = true;
            sessionStorage.setItem(ADMIN_KEY, 'true');
            adminPassword.value = '';
            loginError.textContent = '';
            updateAdminView();
        } else {
            loginError.textContent = 'Kata sandi salah! Coba "admin123"';
        }
    });

    btnLogout.addEventListener('click', () => {
        isAdminLoggedIn = false;
        sessionStorage.removeItem(ADMIN_KEY);
        updateAdminView();
    });

    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = document.querySelector('.submit-btn');
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
        btnSubmit.disabled = true;

        try {
            const fileInput = document.getElementById('book-cover');
            const file = fileInput.files[0];
            const base64Cover = await compressAndConvertToBase64(file);

            const newBook = {
                id: Date.now().toString(),
                title: document.getElementById('book-title').value,
                author: document.getElementById('book-author').value,
                publisher: document.getElementById('book-publisher').value,
                cover: base64Cover,
                link: document.getElementById('book-link').value
            };

            // Add to front of array
            books.unshift(newBook);
            
            // Save to localStorage
            saveBooks();
            
            // Update UI
            renderAdminTable();
            addBookForm.reset();
            
            btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan Buku Permanen';
            btnSubmit.disabled = false;
            
            alert('Buku berhasil ditambahkan dan tersimpan permanen!');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan buku. ' + error.message);
            btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan Buku Permanen';
            btnSubmit.disabled = false;
        }
    });

    // Helper function to compress image
    function compressAndConvertToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("File tidak ditemukan."));
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600; // compress width
                    const MAX_HEIGHT = 900; // compress height
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    function renderAdminTable() {
        adminBookList.innerHTML = '';
        
        if (books.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" style="text-align:center; padding: 2rem;">Belum ada buku tersimpan.</td>';
            adminBookList.appendChild(tr);
            return;
        }

        books.forEach(book => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${book.cover}" alt="cover" onerror="this.src='https://via.placeholder.com/50x75/1e293b/f8fafc?text=No+Img'">
                </td>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}<br><small style="color: var(--text-muted);">${book.publisher || '-'}</small></td>
                <td>
                    <button class="delete-btn" data-id="${book.id}" title="Hapus Buku">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            adminBookList.appendChild(tr);
        });

        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if(confirm('Apakah Anda yakin ingin menghapus buku ini? Data akan hilang permanen.')) {
                    // Remove from array
                    books = books.filter(b => b.id !== id);
                    // Save updated array to localStorage
                    saveBooks();
                    // Update table
                    renderAdminTable();
                }
            });
        });
    }

    function saveBooks() {
        // Save to browser's LocalStorage which is persistent
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
});
