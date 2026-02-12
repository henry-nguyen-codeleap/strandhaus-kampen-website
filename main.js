// ── OverlayScrollbars ──
const { OverlayScrollbars, ClickScrollPlugin } = OverlayScrollbarsGlobal;
OverlayScrollbars.plugin(ClickScrollPlugin);

const bodyScrollbar = OverlayScrollbars(document.body, {
    scrollbars: { theme: 'os-theme-custom', autoHide: 'scroll' }
});

// ── Nav scroll effect ──
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile menu ──
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const overlay = document.getElementById('navOverlay');

function openMenu() { links.classList.add('open'); overlay.classList.add('visible'); toggle.classList.add('open'); }
function closeMenu() { links.classList.remove('open'); overlay.classList.remove('visible'); toggle.classList.remove('open'); }

toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
});
overlay.addEventListener('click', closeMenu);
links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ── Fetch data & render ──
fetch('units.json')
    .then(r => r.json())
    .then(data => {
        setHeroImage(data.heroImage);
        renderAboutImages(data.aboutImages);
        renderUnits(data.units);
        initTabs();
        initTagToggles();
        initLightbox();
        initStickyTabs();
        initTabScrollShadows();
        initEntranceAnimations();
        initOverlayScrollbars();
    });

// ── Hero image ──
function setHeroImage(src) {
    const heroBg = document.querySelector('.hero-bg');
    const gradient = getComputedStyle(heroBg).backgroundImage;
    heroBg.style.backgroundImage = gradient + `, url('${src}')`;
}

// ── About images ──
function renderAboutImages(images) {
    const container = document.getElementById('aboutImages');
    images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'about-img' + (img.tall ? ' about-img-tall' : '');
        div.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        container.appendChild(div);
    });
}

