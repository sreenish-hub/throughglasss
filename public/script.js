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

// 4. CONTACT FORM - Using Formspree (Free service)
async function handleContactSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('send-btn');
  const originalText = btn.innerText;
  const form = e.target;
  
  const payload = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    message: document.getElementById('contact-message').value
  };
  
  btn.innerText = "Sending...";
  btn.disabled = true;
  
  try {
    // FIXED: Use the full Formspree URL directly
    const formspreeUrl = 'https://formspree.io/f/mqeezkbz';
    
    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      alert('✅ Message sent successfully! We\'ll respond within 24 hours.');
      form.reset();
    } else {
      alert('❌ Error sending message. Please try again.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('❌ Network Error. Please check your connection and try again.');
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
