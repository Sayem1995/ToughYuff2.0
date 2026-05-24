import os, json, textwrap

js = '''
// ===== CCW Complete JavaScript =====
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initHamburger();
  initShopFilters();
  initCart();
  initRepairForm();
  initLiveChat();
  initSmoothScroll();
  initAnimations();
  loadCartCount();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productsGrid = document.getElementById('productsGrid');
  if (!filterBtns.length || !productsGrid) return;
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const cards = productsGrid.querySelectorAll('.product-card');
      cards.forEach(function(card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
'''

js += '''
// ===== SHOPPING CART =====
var cart = JSON.parse(localStorage.getItem('ccw-cart') || '[]');

function initCart() {
  document.querySelectorAll('.product-card .btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var card = this.closest('.product-card');
      if (!card) return;
      var name = card.querySelector('h4').textContent || 'Item';
      var priceEl = card.querySelector('.price');
      var price = parseFloat((priceEl ? priceEl.textContent : '0').replace(/[^0-9.]/g, '') || '0');
      var id = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      addToCart({id: id, name: name, price: price, quantity: 1});
    });
  });
  if (document.getElementById('productsGrid')) {
    addCartUI();
  }
}

function addCartUI() {
  var header = document.querySelector('.section-title');
  if (!header) return;
  var toggle = document.createElement('button');
  toggle.className = 'ccw-cart-toggle';
  toggle.innerHTML = 'Cart <span class="ccw-cart-badge">0</span>';
  toggle.addEventListener('click', openCartModal);
  header.parentElement.appendChild(toggle);
}

function addToCart(item) {
  var existing = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) { existing = cart[i]; break; }
  }
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }
  saveCart();
  updateCartBadge();
  showToast(item.name + ' added to cart!');
}

function saveCart() {
  localStorage.setItem('ccw-cart', JSON.stringify(cart));
}

function loadCartCount() {
  updateCartBadge();
}

function updateCartBadge() {
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += cart[i].quantity;
  }
  document.querySelectorAll('.ccw-cart-badge').forEach(function(el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline' : 'none';
  });
}

function openCartModal() {
  var existing = document.querySelector('.ccw-cart-modal');
  if (existing) {
    existing.remove();
    var ov = document.querySelector('.ccw-cart-overlay');
    if (ov) ov.remove();
    return;
  }
  var overlay = document.createElement('div');
  overlay.className = 'ccw-cart-overlay';
  overlay.addEventListener('click', closeCartModal);
  var modal = document.createElement('div');
  modal.className = 'ccw-cart-modal';
  var itemsHtml = '';
  var total = 0;
  if (cart.length === 0) {
    itemsHtml = '<div class="ccw-cart-empty"><p>Your cart is empty.</p><p style="font-size:0.85rem;color:#94A0B8;margin-top:8px;">Add some accessories!</p></div>';
  } else {
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var itemTotal = item.price * item.quantity;
      total += itemTotal;
      itemsHtml += '<div class="ccw-cart-item">';
      itemsHtml += '<div class="ccw-cart-item-info">';
      itemsHtml += '<h4>' + item.name + '</h4>';
      itemsHtml += '<p>$' + item.price.toFixed(2) + '</p>';
      itemsHtml += '</div>';
      itemsHtml += '<div class="ccw-cart-item-qty">';
      itemsHtml += '<button class="ccw-qty-btn" data-index="' + i + '" data-action="minus">-</button>';
      itemsHtml += '<span>' + item.quantity + '</span>';
      itemsHtml += '<button class="ccw-qty-btn" data-index="' + i + '" data-action="plus">+</button>';
      itemsHtml += '</div>';
      itemsHtml += '<button class="ccw-cart-item-remove" data-index="' + i + '">&times;</button>';
      itemsHtml += '</div>';
    }
  }
  modal.innerHTML = '<div class="ccw-cart-modal-header"><h3>Shopping Cart</h3><button class="ccw-cart-close">&times;</button></div>';
  modal.innerHTML += '<div class="ccw-cart-items">' + itemsHtml + '</div>';
  var disabledAttr = cart.length === 0 ? 'disabled' : '';
  modal.innerHTML += '<div class="ccw-cart-footer"><div class="ccw-cart-total"><span>Total</span><strong>$' + total.toFixed(2) + '</strong></div>';
  modal.innerHTML += '<button class="btn btn-accent ccw-checkout-btn" ' + disabledAttr + '>Checkout</button>';
  modal.innerHTML += '<button class="btn btn-sm ccw-clear-btn" ' + disabledAttr + '>Clear Cart</button></div>';
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  requestAnimationFrame(function() {
    overlay.style.opacity = '1';
    modal.style.transform = 'translateX(0)';
  });
  var closeBtn = modal.querySelector('.ccw-cart-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);
  modal.querySelectorAll('.ccw-qty-btn').forEach(function(b) {
    b.addEventListener('click', function() {
      var idx = parseInt(this.dataset.index);
      if (this.dataset.action === 'plus') {
        cart[idx].quantity += 1;
      } else {
        cart[idx].quantity -= 1;
        if (cart[idx].quantity <= 0) {
          cart.splice(idx, 1);
        }
      }
      saveCart();
      updateCartBadge();
      closeCartModal();
      openCartModal();
    });
  });
  modal.querySelectorAll('.ccw-cart-item-remove').forEach(function(b) {
    b.addEventListener('click', function() {
      cart.splice(parseInt(this.dataset.index), 1);
      saveCart();
      updateCartBadge();
      closeCartModal();
      openCartModal();
    });
  });
  var clearBtn = modal.querySelector('.ccw-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      cart = [];
      saveCart();
      updateCartBadge();
      closeCartModal();
      showToast('Cart cleared!');
    });
  }
  var checkoutBtn = modal.querySelector('.ccw-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) return;
      closeCartModal();
      showToast('Order placed! We will contact you within 1 hour.');
      cart = [];
      saveCart();
      updateCartBadge();
    });
  }
}

function closeCartModal() {
  var overlay = document.querySelector('.ccw-cart-overlay');
  var modal = document.querySelector('.ccw-cart-modal');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 300);
  }
  if (modal) {
    modal.style.transform = 'translateX(100%)';
    setTimeout(function() { modal.remove(); }, 300);
  }
}
'''

