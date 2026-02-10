import type { Verse } from "@shared/schema";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

const GOLD = "#DFAC2A";
const BG_COLOR = "#000000";
const TEXT_COLOR = "#FFFFFF";
const MUTED_COLOR = "#A0A0A0";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateShareImage(verse: Verse): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  const borderInset = 40;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(borderInset, borderInset, W - borderInset * 2, H - borderInset * 2);

  const logo = new Image();
  logo.crossOrigin = "anonymous";
  await new Promise<void>((resolve) => {
    logo.onload = () => resolve();
    logo.onerror = () => resolve();
    logo.src = logoPath;
  });

  if (logo.complete && logo.naturalWidth > 0) {
    const logoH = 180;
    const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
    ctx.drawImage(logo, (W - logoW) / 2, 70, logoW, logoH);
  }

  let y = 290;

  ctx.fillStyle = GOLD;
  ctx.font = "600 14px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  const dateText = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  ctx.fillText(dateText, W / 2, y);
  ctx.letterSpacing = "0px";
  y += 40;

  const lineGradient = ctx.createLinearGradient(W / 2 - 60, y, W / 2 + 60, y);
  lineGradient.addColorStop(0, "transparent");
  lineGradient.addColorStop(0.5, GOLD + "66");
  lineGradient.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, y);
  ctx.lineTo(W / 2 + 60, y);
  ctx.stroke();
  y += 50;

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "italic 28px 'Lora', 'Georgia', serif";
  ctx.textAlign = "center";
  const verseText = `\u201C${verse.verseText}\u201D`;
  const verseLines = wrapText(ctx, verseText, W - 160);
  for (const line of verseLines) {
    ctx.fillText(line, W / 2, y);
    y += 40;
  }
  y += 10;

  ctx.fillStyle = GOLD;
  ctx.font = "600 16px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText(`\u2014 ${verse.reference} \u2014`, W / 2, y);
  ctx.letterSpacing = "0px";
  y += 60;

  ctx.fillStyle = GOLD;
  ctx.font = "700 12px 'Inter', sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("DECODED", W / 2, y);
  ctx.letterSpacing = "0px";

  const decLineY = y + 15;
  const decLine = ctx.createLinearGradient(W / 2 - 100, decLineY, W / 2 + 100, decLineY);
  decLine.addColorStop(0, "transparent");
  decLine.addColorStop(0.3, GOLD + "44");
  decLine.addColorStop(0.7, GOLD + "44");
  decLine.addColorStop(1, "transparent");
  ctx.strokeStyle = decLine;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 100, decLineY);
  ctx.lineTo(W / 2 + 100, decLineY);
  ctx.stroke();
  y += 50;

  ctx.fillStyle = MUTED_COLOR;
  ctx.font = "18px 'DM Sans', 'Inter', sans-serif";
  const decodedLines = wrapText(ctx, verse.decodedMessage, W - 160);
  for (const line of decodedLines) {
    ctx.fillText(line, W / 2, y);
    y += 30;
  }

  const footerY = H - 80;
  ctx.fillStyle = GOLD + "88";
  ctx.font = "500 13px 'Inter', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("DECODEDFAITHEMPIRE.ORG", W / 2, footerY);
  ctx.letterSpacing = "0px";

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}
