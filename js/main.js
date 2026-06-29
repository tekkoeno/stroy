document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. КАТАЛОГ И ТАБЫ
    // ==========================================
    const tabs = document.querySelectorAll('.catalog-tabs-item');
    const cards = Array.from(document.querySelectorAll('.catalog-card'));
    const pagesContainer = document.querySelector('.pagination-pages');
    const prevBtn = document.querySelector('.pagination-arrow.prev');
    const nextBtn = document.querySelector('.pagination-arrow.next');

    const hasCatalog = cards.length > 0 && pagesContainer && prevBtn && nextBtn;

    let filteredCards = [...cards];
    const CARDS_PER_PAGE = 6;
    let currentFilter = 'all';
    let currentPage = 1;

    function renderCatalog() {
        if (!hasCatalog) return; // Защита

        filteredCards = cards.filter(card => {
            const category = card.getAttribute('data-category');
            return currentFilter === 'all' || category === currentFilter;
        });

        const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE) || 1;

        const paginationBlock = document.querySelector('.pagination');
        if (paginationBlock) { 
            if (filteredCards.length <= CARDS_PER_PAGE) {
                paginationBlock.classList.add('pagination--hidden');
            } else {
                paginationBlock.classList.remove('pagination--hidden');
            }
        }

        if (currentPage > totalPages) currentPage = totalPages;

        cards.forEach(card => card.classList.add('hidden'));

        const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
        const endIndex = startIndex + CARDS_PER_PAGE;
        const cardsToDisplay = filteredCards.slice(startIndex, endIndex);

        cardsToDisplay.forEach(card => card.classList.remove('hidden'));

        renderPaginationButtons(totalPages);

        prevBtn.classList.toggle('disabled', currentPage === 1);
        nextBtn.classList.toggle('disabled', currentPage === totalPages);
    }

    function renderPaginationButtons(totalPages) {
        if (!pagesContainer) return; 
        pagesContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('div');
            pageBtn.classList.add('page-num');
            if (i === currentPage) pageBtn.classList.add('active');
            pageBtn.textContent = i;

            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderCatalog();
                scrollToCatalogTop();
            });

            pagesContainer.appendChild(pageBtn);
        }
    }

    function scrollToCatalogTop() {
        const catalogEl = document.querySelector('.catalog');
        if (catalogEl) { 
            catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    if (hasCatalog) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(item => item.classList.remove('active'));
                tab.classList.add('active');

                currentFilter = tab.getAttribute('data-filter');
                currentPage = 1;
                renderCatalog();
            });
        });

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCatalog();
                scrollToCatalogTop();
            }
        });

        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderCatalog();
                scrollToCatalogTop();
            }
        });

        renderCatalog();
    }


    // ==========================================
    // 2. ПОДГРУЗКА ФОТО В ГАЛЕРЕЮ
    // ==========================================
    const gallery = document.getElementById('photoGallery');
    const loadMoreBtn = document.getElementById('loadMorePhotos');

    let poolOfPhotos = [
        '../assets/img/catalog/svarka1.PNG',
        '../assets/img/catalog/pokraska.png',
        '../assets/img/catalog/valcovka1.PNG',
    ];
    const PHOTOS_PER_CLICK = 6;

    if (loadMoreBtn && gallery) { // Защита (кнопка + сама галерея)
        loadMoreBtn.addEventListener('click', () => {
            const currentBatch = poolOfPhotos.splice(0, PHOTOS_PER_CLICK);

            currentBatch.forEach((src, index) => {
                const newItem = document.createElement('div');
                newItem.classList.add('photo-item');
                newItem.style.animationDelay = `${index * 0.1}s`;

                const newImg = document.createElement('img');
                newImg.src = src;
                newImg.alt = 'Фото металлоконструкций';

                newItem.appendChild(newImg);
                gallery.appendChild(newItem);
            });

            if (poolOfPhotos.length === 0) {
                loadMoreBtn.style.opacity = '0';
                loadMoreBtn.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (loadMoreBtn.parentElement) {
                        loadMoreBtn.parentElement.remove();
                    }
                }, 300);
            }
        });
    }


    // ==========================================
    // 3. ЛОГИКА МОДАЛЬНОГО ОКНА ГАЛЕРЕИ 
    // ==========================================
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalTargetImg');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');

    let currentImgIndex = 0;

    function getAllGalleryImages() {
        return Array.from(document.querySelectorAll('.photo-item img'));
    }

    function openModal(src) {
        if (!modalImg || !modal) return;
        modalImg.src = src;
        modal.classList.add('open');
        document.documentElement.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        document.documentElement.style.overflow = '';
    }

    function changeImage(direction) {
        const allImages = getAllGalleryImages();
        if (allImages.length === 0 || !modalImg) return;

        if (direction === 'next') {
            currentImgIndex = (currentImgIndex + 1) % allImages.length;
        } else if (direction === 'prev') {
            currentImgIndex = (currentImgIndex - 1 + allImages.length) % allImages.length;
        }

        modalImg.src = allImages[currentImgIndex].src;
    }

    if (gallery && modal && modalImg && modalClose && modalPrev && modalNext) {

        gallery.addEventListener('click', (e) => {
            const clickedItem = e.target.closest('.photo-item');
            if (!clickedItem) return;

            const allImages = getAllGalleryImages();
            const imgInside = clickedItem.querySelector('img');
            if (!imgInside) return;

            currentImgIndex = allImages.indexOf(imgInside);
            openModal(imgInside.src);
        });

        modalClose.addEventListener('click', closeModal);
        modalNext.addEventListener('click', () => changeImage('next'));
        modalPrev.addEventListener('click', () => changeImage('prev'));

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-image-area')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('open')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') changeImage('next');
            if (e.key === 'ArrowLeft') changeImage('prev');
        });
    }


    // ==========================================
    // 4. ПОПАП С ТЕЛЕФОНОМ 
    // ==========================================
    const phonePopup = document.getElementById('phonePopup');
    const phonePopupClose = document.getElementById('phonePopupClose');

    function openPhonePopup() {
        if (!phonePopup) return;
        phonePopup.classList.add('open');
        const photoModal = document.getElementById('photoModal');
        if (!photoModal || !photoModal.classList.contains('open')) {
            document.documentElement.style.overflow = 'hidden';
        }
    }

    function closePhonePopup() {
        if (!phonePopup) return;
        phonePopup.classList.remove('open');
        const photoModal = document.getElementById('photoModal');
        if (!photoModal || !photoModal.classList.contains('open')) {
            document.documentElement.style.overflow = '';
        }
    }

    if (phonePopup && phonePopupClose) {
        document.addEventListener('click', (e) => {
            const phoneBtn = e.target.closest('.btn--phone');
            if (phoneBtn) {
                e.preventDefault();
                openPhonePopup();
            }
        });

        phonePopupClose.addEventListener('click', closePhonePopup);

        phonePopup.addEventListener('click', (e) => {
            if (e.target === phonePopup) closePhonePopup();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && phonePopup.classList.contains('open')) {
                closePhonePopup();
            }
        });
    }


    // ==========================================
    // 5. ОТЗЫВЫ
    // ==========================================
    const reviewsGrid = document.getElementById('reviewsGrid');
    const loadMoreReviewsBtn = document.getElementById('loadMoreReviews');

    function generateStars(card) {
        const starsContainer = card.querySelector('.review-stars');
        if (!starsContainer) return;

        const rating = parseInt(card.getAttribute('data-rating')) || 5;
        starsContainer.innerHTML = '';
        const starSVG = (isFilled) => `
            <svg class="${isFilled ? 'filled' : 'empty'}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
        `;

        for (let i = 1; i <= 5; i++) {
            starsContainer.innerHTML += starSVG(i <= rating);
        }
    }

    document.querySelectorAll('.review-card').forEach(generateStars);

    let poolOfReviews = [
        { author: "Дмитрий Колесников", rating: 2, date: "12 февраля", text: "Сделали металлоконструкции вовремя, качество отличное.", avatar: "../assets/photo/user-photo.png" },
        { author: "Алексей Смирнов", rating: 5, date: "10 февраля", text: "Прекрасный сервис, менеджеры всегда на связи.", avatar: "../assets/photo/user-photo.png" },
        { author: "Иван Петров", rating: 5, date: "05 февраля", text: "Рекомендую эту компанию!", avatar: "../assets/photo/user-photo.png" }
    ];

    const REVIEWS_PER_CLICK = 2;

    if (loadMoreReviewsBtn && reviewsGrid) { 
        loadMoreReviewsBtn.addEventListener('click', () => {
            const currentBatch = poolOfReviews.splice(0, REVIEWS_PER_CLICK);

            currentBatch.forEach((data, index) => {
                const newCard = document.createElement('div');
                newCard.classList.add('review-card');
                newCard.setAttribute('data-rating', data.rating);
                newCard.style.animationDelay = `${index * 0.1}s`;

                newCard.innerHTML = `
                    <div class="review-header">
                        <img src="${data.avatar}" alt="${data.author}" class="review-avatar">
                        <div class="review-meta">
                            <h4 class="review-author">${data.author}</h4>
                            <div class="review-stars-wrap">
                                <div class="review-stars"></div>
                                <span class="review-date">${data.date}</span>
                            </div>
                        </div>
                    </div>
                    <p class="review-text">${data.text}</p>
                `;

                reviewsGrid.appendChild(newCard);
                generateStars(newCard);
            });

            if (poolOfReviews.length === 0) {
                loadMoreReviewsBtn.style.opacity = '0';
                loadMoreReviewsBtn.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (loadMoreReviewsBtn.parentElement) {
                        loadMoreReviewsBtn.parentElement.remove();
                    }
                }, 300);
            }
        });
    }


    // ==========================================
    // 6. ХЕДЕР И КНОПКА НАВЕРХ
    // ==========================================
    const header = document.querySelector('.header');
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-list-link');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        if (header) { 
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        }

        if (scrollTopBtn) { 
            scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        }
    });

    function toggleMenu() {
        if (!burgerBtn || !navMenu) return;
        burgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.documentElement.classList.toggle('phone-popup-open');
    }

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', toggleMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==========================================
    // 7. СТРАНИЦА ТОВАРА (ДИНАМИЧЕСКИЙ РЕНДЕР И СЛАЙДЕР)
    // ==========================================

    const catalogDatabase = {
        powder: {
            title: "Порошковая покраска",
            desc: `
            <p>Метод получения полимерных покрытий с высокими защитными и декоративными свойствами.</p>
            <p>Способ порошкового окрашивания является популярной альтернативой нанесению жидких лакокрасочных материалов для деталей, допускающих термообработку.</p>
        `,
            images: [
                "../assets/img/catalog/pokraska-porosh1.png",
                "../assets/img/catalog/pokraska-porosh2.png",
            ]
        },
        laser: {
            title: "Лазерная резка",
            desc: "<p>Высокоточная резка металла лазером любой сложности и формы.</p>",
            images: [
                "../assets/img/catalog/lazer1.png",
                "../assets/img/catalog/lazer2.png",
            ]
        },
        bending: {
            title: "Гибка",
            desc: `<p>Высокоточная гибка Lorem ipsum diddd .</p>
                <p>Способ порошкового окрашивания является популярной альтернативой нанесению жидких лакокрасочных материалов
для деталей, допускающих термообработку.</p>
        `,
            images: [
                "../assets/img/catalog/gibka1.png",
                "../assets/img/catalog/gibka2.png",
            ]
        },
        rolling: {
            title: "Вальцовка",
            desc: `<p>Высокоточная Вальцовка Lorem ipsum diddd .</p>
                <p>Способ порошкового окрашивания является популярной альтернативой нанесению жидких лакокрасочных материалов
для деталей, допускающих термообработку.</p>
        `,
            images: [
                "../assets/img/catalog/valcovka1.png",
            ]
        },
        welding: {
            title: "Сварка",
            desc: `<p>Высокоточная Сварка Lorem ipsum diddd .</p>
                <p>Способ порошкового окрашивания является популярной альтернативой нанесению жидких лакокрасочных материалов
для деталей, допускающих термообработку.</p>
        `,
            images: [
                "../assets/img/catalog/svarka1.png",
            ]
        },
        painting: {
            title: "Покраска",
            desc: `<p>Высокоточная Покраска Lorem ipsum diddd .</p>
                <p>Способ порошкового окрашивания является популярной альтернативой нанесению жидких лакокрасочных материалов
для деталей, допускающих термообработку.</p>
        `,
            images: [
                "../assets/img/catalog/pokraska.png",
            ]
        }
    };


    const mainImg = document.getElementById('mainProductImg');
    if (!mainImg) return;

    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category');


    if (!category || !catalogDatabase[category]) {
        category = 'powder';
    }

    const productData = catalogDatabase[category];
    const images = productData.images;
    let currentIndex = 0; 

    const titleEl = document.getElementById('productTitle');
    const descEl = document.getElementById('productDesc');
    const thumbnailsContainer = document.getElementById('productThumbnails');
    const dotsContainer = document.getElementById('galleryDots');
    const btnPrev = document.getElementById('galleryPrev');
    const btnNext = document.getElementById('galleryNext');

    titleEl.innerHTML = productData.title;
    descEl.innerHTML = productData.desc;

    images.forEach((src, index) => {

        const thumb = document.createElement('div');
        thumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${src}" alt="Превью ${index + 1}">`;
        thumb.addEventListener('click', () => updateGallery(index));
        thumbnailsContainer.appendChild(thumb);

        const dot = document.createElement('div');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => updateGallery(index));
        dotsContainer.appendChild(dot);
    });


    mainImg.src = images[0];

    function updateGallery(index) {
        if (currentIndex === index) return;
        currentIndex = index;

        mainImg.classList.add('fade');
        setTimeout(() => {
            mainImg.src = images[currentIndex];
            mainImg.classList.remove('fade');
        }, 200);

        document.querySelectorAll('.thumb-item').forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });

        document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }


    btnPrev.addEventListener('click', () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = images.length - 1; 
        updateGallery(newIndex);
    });

    btnNext.addEventListener('click', () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= images.length) newIndex = 0; 
        updateGallery(newIndex);
    });


    // --- ВЫПАДАЮЩЕЕ МЕНЮ "НАПИСАТЬ" ---
    const writeBtn = document.getElementById('dropdownWriteBtn');
    const dropdownMenu = document.getElementById('messengerDropdown');

    if (writeBtn && dropdownMenu) {

        writeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdownMenu.classList.toggle('show');
        });


        document.addEventListener('click', (e) => {

            if (!dropdownMenu.contains(e.target) && e.target !== writeBtn) {
                dropdownMenu.classList.remove('show'); 
            }
        });
    }



});