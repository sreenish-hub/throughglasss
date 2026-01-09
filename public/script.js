// PRESET DATA - Load from JSON file
const PRESETS_DATA = [
  {
    id: 1,
    name: 'Golden Hour',
    desc: 'Warm, cinematic color grading for portrait & outdoor storytelling',
    img: '/images/golden-hour.jpg',
    price: '$29',
    link: 'https://gumroad.com/throughglasss'
  },
  {
    id: 2,
    name: 'Midnight Blue',
    desc: 'Deep, moody tones perfect for dramatic cinematic looks',
    img: '/images/midnight-blue.jpg',
    price: '$29',
    link: 'https://gumroad.com/throughglasss'
  },
  {
    id: 3,
    name: 'Vintage Film',
    desc: 'Classic analog film stock emulation for nostalgic aesthetics',
    img: '/images/vintage-film.jpg',
    price: '$29',
    link: 'https://gumroad.com/throughglasss'
  }
];

// 1. LOAD PRODUCTS
function loadStore() {
  const track = document.getElementById('track');
  if(!track) return;
  
  const data = PRESETS_DATA;
  if(data.length === 0) {
    track.innerHTML = '<p class="text-gray-500">No presets available. Check back soon!</p>';
    return;
  }
  
  track.innerHTML = data.map(p => `
    <div class="preset-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="card-overlay">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price-row">
          <span>${p.price}</span>
          <a href="${p.link}" target="_blank" class="text-white border-b border-white text-sm">GET IT</a>
        </div>
      </div>
    </div>
  `).join('');
}

// 2. SMART CAROUSEL NAV
function initCarouselNav() {
  const track = document.getElementById('track');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if(!track || !prevBtn || !nextBtn) return;
  // Card Width (340) + Gap (32) = 372
  const scrollAmount = 372; 
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

// 3. COMPARISON SLIDER
function initComparisonSlider() {
  const container = document.getElementById('impact-slider');
  const reveal = document.getElementById('slider-reveal');
  const knob = document.getElementById('slider-knob');
  if(!container) return;
  
  const move = (e) => {
    const rect = container.getBoundingClientRect();
    let x = (e.pageX || e.touches[0].pageX) - rect.left;
    if(x < 0) x = 0;
    if(x > rect.width) x = rect.width;
    
    const percent = (x / rect.width) * 100;
    reveal.style.width = percent + '%';
    knob.style.left = percent + '%';
  };
  container.addEventListener('mousemove', move);
  container.addEventListener('touchmove', move);
}

// 4. CONTACT FORM - Simple local validation
async function handleContactSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('send-btn');
  const originalText = btn.innerText;
  const form = e.target;
  
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('❌ Please enter a valid email address.');
    return;
  }
  
  if (!message.trim()) {
    alert('❌ Message cannot be empty.');
    return;
  }
  
  btn.innerText = "Sending...";
  btn.disabled = true;
  
  try {
    // Send to Formspree - CORS enabled service
    const response = await fetch('https://formspree.io/f/mqeezkbz', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: `New message from ${name} (${email})`
      })
    });
    
    if (response.ok || response.status === 200) {
      alert('✅ Message sent successfully! We\'ll respond within 24 hours.');
      form.reset();
    } else {
      alert('❌ Error sending message. Please try again.');
    }
  } catch (err) {
    console.error('Error:', err);
    // Fallback: Show user they can email directly
    alert('⚠️ Unable to send via form. Please email us directly:\nsupport@throughglasss.com');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// INIT - Run on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStore();
  initCarouselNav();
  initComparisonSlider();
});
