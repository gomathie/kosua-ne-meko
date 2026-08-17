import { UserTicket } from '../types';
import { EVENT_DETAILS } from '../data/eventData';

export async function downloadTicketImage(ticket: UserTicket): Promise<void> {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // --- Background gradient ---
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#1c1917');   // stone-900
  bgGrad.addColorStop(0.6, '#292524'); // stone-800
  bgGrad.addColorStop(1, '#431407');   // orange-950
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // --- Decorative circles ---
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(W - 80, 200, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, H - 300, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Orange accent bar at top ---
  const topBarGrad = ctx.createLinearGradient(0, 0, W, 0);
  topBarGrad.addColorStop(0, '#ea580c');
  topBarGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, W, 12);

  // --- Header section ---
  let y = 80;
  ctx.fillStyle = '#ea580c';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL EVENT PASS', W / 2, y);

  y += 70;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 72px system-ui, -apple-system, sans-serif';
  ctx.fillText('KOSUA NE MEKO', W / 2, y);

  y += 70;
  ctx.font = '900 56px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#22c55e';
  ctx.fillText('HANGOUT 2.0', W / 2, y);

  y += 50;
  ctx.fillStyle = '#a8a29e';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('FREE ADMISSION \u2022 IN COLLABORATION WITH PEBBLE', W / 2, y);

  // --- Divider line ---
  y += 50;
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, y);
  ctx.lineTo(W - 80, y);
  ctx.stroke();

  // --- Pass type badge ---
  y += 60;
  const badgeW = 460;
  const badgeH = 60;
  const badgeX = (W - badgeW) / 2;
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.roundRect(badgeX, y - 40, badgeW, badgeH, 30);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(ticket.passName.toUpperCase(), W / 2, y - 4);

  // --- Attendee Name (large, prominent) ---
  y += 80;
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('ATTENDEE NAME', W / 2, y);

  y += 60;
  ctx.fillStyle = '#ffffff';
  const displayName = ticket.customerName.toUpperCase();
  // Shrink font if name is too long
  const maxNameW = W - 160;
  let nameFontSize = 52;
  ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
  while (ctx.measureText(displayName).width > maxNameW && nameFontSize > 28) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
  }
  ctx.fillText(displayName, W / 2, y);

  // --- Info grid ---
  y += 80;
  const colLeft = W * 0.3;
  const colRight = W * 0.7;

  // Date
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('DATE & TIME', colLeft, y);
  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(EVENT_DETAILS.dateString, colLeft, y + 40);

  // Location
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('LOCATION', colRight, y);
  ctx.fillStyle = '#d6d3d1';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText('North Dzorwulu, Accra', colRight, y + 40);

  y += 100;

  // Venue
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('VENUE', colLeft, y);
  ctx.fillStyle = '#d6d3d1';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText('Cencor Venue', colLeft, y + 40);

  // Meko Choice
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('MEKO CHOICE', colRight, y);
  ctx.fillStyle = '#fb923c';
  let mekoText = ticket.mekoLevel;
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  if (ctx.measureText(mekoText).width > 300) {
    mekoText = mekoText.substring(0, 22) + '\u2026';
  }
  ctx.fillText(mekoText, colRight, y + 40);

  y += 100;

  // Quantity
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('QUANTITY', colLeft, y);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${ticket.quantity} Pass${ticket.quantity > 1 ? 'es' : ''}`, colLeft, y + 40);

  // Pass ID
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('PASS ID', colRight, y);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 30px monospace';
  ctx.fillText(ticket.id, colRight, y + 40);

  // --- Divider with dashed line (ticket tear effect) ---
  y += 100;
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(60, y);
  ctx.lineTo(W - 60, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cut circles on sides (tear perforation effect)
  ctx.fillStyle = '#1c1917';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(0, y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W, y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // --- QR Code section ---
  y += 40;
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN QR CODE AT GATE', W / 2, y + 20);

  // White QR container
  const qrSize = 280;
  const qrX = (W - qrSize - 40) / 2;
  const qrY = y + 45;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrSize + 40, qrSize + 40, 24);
  ctx.fill();

  // Load and draw QR code
  try {
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject(new Error('QR load failed'));
      qrImg.src = ticket.qrCodeUrl;
    });
    ctx.drawImage(qrImg, qrX + 20, qrY + 20, qrSize, qrSize);
  } catch {
    // Fallback: draw placeholder text if QR fails to load
    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(ticket.id, W / 2, qrY + qrSize / 2 + 20);
  }

  // --- Footer ---
  const footerY = H - 120;
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(W - 80, footerY);
  ctx.stroke();

  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Organized by Ekow Sam Farms  \u2022  In collaboration with Pebble', W / 2, footerY + 40);

  ctx.fillStyle = '#57534e';
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillText(`FREE ENTRY  \u2022  ${EVENT_DETAILS.time}  \u2022  ${EVENT_DETAILS.city}`, W / 2, footerY + 75);

  // --- Trigger download ---
  const link = document.createElement('a');
  link.download = `KosuaNeMeko-Pass-${ticket.customerName.replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