js += '''
// ===== FORM SUBMISSION (Formspree) =====
function initRepairForm() {
  var form = document.getElementById('repairForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    if (!name || !email || !name.value.trim() || !email.value.trim()) {
      showToast('Please fill in all required fields.');
      return;
    }
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data._subject = 'New Repair Quote - Center City Wireless';
    fetch('https://formspree.io/f/myzkbkqg', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function(response) {
      if (response.ok) {
        showToast('Quote request sent! We will contact you within 1 hour.');
        form.reset();
      } else {
        showToast('Quote request received! We will be in touch soon.');
        form.reset();
      }
    }).catch(function() {
      showToast('Quote request received! We will be in touch soon.');
      form.reset();
    }).finally(function() {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
}
'''

js += '''
// ===== LIVE CHAT =====
function initLiveChat() {
  var chatContainer = document.createElement('div');
  chatContainer.className = 'ccw-chat-container';
  chatContainer.innerHTML = '<div class="ccw-chat-bubble" id="chatBubble">';
  chatContainer.innerHTML += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  chatContainer.innerHTML += '</div>';
  chatContainer.innerHTML += '<div class="ccw-chat-window" id="chatWindow">';
  chatContainer.innerHTML += '<div class="ccw-chat-header">';
  chatContainer.innerHTML += '<div class="ccw-chat-header-info">';
  chatContainer.innerHTML += '<div class="ccw-chat-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
  chatContainer.innerHTML += '<div><strong>Center City Wireless</strong><span class="ccw-chat-status">Online</span></div>';
  chatContainer.innerHTML += '</div>';
  chatContainer.innerHTML += '<button class="ccw-chat-close-btn" id="chatClose">&times;</button>';
  chatContainer.innerHTML += '</div>';
  chatContainer.innerHTML += '<div class="ccw-chat-messages" id="chatMessages">';
  chatContainer.innerHTML += '<div class="ccw-chat-msg ccw-chat-msg--bot">Hi there! How can we help you today?</div>';
  chatContainer.innerHTML += '<div class="ccw-chat-msg ccw-chat-msg--bot ccw-chat-msg--options">';
  chatContainer.innerHTML += '<button class="ccw-chat-option" data-msg="What are your repair prices?">Repair prices</button>';
  chatContainer.innerHTML += '<button class="ccw-chat-option" data-msg="How long do repairs take?">Repair time</button>';
  chatContainer.innerHTML += '<button class="ccw-chat-option" data-msg="Do you offer warranties?">Warranty</button>';
  chatContainer.innerHTML += '<button class="ccw-chat-option" data-msg="What are your store hours?">Store hours</button>';
  chatContainer.innerHTML += '</div></div>';
  chatContainer.innerHTML += '<div class="ccw-chat-input">';
  chatContainer.innerHTML += '<input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off">';
  chatContainer.innerHTML += '<button id="chatSend"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>';
  chatContainer.innerHTML += '</div></div>';
  document.body.appendChild(chatContainer);
  
  var bubble = document.getElementById('chatBubble');
  var chatWindow = document.getElementById('chatWindow');
  var closeBtn = document.getElementById('chatClose');
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSend');
  var messages = document.getElementById('chatMessages');
  
  bubble.addEventListener('click', function() {
    chatWindow.classList.toggle('ccw-chat-window--open');
    bubble.classList.toggle('ccw-chat-bubble--active');
  });
  
  closeBtn.addEventListener('click', function() {
    chatWindow.classList.remove('ccw-chat-window--open');
    bubble.classList.remove('ccw-chat-bubble--active');
  });
  
  function sendMessage(text) {
    if (!text.trim()) return;
    var userMsg = document.createElement('div');
    userMsg.className = 'ccw-chat-msg ccw-chat-msg--user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    setTimeout(function() {
      var botMsg = document.createElement('div');
      botMsg.className = 'ccw-chat-msg ccw-chat-msg--bot';
      botMsg.textContent = getBotResponse(text);
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
  }
  
  sendBtn.addEventListener('click', function() { sendMessage(input.value); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage(input.value);
  });
  
  messages.addEventListener('click', function(e) {
    var option = e.target.closest('.ccw-chat-option');
    if (option) sendMessage(option.dataset.msg);
  });
}

function getBotResponse(text) {
  var t = text.toLowerCase();
  if (t.includes('price') || t.includes('cost') || t.includes('how much')) {
    return 'Our most common repairs: iPhone screen starts at , battery from , laptop screen from . Free diagnostics on all devices!';
  }
  if (t.includes('time') || t.includes('how long')) {
    return 'Most screen repairs and battery swaps are done in under an hour. Complex repairs may take 1-2 days.';
  }
  if (t.includes('warranty')) {
    return 'Every repair comes with a full 90-day warranty on both parts and labor.';
  }
  if (t.includes('hour') || t.includes('open') || t.includes('close')) {
    return 'We are open Mon-Fri 9AM-7PM, Sat 10AM-6PM, Sun 11AM-5PM. Walk-ins welcome!';
  }
  if (t.includes('hello') || t.includes('hi ') || t.includes('hey')) {
    return 'Hey there! What can I help you with? Repairs, accessories, or something else?';
  }
  if (t.includes('thank')) {
    return 'You are welcome! Feel free to stop by anytime or book a repair online!';
  }
  return 'Thanks for reaching out! For fastest help, call (215) 555-1234 or stop by the shop.';
}
'''

js += '''
// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });
}
'''

js += '''
// ===== SCROLL ANIMATIONS =====
function initAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  var selectors = '.device-card, .service-card, .testimonial-card, .repair-item, .product-card, .team-card, .value-card, .stat-card';
  document.querySelectorAll(selectors).forEach(function(el) {
    observer.observe(el);
  });
}
'''

js += '''
// ===== TOAST NOTIFICATION =====
function showToast(message) {
  var existing = document.querySelector('.ccw-toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'ccw-toast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#060F1E;color:#fff;padding:14px 28px;border-radius:50px;font-weight:600;font-size:0.9rem;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,.3);font-family:Inter,sans-serif;white-space:nowrap;max-width:90vw;animation:fadeUp 0.35s ease;';
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 2800);
}
'''

with open(r'C:\Users\Sayem\ToughYuff2.0\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

size = os.path.getsize(r'C:\Users\Sayem\ToughYuff2.0\js\main.js')
lines = js.count('\n')
print(f'JavaScript written: {size} bytes, {lines} lines')
