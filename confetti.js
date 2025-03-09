// Confetti animation library
// Based on https://www.kirilv.com/canvas-confetti/

const confetti = {
  canvas: null,
  context: null,
  particles: [],
  colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'],
  
  init: function() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    document.body.appendChild(this.canvas);
    
    this.context = this.canvas.getContext('2d');
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  },
  
  addParticle: function(x, y, spread = 1, isBottomLaunch = true) {
    const size = Math.random() * 10 + 5;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    // Horizontal speed (wider spread)
    const speedX = (Math.random() * 12 - 6) * spread;
    
    // Vertical speed - for bottom launch, make it mostly upward
    let speedY;
    if (isBottomLaunch) {
      // Strong upward velocity when launching from bottom
      speedY = -Math.random() * 15 - 10;
    } else {
      // Regular velocity for other launch positions
      speedY = (Math.random() * -15 - 5) * spread;
    }
    
    const rotation = Math.random() * 2 * Math.PI;
    const rotationSpeed = Math.random() * 0.2 - 0.1;
    
    // Add some randomness to starting position
    let startX, startY;
    if (isBottomLaunch) {
      // For bottom launch, spread horizontally but keep Y position at bottom
      startX = x + (Math.random() * 100 - 50) * spread;
      startY = y - Math.random() * 20; // Just slightly above the bottom point
    } else {
      // Regular spread for other launch positions
      startX = x + (Math.random() * 40 - 20) * spread;
      startY = y + (Math.random() * 20 - 10) * spread;
    }
    
    this.particles.push({
      x: startX,
      y: startY,
      size,
      color,
      speedX,
      speedY,
      rotation,
      rotationSpeed,
      gravity: 0.1,
      opacity: 1,
      fadeSpeed: 0.01 + Math.random() * 0.01, // Randomized fade for more natural effect
      shape: Math.random() > 0.3 ? 'circle' : 'rect' // More circles than rectangles
    });
  },
  
  update: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.fadeSpeed;
      
      this.context.save();
      this.context.translate(p.x, p.y);
      this.context.rotate(p.rotation);
      this.context.globalAlpha = p.opacity;
      this.context.fillStyle = p.color;
      
      if (p.shape === 'circle') {
        this.context.beginPath();
        this.context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.context.fill();
      } else {
        this.context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      
      this.context.restore();
    }
    
    // Remove faded out particles
    this.particles = this.particles.filter(p => p.opacity > 0);
    
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.update());
    } else {
      // Remove canvas when all particles are gone
      if (this.canvas) {
        document.body.removeChild(this.canvas);
        this.canvas = null;
      }
    }
  },
  
  start: function(x, y, amount = 200, spread = 1.5) {
    if (this.canvas) {
      document.body.removeChild(this.canvas);
    }
    
    this.init();
    
    // Default to middle of screen if no coordinates provided
    const posX = x || this.canvas.width / 2;
    const posY = y || this.canvas.height / 2;
    
    // Determine if this is a bottom launch
    const isBottomLaunch = posY > this.canvas.height * 0.9;
    
    // Create particles
    for (let i = 0; i < amount; i++) {
      this.addParticle(posX, posY, spread, isBottomLaunch);
    }
    
    // Add a second burst with slight delay for more dramatic effect
    setTimeout(() => {
      for (let i = 0; i < amount / 2; i++) {
        this.addParticle(posX, posY, spread * 0.8, isBottomLaunch);
      }
    }, 100);
    
    // For bottom launches, add a third smaller burst for a cascading effect
    if (isBottomLaunch) {
      setTimeout(() => {
        for (let i = 0; i < amount / 4; i++) {
          this.addParticle(posX, posY, spread * 0.6, isBottomLaunch);
        }
      }, 200);
    }
    
    // Start animation
    this.update();
  }
}; 