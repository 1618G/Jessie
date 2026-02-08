/**
 * Cambridge Property Styling — Interactive Scripts
 * Quote Calculator, Scroll Animations, Micro-interactions
 */

(function () {
    'use strict';

    /* ==========================================================================
       CURSOR GLOW — subtle radial light that follows the mouse
       ========================================================================== */
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    function updateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        requestAnimationFrame(updateGlow);
    }

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorGlow) {
            cursorGlow.classList.add('cursor-glow--visible');
        }
    });

    document.addEventListener('mouseleave', function () {
        if (cursorGlow) {
            cursorGlow.classList.remove('cursor-glow--visible');
        }
    });

    updateGlow();

    /* ==========================================================================
       NAVIGATION — scroll state + mobile toggle
       ========================================================================== */
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    function handleNavScroll() {
        if (!nav) return;
        if (window.scrollY > 60) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    var navOverlay = document.getElementById('navOverlay');

    function openMobileNav() {
        if (navToggle) navToggle.classList.add('nav__toggle--active');
        if (navLinks) navLinks.classList.add('nav__links--open');
        if (navOverlay) navOverlay.classList.add('nav__overlay--visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        if (navToggle) navToggle.classList.remove('nav__toggle--active');
        if (navLinks) navLinks.classList.remove('nav__links--open');
        if (navOverlay) navOverlay.classList.remove('nav__overlay--visible');
        document.body.style.overflow = '';
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.contains('nav__links--open');
            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('.nav__link').forEach(function (link) {
            link.addEventListener('click', function () {
                closeMobileNav();
            });
        });

        // Close menu when overlay is tapped
        if (navOverlay) {
            navOverlay.addEventListener('click', closeMobileNav);
        }
    }

    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    function initScrollReveal() {
        var reveals = document.querySelectorAll('.reveal-up');
        if (!reveals.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    }

    initScrollReveal();

    /* ==========================================================================
       COUNTER ANIMATION — animates numbers on scroll
       ========================================================================== */
    function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var isDecimal = target % 1 !== 0;
        var duration = 2000;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var easedProgress = 1 - Math.pow(1 - progress, 3);
            var current = start + (target - start) * easedProgress;

            if (isDecimal) {
                el.textContent = current.toFixed(1);
            } else {
                el.textContent = Math.round(current);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function initCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach(function (el) {
            observer.observe(el);
        });
    }

    initCounters();

    /* ==========================================================================
       SMOOTH SCROLL for anchor links
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ==========================================================================
       QUOTE CALCULATOR
       Industry-standard pricing based on UK market research 2025/2026
       ========================================================================== */

    // Pricing matrix (GBP)
    var PRICING = {
        // Base prices by service type and property size
        airbnb: {
            studio: 1800,
            '2bed': 3200,
            '3bed': 5000,
            '4bed': 7500
        },
        staging: {
            studio: 1200,
            '2bed': 2200,
            '3bed': 3500,
            '4bed': 5000
        },
        refresh: {
            studio: 600,
            '2bed': 1100,
            '3bed': 1800,
            '4bed': 2800
        },

        // Package multipliers
        packages: {
            essential: 1.0,
            premium: 1.5,
            turnkey: 2.2
        },

        // Add-on flat fees
        extras: {
            photography: 350,
            listing: 150,
            garden: 450,
            express: 0 // Percentage-based, handled separately
        },

        expressMultiplier: 1.25
    };

    var currentStep = 1;
    var totalSteps = 4;
    var quoteData = {
        serviceType: null,
        propertySize: null,
        packageLevel: null,
        extras: []
    };

    var quoteForm = document.getElementById('quoteForm');
    var quoteResult = document.getElementById('quoteResult');
    var quoteProgress = document.getElementById('quoteProgress');
    var quotePrev = document.getElementById('quotePrev');
    var quoteNext = document.getElementById('quoteNext');
    var quoteReset = document.getElementById('quoteReset');
    var quoteAmount = document.getElementById('quoteAmount');
    var quoteBreakdown = document.getElementById('quoteBreakdown');

    function showStep(step) {
        if (!quoteForm) return;
        var steps = quoteForm.querySelectorAll('.quote__step');
        steps.forEach(function (s) {
            s.classList.remove('quote__step--active');
        });
        var target = quoteForm.querySelector('[data-step="' + step + '"]');
        if (target) {
            target.classList.add('quote__step--active');
        }

        // Update progress bar
        if (quoteProgress) {
            quoteProgress.style.width = ((step / totalSteps) * 100) + '%';
        }

        // Update nav buttons
        if (quotePrev) {
            quotePrev.disabled = step === 1;
        }
        if (quoteNext) {
            var nextSpan = quoteNext.querySelector('span');
            if (nextSpan) {
                nextSpan.textContent = step === totalSteps ? 'Get Quote' : 'Next';
            }
        }

        currentStep = step;
    }

    function collectData() {
        // Service type
        var serviceInput = quoteForm.querySelector('input[name="serviceType"]:checked');
        quoteData.serviceType = serviceInput ? serviceInput.value : null;

        // Property size
        var sizeInput = quoteForm.querySelector('input[name="propertySize"]:checked');
        quoteData.propertySize = sizeInput ? sizeInput.value : null;

        // Package level
        var pkgInput = quoteForm.querySelector('input[name="packageLevel"]:checked');
        quoteData.packageLevel = pkgInput ? pkgInput.value : null;

        // Extras
        quoteData.extras = [];
        var extrasInputs = quoteForm.querySelectorAll('input[name="extras"]:checked');
        extrasInputs.forEach(function (input) {
            quoteData.extras.push(input.value);
        });
    }

    function calculateQuote() {
        var serviceType = quoteData.serviceType;
        var propertySize = quoteData.propertySize;
        var packageLevel = quoteData.packageLevel;

        if (!serviceType || !propertySize || !packageLevel) return 0;

        // Base price
        var base = PRICING[serviceType][propertySize] || 0;

        // Apply package multiplier
        var packageMultiplier = PRICING.packages[packageLevel] || 1;
        var subtotal = base * packageMultiplier;

        // Add extras
        var extrasTotal = 0;
        var hasExpress = false;
        quoteData.extras.forEach(function (extra) {
            if (extra === 'express') {
                hasExpress = true;
            } else {
                extrasTotal += PRICING.extras[extra] || 0;
            }
        });

        subtotal += extrasTotal;

        // Apply express surcharge
        if (hasExpress) {
            subtotal *= PRICING.expressMultiplier;
        }

        return Math.round(subtotal);
    }

    function getServiceLabel(value) {
        var labels = {
            airbnb: 'Airbnb Fit-Out & Design',
            staging: 'Property Staging to Sell',
            refresh: 'Full Property Refresh'
        };
        return labels[value] || value;
    }

    function getSizeLabel(value) {
        var labels = {
            studio: 'Studio / 1 Bedroom',
            '2bed': '2 Bedroom',
            '3bed': '3 Bedroom',
            '4bed': '4+ Bedroom'
        };
        return labels[value] || value;
    }

    function getPackageLabel(value) {
        var labels = {
            essential: 'Essential Package',
            premium: 'Premium Package',
            turnkey: 'Turnkey Package'
        };
        return labels[value] || value;
    }

    function getExtraLabel(value) {
        var labels = {
            photography: 'Professional Photography',
            listing: 'Airbnb Listing Copy',
            garden: 'Outdoor / Garden Styling',
            express: 'Express Delivery (+25%)'
        };
        return labels[value] || value;
    }

    function showResult() {
        var total = calculateQuote();

        if (quoteForm) quoteForm.style.display = 'none';
        if (quoteResult) quoteResult.classList.add('quote__result--visible');

        // Animate the amount
        animateQuoteAmount(total);

        // Build breakdown
        if (quoteBreakdown) {
            var serviceType = quoteData.serviceType;
            var propertySize = quoteData.propertySize;
            var packageLevel = quoteData.packageLevel;

            var base = PRICING[serviceType][propertySize] || 0;
            var packageMultiplier = PRICING.packages[packageLevel] || 1;
            var packagedBase = base * packageMultiplier;

            var html = '';
            html += '<div class="breakdown-item"><span class="breakdown-label">' +
                getServiceLabel(serviceType) + ' — ' + getSizeLabel(propertySize) +
                '</span><span class="breakdown-value">£' + base.toLocaleString() + '</span></div>';

            if (packageMultiplier !== 1) {
                html += '<div class="breakdown-item"><span class="breakdown-label">' +
                    getPackageLabel(packageLevel) + ' (×' + packageMultiplier + ')</span>' +
                    '<span class="breakdown-value">£' + Math.round(packagedBase).toLocaleString() + '</span></div>';
            }

            quoteData.extras.forEach(function (extra) {
                if (extra !== 'express') {
                    html += '<div class="breakdown-item"><span class="breakdown-label">' +
                        getExtraLabel(extra) + '</span><span class="breakdown-value">£' +
                        PRICING.extras[extra].toLocaleString() + '</span></div>';
                }
            });

            if (quoteData.extras.indexOf('express') !== -1) {
                html += '<div class="breakdown-item"><span class="breakdown-label">' +
                    getExtraLabel('express') + '</span><span class="breakdown-value">Applied</span></div>';
            }

            html += '<div class="breakdown-item"><span class="breakdown-label">Estimated Total' +
                '</span><span class="breakdown-value">£' + total.toLocaleString() + '</span></div>';

            quoteBreakdown.innerHTML = html;
        }
    }

    function animateQuoteAmount(target) {
        if (!quoteAmount) return;
        var duration = 1500;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easedProgress = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(target * easedProgress);
            quoteAmount.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function resetQuote() {
        currentStep = 1;
        quoteData = { serviceType: null, propertySize: null, packageLevel: null, extras: [] };

        if (quoteForm) {
            quoteForm.style.display = '';
            // Uncheck all inputs
            quoteForm.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function (input) {
                input.checked = false;
            });
        }
        if (quoteResult) quoteResult.classList.remove('quote__result--visible');
        showStep(1);
    }

    // Event listeners
    if (quoteNext) {
        quoteNext.addEventListener('click', function () {
            collectData();

            // Validate current step
            if (currentStep === 1 && !quoteData.serviceType) return shakeButton(quoteNext);
            if (currentStep === 2 && !quoteData.propertySize) return shakeButton(quoteNext);
            if (currentStep === 3 && !quoteData.packageLevel) return shakeButton(quoteNext);

            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
            } else {
                collectData();
                showResult();
            }
        });
    }

    if (quotePrev) {
        quotePrev.addEventListener('click', function () {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
    }

    if (quoteReset) {
        quoteReset.addEventListener('click', resetQuote);
    }

    /* Email Quote — opens mailto: with quote details */
    var quoteEmailBtn = document.getElementById('quoteEmail');
    if (quoteEmailBtn) {
        quoteEmailBtn.addEventListener('click', function (e) {
            e.preventDefault();
            collectData();
            var total = calculateQuote();

            var subject = 'Cambridge Property Styling — Quote Enquiry (£' + total.toLocaleString() + ')';

            var body = 'Hi Jessie,%0D%0A%0D%0A';
            body += 'I have just used the quote calculator on your website and would love to discuss my project further.%0D%0A%0D%0A';
            body += '--- QUOTE SUMMARY ---%0D%0A';
            body += 'Service: ' + getServiceLabel(quoteData.serviceType) + '%0D%0A';
            body += 'Property Size: ' + getSizeLabel(quoteData.propertySize) + '%0D%0A';
            body += 'Package: ' + getPackageLabel(quoteData.packageLevel) + '%0D%0A';

            if (quoteData.extras.length > 0) {
                body += 'Add-ons: ' + quoteData.extras.map(function (ex) { return getExtraLabel(ex); }).join(', ') + '%0D%0A';
            }

            body += 'Estimated Total: £' + total.toLocaleString() + '%0D%0A';
            body += '---%0D%0A%0D%0A';
            body += 'My Details:%0D%0A';
            body += 'Name: %0D%0A';
            body += 'Phone: %0D%0A';
            body += 'Property Address: %0D%0A';
            body += 'Preferred Contact Time: %0D%0A%0D%0A';
            body += 'Kind regards';

            window.location.href = 'mailto:jessie@cambridgecolourconsultants.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + body;
        });
    }

    function shakeButton(btn) {
        btn.style.animation = 'shake 0.5s ease';
        btn.addEventListener('animationend', function handler() {
            btn.style.animation = '';
            btn.removeEventListener('animationend', handler);
        });
    }

    // Add shake keyframes dynamically
    var shakeStyle = document.createElement('style');
    shakeStyle.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}';
    document.head.appendChild(shakeStyle);

    // Add ripple micro-interaction on quote option selection
    if (quoteForm) {
        quoteForm.addEventListener('change', function (e) {
            var card = e.target.closest('.quote__option');
            if (!card) return;
            var optionCard = card.querySelector('.quote__option-card');
            if (optionCard) {
                optionCard.style.animation = 'selectPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                optionCard.addEventListener('animationend', function handler() {
                    optionCard.style.animation = '';
                    optionCard.removeEventListener('animationend', handler);
                });
            }
        });
    }

    // Add selectPop keyframes dynamically
    var popStyle = document.createElement('style');
    popStyle.textContent = '@keyframes selectPop{0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}}';
    document.head.appendChild(popStyle);

    /* ==========================================================================
       CONTACT FORM — simple validation + success state
       ========================================================================== */
    var contactForm = document.getElementById('contactForm');
    var contactSuccess = document.getElementById('contactSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation
            var name = document.getElementById('contactName');
            var email = document.getElementById('contactEmail');

            if (!name.value.trim() || !email.value.trim()) return;

            // Show success
            contactForm.style.display = 'none';
            if (contactSuccess) {
                contactSuccess.classList.add('contact__success--visible');
            }
        });
    }

    /* ==========================================================================
       MICRO-INTERACTIONS — magnetic buttons, tilt cards (desktop only)
       ========================================================================== */

    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
        // Magnetic effect on CTA buttons
        document.querySelectorAll('.btn--primary').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15 - 2) + 'px)';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });

        // Subtle tilt on service cards
        document.querySelectorAll('.service-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = 'translateY(-8px) perspective(600px) rotateX(' +
                    (y * -3) + 'deg) rotateY(' + (x * 3) + 'deg)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });

        // Subtle tilt on testimonial cards
        document.querySelectorAll('.testimonial').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = 'translateY(-6px) perspective(600px) rotateX(' +
                    (y * -2) + 'deg) rotateY(' + (x * 2) + 'deg)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /* ==========================================================================
       PARALLAX — subtle background movement on hero
       ========================================================================== */
    var heroGradient = document.querySelector('.hero__gradient');

    window.addEventListener('scroll', function () {
        if (!heroGradient) return;
        var scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroGradient.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
        }
    }, { passive: true });

    /* ==========================================================================
       ACTIVE NAV LINK HIGHLIGHT
       ========================================================================== */
    function highlightActiveSection() {
        var sections = document.querySelectorAll('section[id]');
        var scrollY = window.scrollY + 150;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav__link').forEach(function (link) {
                    link.classList.remove('nav__link--active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('nav__link--active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection, { passive: true });

    // Active nav link style
    var activeNavStyle = document.createElement('style');
    activeNavStyle.textContent = '.nav__link--active{color:var(--color-blush-deep)}.nav__link--active::after{width:100%}';
    document.head.appendChild(activeNavStyle);

    /* ==========================================================================
       TYPING EFFECT on hero (optional subtle text shimmer)
       ========================================================================== */
    var heroAccents = document.querySelectorAll('.hero__title--accent');
    heroAccents.forEach(function (accent) {
        accent.addEventListener('mouseenter', function () {
            accent.style.transition = 'color 0.3s ease, letter-spacing 0.3s ease';
            accent.style.letterSpacing = '3px';
        });
        accent.addEventListener('mouseleave', function () {
            accent.style.letterSpacing = '';
        });
    });

})();
