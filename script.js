document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent immediate closing
            mobileMenu.classList.toggle('active');
            this.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                menuToggle.textContent = '☰';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = menuToggle.contains(event.target) || mobileMenu.contains(event.target);
            if (!isClickInside && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                menuToggle.textContent = '☰';
            }
        });
    }

    // Smooth scroll for navigation
    document.querySelectorAll('.nav-menu a, .mobile-menu a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only prevent default if it's a hash link
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Gallery Slider Logic
    const scrollContainer = document.querySelector('.gallery-scroll');
    const leftArrow = document.querySelector('.gallery-arrow-left');
    const rightArrow = document.querySelector('.gallery-arrow-right');
    
    if (scrollContainer && leftArrow && rightArrow) {
        // Dynamic scroll amount based on current visible width
        const getScrollAmount = () => {
            const firstItem = scrollContainer.querySelector('.gallery1-item');
            if (!firstItem) return 300; // Fallback
            const itemWidth = firstItem.offsetWidth;
            const gap = parseFloat(getComputedStyle(scrollContainer).gap) || 24; 
            return itemWidth + gap; // Scroll by one item + gap
        };
        
        let scrollAmount = getScrollAmount();

        // Update on resize for responsiveness
        window.addEventListener('resize', () => {
            scrollAmount = getScrollAmount();
        });
        
        leftArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        rightArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
});