// Combine all DOMContentLoaded listeners into one
document.addEventListener('DOMContentLoaded', function() {
    // 1. Force enable scrolling (simplified version)
    function enableScroll() {
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        
        // Safeguard against overflow changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const bodyStyle = getComputedStyle(document.body);
                    if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') {
                        document.body.style.overflowY = 'auto';
                    }
                }
            });
        });
        
        observer.observe(document.body, { 
            attributes: true,
            attributeFilter: ['style']
        });
        
        return observer; // Return observer for cleanup
    }
    
    const scrollObserver = enableScroll();

    // 2. Preloader
    function initPreloader() {
        document.body.classList.add('preload');
        
        const preloader = document.querySelector('.preloader');
        if (!preloader) return;
        
        function removePreloader() {
            preloader.classList.add('preloader--hidden');
            setTimeout(() => preloader.remove(), 500);
        }
        
        window.addEventListener('load', removePreloader);
        setTimeout(removePreloader, 4000); // Fallback
    }
    
    initPreloader();

    // 3. Image loading handler
    function handleImageLoading() {
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                });
            }
        });
    }
    
    handleImageLoading();

    // 4. Cursor effects (with cleanup)
    function initCursorEffects() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        if (!cursor || !cursorFollower) return;
        
        function moveCursor(e) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            
            setTimeout(() => {
                cursorFollower.style.left = `${e.clientX}px`;
                cursorFollower.style.top = `${e.clientY}px`;
            }, 100);
        }
        
        function handleHover(el, enter) {
            if (enter) {
                cursor.classList.add('cursor--active');
                cursorFollower.classList.add('cursor-follower--active');
            } else {
                cursor.classList.remove('cursor--active');
                cursorFollower.classList.remove('cursor-follower--active');
            }
        }
        
        document.addEventListener('mousemove', moveCursor);
        
        const hoverableElements = document.querySelectorAll(
            'a, button, .projects__card, .skills__item, .contact__card, .nav__link'
        );
        
        hoverableElements.forEach(el => {
            el.addEventListener('mouseenter', () => handleHover(el, true));
            el.addEventListener('mouseleave', () => handleHover(el, false));
        });
        
        // Return cleanup function
        return () => {
            document.removeEventListener('mousemove', moveCursor);
            hoverableElements.forEach(el => {
                el.removeEventListener('mouseenter', () => handleHover(el, true));
                el.removeEventListener('mouseleave', () => handleHover(el, false));
            });
        };
    }
    
    const cleanupCursor = initCursorEffects();

    // 5. Theme toggle (optimized)
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const html = document.documentElement;
        const icon = themeToggle.querySelector('i');
        
        function setTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Update icon
            if (theme === 'dark') {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
            
            // Accessibility
            themeToggle.setAttribute('aria-pressed', theme === 'dark');
            themeToggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        
        function initTheme() {
            try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
            } catch (e) {
                setTheme('light');
            }
        }
        
        function handleSystemThemeChange(e) {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        }
        
        initTheme();
        
        themeToggle.addEventListener('click', () => {
            setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        // Return cleanup function
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }
    
    const cleanupTheme = initThemeToggle();

    // 6. Mobile menu (optimized)
// Update your mobile menu initialization code with this:

function initMobileMenu() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navClose = document.querySelector('.nav__close');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (!navToggle || !navMenu) return;
    let startX = 0;
    let currentX = 0;
    
    navMenu.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    navMenu.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
    }, { passive: true });
    
    navMenu.addEventListener('touchend', () => {
        if (startX - currentX > 50) {
            toggleMenu(false);
        }
    }, { passive: true });
    function toggleMenu(show) {
        if (show) {
            navMenu.classList.add('show-menu');
            document.body.style.overflow = 'hidden';
            navToggle.setAttribute('aria-expanded', 'true');
            
            // Position close button properly on mobile
            if (window.innerWidth <= 992) {
                navClose.style.position = 'fixed';
                navClose.style.top = '1.5rem';
                navClose.style.right = '1.5rem';
            }
        } else {
            navMenu.classList.remove('show-menu');
            document.body.style.overflow = '';
            navToggle.setAttribute('aria-expanded', 'false');
            
            // Reset close button position
            navClose.style.position = '';
            navClose.style.top = '';
            navClose.style.right = '';
        }
    }

    // Toggle menu on button click
    navToggle.addEventListener('click', () => {
        toggleMenu(!navMenu.classList.contains('show-menu'));
    });

    // Close menu on close button click
    navClose?.addEventListener('click', () => {
        toggleMenu(false);
    });

    // Close menu when clicking on links (mobile only)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                toggleMenu(false);
            }
        });
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            toggleMenu(false);
        }
    });

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 992 && navMenu.classList.contains('show-menu')) {
            toggleMenu(false);
        }
    }

    window.addEventListener('resize', handleResize);

    // Accessibility
    navToggle.setAttribute('aria-label', 'Toggle menu');
    navToggle.setAttribute('aria-controls', 'nav-menu');
    navToggle.setAttribute('aria-expanded', 'false');
    navClose?.setAttribute('aria-label', 'Close menu');

    // Cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('keydown', () => {});
    };
}
    
    const cleanupMenu = initMobileMenu();

    // 7. Scroll effects (optimized)
    function initScrollEffects() {
        const header = document.querySelector('.header');
        const scrollUp = document.getElementById('scroll-up');
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav__link');
        
        function handleScroll() {
            // Header scroll effect
            if (header) {
                header.classList.toggle('scroll-header', window.scrollY >= 50);
            }
            
            // Scroll up button
            if (scrollUp) {
                scrollUp.classList.toggle('show-scroll', window.scrollY >= 300);
            }
            
            // Active link on scroll
            const scrollY = window.scrollY;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                
                navLinks.forEach(link => {
                    if (link.getAttribute('href').includes(sectionId)) {
                        link.classList.toggle('active-link', 
                            scrollY > sectionTop && scrollY <= sectionTop + sectionHeight);
                    }
                });
            });
        }
        
        // Use requestAnimationFrame for better performance
        let ticking = false;
        function optimizedScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', optimizedScroll);
        
        // Initial call
        handleScroll();
        
        // Return cleanup function
        return () => {
            window.removeEventListener('scroll', optimizedScroll);
        };
    }
    
    const cleanupScroll = initScrollEffects();

    // 8. Skills animation (optimized)
