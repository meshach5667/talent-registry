const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle Glow Behind Shield -->
  <circle cx="256" cy="240" r="160" fill="url(#glowGrad)" />

  <!-- Shield Shape -->
  <g filter="url(#shadow)">
    <path
      d="M256 96 L376 148 C376 260 324 350 256 396 C188 350 136 260 136 148 Z"
      fill="url(#shieldGrad)"
      stroke="#34d399"
      stroke-width="10"
      stroke-linejoin="round"
    />
  </g>

  <!-- Inner Checkmark -->
  <path
    d="M208 240 L242 274 L314 196"
    fill="none"
    stroke="#ffffff"
    stroke-width="26"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Verification Network Ring / Nodes -->
  <circle cx="256" cy="336" r="8" fill="#a7f3d0" />
  <circle cx="204" cy="180" r="6" fill="#a7f3d0" opacity="0.8" />
  <circle cx="308" cy="180" r="6" fill="#a7f3d0" opacity="0.8" />

  <!-- Base Accent Line -->
  <rect x="180" y="432" width="152" height="6" rx="3" fill="#10b981" opacity="0.8" />
</svg>
`;

async function main() {
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon.trim());

  // Generate 512x512 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  // Generate 192x192 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // Generate apple-touch-icon (180x180)
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  // Generate maskable icons with padding
  const maskableSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="#090d16" />
    <g transform="translate(51.2, 51.2) scale(0.8)">
      ${svgIcon.replace(/<\/?svg[^>]*>/g, '')}
    </g>
  </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192.png'));

  // Also create favicon-32.png
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, 'favicon-32.png'));

  console.log('Successfully generated all PWA icons in public/icons/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