// ── Units ──
function renderUnits(units) {
    const tabsContainer = document.getElementById('unitTabs');
    const sliderContainer = document.getElementById('unitSlider');

    units.forEach((unit, i) => {
        // Tab
        const tab = document.createElement('button');
        tab.className = 'unit-tab' + (i === 0 ? ' active' : '');
        tab.dataset.unit = i;
        tab.textContent = unit.name;
        tabsContainer.appendChild(tab);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'unit-content' + (i === 0 ? ' active' : '');
        panel.dataset.imgFolder = unit.folder;
        panel.dataset.imgTotal = unit.totalImages;

        const gridCount = Math.min(5, unit.totalImages);

        // Desktop photo grid
        let gridHTML = '<div class="photo-grid">';
        for (let g = 0; g < gridCount; g++) {
            const src = `img/${unit.folder}/${unit.folder}_${g + 1}.webp`;
            const isLast = g === gridCount - 1 && unit.totalImages > gridCount;
            gridHTML += `<div class="photo-grid-item" data-idx="${g}">`;
            gridHTML += `<img src="${src}" alt="">`;
            if (isLast) {
                gridHTML += `<button class="photo-grid-more">Alle ${unit.totalImages} Fotos</button>`;
            }
            gridHTML += '</div>';
        }
        gridHTML += '</div>';

        // Mobile hero
        const heroSrc = `img/${unit.folder}/${unit.folder}_1.webp`;
        let mobileHTML = `<div class="photo-hero-mobile">`;
        mobileHTML += `<img src="${heroSrc}" alt="">`;
        mobileHTML += `<div class="photo-count-badge">`;
        mobileHTML += `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
        mobileHTML += `${unit.totalImages} Fotos</div></div>`;

        // Info card
        let infoHTML = '<div class="unit-info-card"><div class="unit-info-main">';
        infoHTML += `<h3>${unit.name}</h3>`;
        infoHTML += `<p class="unit-meta">${unit.meta}</p>`;
        infoHTML += `<p class="unit-desc">${unit.description}</p>`;
        infoHTML += '<div class="unit-tags">';
        unit.tags.forEach(tag => {
            infoHTML += `<span class="unit-tag">${tag}</span>`;
        });
        unit.hiddenTags.forEach(tag => {
            infoHTML += `<span class="unit-tag hidden-tag">${tag}</span>`;
        });
        if (unit.hiddenTags.length > 0) {
            infoHTML += `<button class="tags-toggle">+${unit.hiddenTags.length} mehr</button>`;
        }
        infoHTML += '</div></div>';
        infoHTML += '<div class="unit-info-side">';
        infoHTML += `<a href="${unit.cta.href}" class="unit-book">${unit.cta.label}`;
        infoHTML += `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`;
        infoHTML += '</a></div></div>';

        panel.innerHTML = gridHTML + mobileHTML + infoHTML;
        sliderContainer.appendChild(panel);
    });
}

// ── Tabs ──
let currentUnit = 0;

function initTabs() {
    const tabs = document.querySelectorAll('.unit-tab');
    const panels = document.querySelectorAll('.unit-content');

    function goToUnit(idx) {
        panels[currentUnit].classList.remove('active');
        tabs[currentUnit].classList.remove('active');
        currentUnit = idx;
        panels[currentUnit].classList.add('active');
        tabs[currentUnit].classList.add('active');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => goToUnit(parseInt(tab.dataset.unit)));
    });
}

// ── Tags toggle ──
function initTagToggles() {
    document.querySelectorAll('.tags-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const tagsWrap = btn.closest('.unit-tags');
            const isExpanded = tagsWrap.classList.toggle('expanded');
            const hiddenCount = tagsWrap.querySelectorAll('.hidden-tag').length;
            btn.textContent = isExpanded ? 'Weniger' : `+${hiddenCount} mehr`;
        });
    });
}

// ── Tab scroll shadows ──
function initTabScrollShadows() {
    const tabsWrap = document.querySelector('.unit-tabs-wrap');
    const tabs = document.querySelector('.unit-tabs');
    if (!tabsWrap || !tabs) return;

    function updateShadows() {
        const { scrollLeft, scrollWidth, clientWidth } = tabs;
        tabsWrap.classList.toggle('shadow-left', scrollLeft > 2);
        tabsWrap.classList.toggle('shadow-right', scrollLeft + clientWidth < scrollWidth - 2);
    }

    tabs.addEventListener('scroll', updateShadows, { passive: true });
    updateShadows();
}

// ── Sticky tabs ──
function initStickyTabs() {
    const tabsWrap = document.querySelector('.unit-tabs-wrap');
    if (tabsWrap && window.IntersectionObserver) {
        const stickyObs = new IntersectionObserver(([e]) => {
            tabsWrap.classList.toggle('stuck', e.intersectionRatio < 1);
        }, { threshold: [1], rootMargin: '-1px 0px 0px 0px' });
        stickyObs.observe(tabsWrap);
    }
}

// ── Entrance animations ──
function initEntranceAnimations() {
    if (window.IntersectionObserver) {
        document.querySelectorAll('.section-entrance, .unit-entrance').forEach(el => {
            const obs = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) {
                    el.classList.add('entered');
                    obs.disconnect();
                }
            }, { threshold: 0.15 });
            obs.observe(el);
        });
    }
}

// ── OverlayScrollbars on dynamic elements ──
function initOverlayScrollbars() {
    const thumbstrip = document.getElementById('lightboxThumbs');
    if (thumbstrip) {
        OverlayScrollbars(thumbstrip, {
            overflow: { x: 'scroll', y: 'hidden' },
            scrollbars: { theme: 'os-theme-custom', autoHide: 'move', autoHideDelay: 800 }
        });
    }
}

// ── Lightbox ──
const lightbox = document.getElementById('lightbox');
const lbCounter = document.getElementById('lightboxCounter');
const lbImgWrap = document.getElementById('lightboxImgWrap');
const lbThumbs = document.getElementById('lightboxThumbs');
let lbItems = [];
let lbCurrent = 0;
let lbDirection = null;

function getUnitImages(unitContent) {
    const folder = unitContent.dataset.imgFolder;
    const total = parseInt(unitContent.dataset.imgTotal);
    if (!folder || !total) return [];
    const images = [];
    for (let i = 1; i <= total; i++) {
        images.push(`img/${folder}/${folder}_${i}.webp`);
    }
    return images;
}

function openLightbox(unitContent, startIdx) {
    lbItems = getUnitImages(unitContent);
    lbCurrent = startIdx;
    lbDirection = null;

    lbThumbs.innerHTML = '';
    lbItems.forEach((src, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'lightbox-thumb' + (i === startIdx ? ' active' : '');
        thumb.innerHTML = `<img src="${src}" alt="">`;
        thumb.addEventListener('click', () => { lbDirection = i > lbCurrent ? 'right' : 'left'; lbCurrent = i; updateLightbox(); });
        lbThumbs.appendChild(thumb);
    });

    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    bodyScrollbar.options({ scrollbars: { visibility: 'hidden' } });
}

function updateLightbox() {
    const src = lbItems[lbCurrent];
    const slideClass = lbDirection === 'right' ? ' class="slide-in-right"' : lbDirection === 'left' ? ' class="slide-in-left"' : '';
    lbImgWrap.innerHTML = `<img src="${src}" alt=""${slideClass}>`;
    lbCounter.textContent = `${lbCurrent + 1} / ${lbItems.length}`;
    lbThumbs.querySelectorAll('.lightbox-thumb').forEach((t, i) =>
        t.classList.toggle('active', i === lbCurrent));

    // Scroll active thumb into view
    const activeThumb = lbThumbs.querySelector('.lightbox-thumb.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function closeLightbox() {
    lightbox.classList.add('closing');
    lightbox.addEventListener('transitionend', function onEnd() {
        lightbox.classList.remove('open', 'closing');
        document.body.style.overflow = '';
        bodyScrollbar.options({ scrollbars: { visibility: 'visible' } });
        lightbox.removeEventListener('transitionend', onEnd);
    });
}

function initLightbox() {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => {
        lbDirection = 'left';
        lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length;
        updateLightbox();
    });
    lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => {
        lbDirection = 'right';
        lbCurrent = (lbCurrent + 1) % lbItems.length;
        updateLightbox();
    });
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-main')) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { lbDirection = 'left'; lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length; updateLightbox(); }
        if (e.key === 'ArrowRight') { lbDirection = 'right'; lbCurrent = (lbCurrent + 1) % lbItems.length; updateLightbox(); }
    });

    // Swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let swiping = false;

    lbImgWrap.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchDeltaX = 0;
        swiping = true;
        const img = lbImgWrap.querySelector('img');
        if (img) img.style.transition = 'none';
    }, { passive: true });

    lbImgWrap.addEventListener('touchmove', e => {
        if (!swiping) return;
        touchDeltaX = e.touches[0].clientX - touchStartX;
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        if (deltaY > Math.abs(touchDeltaX)) { swiping = false; return; }
        const img = lbImgWrap.querySelector('img');
        if (img) {
            img.style.transform = `translateX(${touchDeltaX}px)`;
            img.style.opacity = Math.max(0.4, 1 - Math.abs(touchDeltaX) / 300);
        }
    }, { passive: true });

    lbImgWrap.addEventListener('touchend', () => {
        if (!swiping) return;
        swiping = false;
        const threshold = 50;
        if (touchDeltaX < -threshold) {
            lbDirection = 'right';
            lbCurrent = (lbCurrent + 1) % lbItems.length;
            updateLightbox();
        } else if (touchDeltaX > threshold) {
            lbDirection = 'left';
            lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length;
            updateLightbox();
        } else {
            const img = lbImgWrap.querySelector('img');
            if (img) {
                img.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
                img.style.transform = 'translateX(0)';
                img.style.opacity = '1';
            }
        }
    });

    // Grid items -> lightbox
    document.querySelectorAll('.photo-grid-item').forEach(item => {
        item.addEventListener('click', () => {
            openLightbox(item.closest('.unit-content'), parseInt(item.dataset.idx));
        });
    });
    // "Alle N Fotos" buttons
    document.querySelectorAll('.photo-grid-more').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            openLightbox(btn.closest('.unit-content'), 0);
        });
    });
    // Mobile hero -> lightbox
    document.querySelectorAll('.photo-hero-mobile').forEach(hero => {
        hero.addEventListener('click', () => {
            openLightbox(hero.closest('.unit-content'), 0);
        });
    });
}
