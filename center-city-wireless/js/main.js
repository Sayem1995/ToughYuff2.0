/**
 * Center City Wireless — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initShopFilters();
  initRepairForm();
  initSmoothScroll();
  initAnimations();
});

/* ── Navbar Scroll Effect ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ── Mobile Hamburger Menu ── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close when clicking a nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ── Shop Category Filters ── */
function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productsGrid = document.getElementById('productsGrid');
  if (!filterBtns.length || !productsGrid) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards = productsGrid.querySelectorAll('.product-card');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Add to cart buttons (simple toast)
  productsGrid.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const name = card?.querySelector('h4')?.textContent || 'Item';
      showToast(`${name} added to cart!`);
    });
  });
}

/* ── Repair Quote Form ── */
function initRepairForm() {
  const form = document.getElementById('repairForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Repair Quote Request:', data);

    // Simulate submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    setTimeout(() => {
      showToast("Quote request sent! We'll contact you within 1 hour.");
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1200);
  });
}

/* ── Smooth Scroll for Anchor Links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Scroll Animations ── */
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.device-card, .service-card, .testimonial-card, .repair-item, .product-card, .team-card, .value-card, .stat-card').forEach(el => {
    observer.observe(el);
  });
}

/* ── Toast Notification ── */
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.ccw-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'ccw-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--navy);
    color: #fff;
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
    animation: fadeUp 0.35s ease, fadeUp 0.35s ease reverse 2.5s forwards;
    font-family: 'Inter', sans-serif;
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