function initSkillsAnimation() {
    const skillsSection = document.querySelector('.skills');
    if (!skillsSection) return;

    function resetSkills() {
        document.querySelectorAll('.skills__progress').forEach(progress => {
            progress.style.width = '0';
            progress.style.transition = 'none';
        });
    }

    function animateSkills() {
        const skillsItems = document.querySelectorAll('.skills__item');
        
        skillsItems.forEach((item, index) => {
            const progress = item.querySelector('.skills__progress');
            const width = progress?.getAttribute('data-width');
            
            if (progress && width) {
                const delay = index * 100;
                
                setTimeout(() => {
                    // Force reflow before animating
                    void progress.offsetWidth;
                    progress.style.transition = 'width 1.5s ease-out';
                    progress.style.width = width;
                }, delay);
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resetSkills(); // Reset before animating
                setTimeout(animateSkills, 100); // Small delay after reset
            } else {
                resetSkills(); // Reset when leaving view
            }
        });
    }, { 
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(skillsSection);

    return () => observer.disconnect();
}
    
    const cleanupSkills = initSkillsAnimation();

    // 9. Projects Swiper (optimized)
    function initProjectsSwiper() {
        const swiperEl = document.querySelector('.projects__content');
        if (!swiperEl || typeof Swiper === 'undefined') return;
        
        const swiper = new Swiper(swiperEl, {
            loop: false,
            grabCursor: true,
            keyboard: { enabled: true },
            slidesPerView: 1,
            spaceBetween: 20,
            watchOverflow: true,
            observer: true,
            observeParents: true,
            
            breakpoints: {
                768: { slidesPerView: 2 },
                992: { slidesPerView: 3 }
            },
            
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            
            a11y: {
                prevSlideMessage: 'Previous project',
                nextSlideMessage: 'Next project'
            }
        });
        
        function adjustSwiperButtons() {
            const cards = swiperEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
            if (!cards.length) return;
            
            const maxHeight = Math.max(...Array.from(cards).map(card => card.offsetHeight));
            const buttons = swiperEl.querySelectorAll('.swiper-button-prev, .swiper-button-next');
            
            buttons.forEach(button => {
                button.style.top = window.innerWidth <= 768 ? `${maxHeight * 0.4}px` : '50%';
            });
        }
        
        adjustSwiperButtons();
        
        const resizeHandler = () => adjustSwiperButtons();
        window.addEventListener('resize', resizeHandler);
        swiper.on('slideChange', adjustSwiperButtons);
        
        // Return cleanup function
        return () => {
            window.removeEventListener('resize', resizeHandler);
            swiper.destroy(true, true);
        };
    }
    
    const cleanupSwiper = initProjectsSwiper();

    // 10. Contact form (optimized)
// 10. Contact form (optimized for Netlify)
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    const formMessage = document.getElementById('form-message');
    const formInputs = contactForm.querySelectorAll('.form__input');
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        formInputs.forEach(input => {
            const value = input.value.trim();
            const parent = input.parentElement;
            
            // Reset error state
            parent?.classList.remove('error');
            
            // Check required fields
            if (input.required && !value) {
                errors.push(`${input.name} is required`);
                parent?.classList.add('error');
                isValid = false;
            }
            
            // Special validation for email
            if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push('Please enter a valid email');
                parent?.classList.add('error');
                isValid = false;
            }
        });
        
        if (errors.length) {
            showFormMessage(errors.join('<br>'), 'error');
        }
        
        return isValid;
    }
    
    // Show form messages
    function showFormMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.innerHTML = message;
        formMessage.className = `form__message form__message--${type}`;
        formMessage.setAttribute('role', 'alert');
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form__message';
            formMessage.removeAttribute('role');
        }, 5000);
    }
    
    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        
        try {
            // Prepare form data for Netlify
            const formData = new FormData(contactForm);
            const urlEncodedData = new URLSearchParams(formData).toString();
            
            // Submit to Netlify
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: urlEncodedData
            });
            
            if (response.ok) {
                // Success - show message or redirect
                showFormMessage('Message sent successfully!', 'success');
                
                // Redirect if _next is set
                const nextPage = contactForm.querySelector('[name="_next"]')?.value;
                if (nextPage) {
                    setTimeout(() => {
                        window.location.href = nextPage;
                    }, 1500);
                } else {
                    // Reset form if no redirect
                    setTimeout(() => {
                        contactForm.reset();
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalText;
                    }, 3000);
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('Failed to send message. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
    
    // Initialize form
    contactForm.addEventListener('submit', handleSubmit);
    
    // Check for success message in URL (for Netlify redirects)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('form-submitted')) {
        showFormMessage('Message sent successfully!', 'success');
    }
    
    // Cleanup function
    return () => {
        contactForm.removeEventListener('submit', handleSubmit);
    };
}
    
    const cleanupForm = initContactForm();

    // 11. Hero animations (optimized)
function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;
    
    // Use will-change for animated elements
    document.querySelectorAll('.hero__title, .hero__subtitle, .hero__buttons, .hero__blob')
        .forEach(el => el.style.willChange = 'transform, opacity');
    
    const tl = gsap.timeline({
        defaults: { 
            ease: 'power3.out',
            immediateRender: false // Better for performance
        }
    });
    
    tl.from('.hero__title', { 
        duration: 1, 
        y: 50, 
        opacity: 0,
        autoAlpha: 0 // Combines opacity and visibility
    })
          .from('.hero__subtitle', { duration: 1, y: 30, opacity: 0 }, '-=0.7')
          .from('.hero__buttons', { duration: 1, y: 30, opacity: 0 }, '-=0.7')
          .from('.hero__blob', { 
              duration: 1.5, 
              scale: 0.8, 
              opacity: 0, 
              ease: 'elastic.out(1, 0.5)' 
          }, '-=0.5');
              tl.eventCallback('onComplete', () => {
        document.querySelectorAll('.hero__title, .hero__subtitle, .hero__buttons, .hero__blob')
            .forEach(el => el.style.willChange = '');
    });
    }
    
    initHeroAnimations();

    // 12. Update current year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // 13. Hero layout adjustments
    function adjustHeroLayout() {
        const heroData = document.querySelector('.hero__data');
        if (!heroData) return;
        
        if (window.innerWidth < 576) {
            heroData.style.position = 'relative';
            heroData.style.bottom = 'auto';
            heroData.style.right = 'auto';
            heroData.style.width = '100%';
            heroData.style.justifyContent = 'center';
        } else {
            heroData.style.position = 'absolute';
            heroData.style.bottom = '-2rem';
            heroData.style.right = '0';
            heroData.style.width = 'auto';
        }
    }
    
    adjustHeroLayout();
    window.addEventListener('resize', adjustHeroLayout);
    
    // Cleanup function for the entire app
    window.cleanupPortfolio = function() {
        scrollObserver?.disconnect();
        cleanupCursor?.();
        cleanupTheme?.();
        cleanupMenu?.();
        cleanupScroll?.();
        cleanupSkills?.();
        cleanupSwiper?.();
        cleanupForm?.();
        window.removeEventListener('resize', adjustHeroLayout);
    };
});

// Only use ScrollReveal if needed
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 1500,
        delay: 200,
        reset: false
    });
    
    sr.reveal('.hero__content, .about__content, .skills__content, .projects__content, .contact__content', {
        interval: 200
    });
}