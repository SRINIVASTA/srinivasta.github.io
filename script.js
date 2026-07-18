const canvas = document.getElementById('graphics-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let cursorParticles = [];

const mouse = {
    x: undefined,
    y: undefined
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
    for (let i = 0; i < 2; i++) {
        cursorParticles.push({
            x: mouse.x,
            y: mouse.y,
            size: Math.random() * 4 + 2,
            vx: (Math.random() - 0.5) * 2.5,
            vy: (Math.random() - 0.5) * 2.5,
            alpha: 1,
            color: Math.random() > 0.5 ? '57, 255, 20' : '255, 215, 0'
        });
    }
});

for (let i = 0; i < 150; i++) {
    const colorTheme = Math.random() > 0.5 ? 'rgba(57, 255, 20, ' : 'rgba(255, 215, 0, ';
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.8,
        speedY: -(Math.random() * 1.4 + 0.3),
        driftX: (Math.random() - 0.5) * 0.2,
        baseColor: colorTheme
    });
}

function handleGraphicsEngine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- 1. RENDER BACKGROUND RISING MATRIX NODES (PERFORMANCE OPTIMIZED) ---
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.04)';
    const len = stars.length;

    for (let i = 0; i < len; i++) {
        let star = stars[i];
        star.y += star.speedY;
        star.x += star.driftX;

        if (star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width;
            star.speedY = -(Math.random() * 1.4 + 0.3);
        }

        ctx.fillStyle = star.baseColor + '0.55)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // OPTIMIZATION: Start checking distance from the next element (j = i + 1) to eliminate 50% of duplicate evaluations
        for (let j = i + 1; j < len; j++) {
            let targetStar = stars[j];
            
            // QUICK BOX FILTER: Fast mathematical escape check prior to execution of expensive square-root hypot calculations
            if (Math.abs(star.x - targetStar.x) < 100 && Math.abs(star.y - targetStar.y) < 100) {
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(targetStar.x, targetStar.y);
                ctx.stroke();
            }
        }
    }

    // --- 2. RENDER INTERACTIVE MOUSE PAINT SHADING & STARBURSTS ---
    for (let i = cursorParticles.length - 1; i >= 0; i--) {
        let p = cursorParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
            cursorParticles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x + p.size * 0.4, p.y - p.size * 0.4);
        ctx.lineTo(p.x + p.size, p.y);
        ctx.lineTo(p.x + p.size * 0.4, p.y + p.size * 0.4);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.lineTo(p.x - p.size * 0.4, p.y + p.size * 0.4);
        ctx.lineTo(p.x - p.size, p.y);
        ctx.lineTo(p.x - p.size * 0.4, p.y - p.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    
    requestAnimationFrame(handleGraphicsEngine);
}

handleGraphicsEngine();
