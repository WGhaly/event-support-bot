const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a simple test logo
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#3B82F6';
ctx.fillRect(0, 0, 200, 200);

// Draw text
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 48px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('TEST', 100, 100);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('test-logo.png', buffer);

console.log('✅ Test logo created: test-logo.png');
