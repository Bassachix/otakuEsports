document.addEventListener('DOMContentLoaded', () => {

    // --- FUNGSI KEAMANAN (Mencegah XSS) ---
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(match) {
            const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return escapeMap[match];
        });
    }

    // --- BAGIAN 1: LOGIC UNTUK WIDGET ANGGOTA ONLINE ---
    function initializeWidget() {
        const serverId = '516573328207511573'; // ID Server Anda untuk widget
        const widgetApiUrl = `https://discord.com/api/guilds/${serverId}/widget.json`;

        const serverNameElement = document.getElementById('server-name');
        const onlineCountElement = document.getElementById('online-count');
        const memberListElement = document.getElementById('member-list');
        const joinLinkElement = document.getElementById('join-link');

        fetch(widgetApiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Gagal mengambil data widget');
                return response.json();
            })
            .then(data => {
                if (serverNameElement) serverNameElement.innerText = data.name;
                if (onlineCountElement) onlineCountElement.innerText = `${data.presence_count} Online`;
                if (joinLinkElement) joinLinkElement.href = data.instant_invite || '#';
                
                if (memberListElement) {
                    memberListElement.innerHTML = ''; // Kosongkan daftar
                    if (data.members && data.members.length > 0) {
                        data.members.forEach(member => {
                            const memberDiv = document.createElement('div');
                            memberDiv.className = 'member';
                            const escapedUsername = escapeHTML(member.username);
                            const escapedGame = escapeHTML(member.game ? member.game.name : '');
                            const statusGame = member.game ? `Main: ${escapedGame}` : 'Online';
                            
                            memberDiv.innerHTML = `
                                <img src="${escapeHTML(member.avatar_url)}" alt="${escapedUsername} avatar" onerror="this.onerror=null;this.src='https://placehold.co/32x32/2c2f33/f2f3f5?text=?';">
                                <div class="member-info">
                                    <span>${escapedUsername}</span>
                                    <span class="status">${statusGame}</span>
                                </div>
                            `;
                            memberListElement.appendChild(memberDiv);
                        });
                    } else {
                         memberListElement.innerHTML = '<p class="loading-text">Tidak ada anggota yang ditampilkan.</p>';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching widget:', error);
                if (serverNameElement) serverNameElement.innerText = 'Server Error';
                if (memberListElement) memberListElement.innerHTML = '<p class="loading-text">Gagal memuat data widget.</p>';
            });
    }
    
    // --- BAGIAN 2: LOGIC UNTUK ANIMASI SAAT SCROLL ---
    function initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animated-section');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- BAGIAN 3: LOGIC UNTUK HAMBURGER MENU MOBILE ---
    function initializeHamburgerMenu() {
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const mainHeader = document.querySelector('.main-header');
        if (!hamburgerMenu || !mainHeader) return;

        hamburgerMenu.addEventListener('click', () => {
            mainHeader.classList.toggle('is-active');
        });
    }

    // --- BAGIAN 4: LOGIC UNTUK EVENT POP-UP (MODAL) (DIPERBARUI) ---
    function initializeEventsModal() {
        const eventsNavButton = document.getElementById('events-nav-button');
        const modalOverlay = document.getElementById('event-modal-overlay');
        const modalBody = document.getElementById('event-modal-body');
        const closeModalButton = document.getElementById('close-modal-button');

        if (!eventsNavButton || !modalOverlay || !modalBody || !closeModalButton) return;

        function openModal() {
            document.body.classList.add('modal-active');
            modalOverlay.classList.add('active');
            fetchAndDisplayEvents();
        }

        function closeModal() {
            document.body.classList.remove('modal-active');
            modalOverlay.classList.remove('active');
        }

        async function fetchAndDisplayEvents() {
            modalBody.innerHTML = '<p class="no-events">Memuat event...</p>';
            try {
                const response = await fetch('/api/events');
                if (!response.ok) {
                    throw new Error('Gagal mengambil data dari server');
                }
                const events = await response.json();

                modalBody.innerHTML = '';

                if (events.length === 0) {
                    modalBody.innerHTML = '<p class="no-events">Tidak ada event yang dijadwalkan.</p>';
                    return;
                }

                events.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event-item';
                    
                    // --- Gambar ---
                    let imageHtml = '';
                    if (event.image) {
                        const imageUrl = `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=512`;
                        imageHtml = `
                            <div class="event-image-container">
                                <img src="${imageUrl}" alt="${event.name} cover" class="event-cover">
                            </div>
                        `;
                    }

                    // --- Tanggal & Status ---
                    const eventDate = new Date(event.scheduled_start_time);
                    const now = new Date();
                    let statusText = 'AKAN DATANG';
                    if (now > eventDate) {
                        statusText = 'SEDANG BERLANGSUNG';
                    }
                    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
                    const formattedDate = eventDate.toLocaleDateString('id-ID', dateOptions).replace(/\./g, ' ');

                    // --- Lokasi ---
                    let location = 'Online';
                    if (event.entity_metadata && event.entity_metadata.location) {
                        location = event.entity_metadata.location;
                    } else if (event.channel_id) {
                        location = 'Di Channel Suara';
                    }

                    // --- Peminat ---
                    const interestedCount = event.user_count || 0;

                    const escapedName = escapeHTML(event.name);
                    const escapedDesc = escapeHTML(event.description || 'Tidak ada deskripsi.');
                    const escapedLocation = escapeHTML(location);

                    eventElement.innerHTML = `
                        ${imageHtml}
                        <div class="event-content">
                            <p class="event-date">${statusText}</p>
                            <h4>${escapedName}</h4>
                            <p class="event-description">${escapedDesc}</p>
                            <div class="event-footer">
                                <div class="event-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span>${escapedLocation}</span>
                                </div>
                                <div class="event-interested">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    <span>${interestedCount} Peminat</span>
                                </div>
                            </div>
                        </div>
                    `;
                    modalBody.appendChild(eventElement);
                });

            } catch (error) {
                console.error('Error fetching events:', error);
                modalBody.innerHTML = '<p class="no-events">Gagal memuat event.</p>';
            }
        }

        eventsNavButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        closeModalButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // --- BAGIAN 5: FUNGSI UNTUK TAHUN OTOMATIS DI FOOTER ---
    function initializeFooterYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.innerText = new Date().getFullYear();
        }
    }

    // --- Menjalankan semua fungsi inisialisasi ---
    initializeWidget();
    initializeScrollAnimations();
    initializeHamburgerMenu();
    initializeEventsModal();
    initializeFooterYear();
});
