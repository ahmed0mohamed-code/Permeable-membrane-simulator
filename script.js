const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d')

const countInput = document.getElementById('particlesCount');
const countDisplay = document.getElementById('countVal');
const poreInput = document.getElementById('poreSize');
const poreDisplay = document.getElementById('poreVal');
const tempInput = document.getElementById('tempControl');
const tempDisplay = document.getElementById('tempVal');

let width, height, membraneX;
let particles = [];
let history = [];
let poreSize = parseInt(poreInput.value);
let speedMultiplier = parseInt(tempInput.value) / 10;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    membraneX = width / 2;
}

poreInput.addEventListener('input', function() {
    poreSize = parseInt(this.value);
    poreDisplay.innerText = poreSize;

    particles.forEach(p => p.updateColor());
});

countInput.addEventListener('input', function() {
    countDisplay.innerText = this.value;
    init();
});

tempInput.addEventListener('input', function() {
    speedMultiplier = parseInt(this.value) / 10;
    tempDisplay.innerText = this.value;
});

class Particle {
    constructor(x, y, radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.updateColor();

        this.dxBase = (Math.random() - 0.5) * 2;
        this.dyBase = (Math.random() - 0.5) * 2;
    }

    updateColor() {
        this.color = this.radius > poreSize ? '#ff4d4d' : '#4dff4d';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {

        let currentDx = this.dxBase * speedMultiplier;
        let currentDy = this.dyBase * speedMultiplier;

        if (this.y + this.radius >= height || this.y - this.radius <=0) {
            this.dyBase = -this.dyBase;
        }

        if (this.x + this.radius >= width || this.x - this.radius <= 0) {
            this.dxBase = -this.dxBase;
        }
        
        if ( Math.abs(this.x - membraneX) < this.radius + 5) {

            if (this.radius > poreSize) {

                if (this.x < membraneX && currentDx >0) {
                    this.dxBase = -this.dxBase;
                }

                else if (this.x > membraneX && this.dxBase < 0) {
                    this.dxBase = - this.dxBase;
                }

            }

        }

        this.x += this.dxBase * speedMultiplier;
        this.y += this.dyBase * speedMultiplier;

        this.draw();
    }
}

function init() {
    resize();
    particles = [];
    history = [];
    const count = parseInt(countInput.value);

    for( let i = 0; i < count; i++) {
        const radius = Math.random() * 20 + 5;

        const spawnWidth = membraneX - 100;
        const x = Math.random() * spawnWidth + 50;
        const y = Math.random() * (height - 100) + 50;

        particles.push(new Particle(x, y, radius));
    }
}

function drawMembrane() {
    ctx.beginPath();
    ctx.setLineDash([5,15]);
    ctx.moveTo(membraneX, 0);
    ctx.lineTo(membraneX, height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawStats() {

    let leftCount = 0;
    particles.forEach(p => {if (p.x < membraneX) leftCount++; });

    const total = particles.length;
    if (total === 0) return;

    const leftPercent = (leftCount / total) * 100;

    history.push(leftPercent);
    if (history.length > width / 2) {
        history.shift();
    }

    const barWidth = 300;
    const barHeight = 20;
    const barX = (width / 2) - (barWidth / 2);

    ctx.fillStyle = '#00CED1'
    ctx.fillRect(barX, 30, barWidth, barHeight);

    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(barX, 30, (leftPercent / 100) * barWidth, barHeight);

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`left: ${Math.round(leftPercent)}% | Right: ${Math.round(100 - leftPercent)}%`, width / 2, 20);

    const graphHeight = 100;
    const graphBottom = height - 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, graphBottom - graphHeight, width, graphHeight);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const midY = graphBottom - (graphHeight / 2);
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;

    for (let I = 0; I < history.length; I++){
        const percent = history[I];

        const y = graphBottom - (percent / 100) *graphHeight;
        const x = I * 2;

        if (I === 0) {
            ctx.moveTo(x,y);
        }
        else {
            ctx.lineTo(x, y);
        }
        
    }

    ctx.stroke();

    ctx.fillStyle = 'gray';
    ctx.textAlign = 'left';
    ctx.fillText("Diffusion History (Left Concentration)", 10, graphBottom - graphHeight - 5);

}

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, width, height);

    drawMembrane();

    particles.forEach(p => p.update());

    drawStats();
}

window.addEventListener('resize', resize)
init();
animate();