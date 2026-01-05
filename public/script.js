// 1. LOAD PRODUCTS
async function loadStore() {
    const track = document.getElementById('track');
    if(!track) return;

    try {
        const response = await fetch('/api/presets');
        const data = await response.json();

        if(data.length === 0) {
            track.innerHTML = '<p class="text-gray-500">No presets found. Add some in Admin.</p>';
            return;
        }

        track.innerHTML = data.map(p => `
            <div class="preset-card">
                <img src="${p.img}" alt="${p.name}">
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
    } catch (error) {
        console.error('Failed to load presets:', error);
    }
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

// 4. CONTACT FORM
async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('send-btn');
    const originalText = btn.innerText;

    const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        message: document.getElementById('contact-message').value
    };

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert('✅ Sent successfully!');
            e.target.reset();
        } else {
            alert('❌ Error: ' + (data.error || 'Check your fields'));
        }
    } catch (err) {
        alert('❌ Network Error. Is server running?');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    loadStore();
    initCarouselNav();
    initComparisonSlider();
});