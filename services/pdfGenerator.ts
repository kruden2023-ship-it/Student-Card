
// This service relies on jsPDF and html2canvas being loaded from a CDN in index.html
// and being available on the window object.

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

/**
 * Creates a new canvas with the content of the source canvas clipped to a rounded rectangle.
 * @param sourceCanvas The original canvas captured by html2canvas.
 * @returns A new canvas element with rounded corners.
 */
const getRoundedCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    // The card has `rounded-2xl` which is `1rem` (16px).
    // The canvas is generated with scale: 3. So, the radius on the canvas should be 16 * 3 = 48.
    const radius = 48; 

    if (!context) {
        // Fallback to the original canvas if context cannot be created.
        return sourceCanvas;
    }

    canvas.width = width;
    canvas.height = height;

    // Create a rounded rectangle path.
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(width - radius, 0);
    context.quadraticCurveTo(width, 0, width, radius);
    context.lineTo(width, height - radius);
    context.quadraticCurveTo(width, height, width - radius, height);
    context.lineTo(radius, height);
    context.quadraticCurveTo(0, height, 0, height - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    
    // Clip to the path.
    context.clip();
    
    // Draw the source canvas onto the new canvas.
    context.drawImage(sourceCanvas, 0, 0, width, height);

    return canvas;
};


/**
 * Generates an A4 PDF with ID cards for the selected students.
 * Each copy has the front on the left and the back on the right, with a border.
 * Up to 5 students per A4 page.
 * @param studentIds The IDs of the students to include in the PDF.
 * @param fileName The desired file name for the output PDF.
 */
export const generatePdf = async (studentIds: string[], fileName: string): Promise<void> => {
  const { jsPDF } = window.jspdf;
  const html2canvas = window.html2canvas;

  // Wait for fonts to be ready to prevent text rendering issues in the canvas.
  await document.fonts.ready;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const canvasOptions = {
      scale: 3, // Increase scale for better quality
      useCORS: true, // Allow loading of cross-origin images
      logging: false,
      backgroundColor: null, // Make background transparent for clipping
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      scrollX: 0,
      scrollY: 0,
    };

    // --- Layout constants ---
    const CARD_WIDTH_MM = 85.6;
    const CARD_HEIGHT_MM = 53.98;
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const CARDS_PER_PAGE = 5;

    // Calculate margins to center the block of cards on the A4 page
    const totalCardsContentHeight = CARD_HEIGHT_MM * CARDS_PER_PAGE;
    const verticalMargin = (A4_HEIGHT_MM - totalCardsContentHeight) / (CARDS_PER_PAGE + 1);

    const totalCardsContentWidth = CARD_WIDTH_MM * 2;
    const horizontalMargin = (A4_WIDTH_MM - totalCardsContentWidth) / 3;

    // --- Add card images to PDF in a loop ---
    for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];

        const frontElement = document.getElementById(`pdf-front-${studentId}`);
        const backElement = document.getElementById(`pdf-back-${studentId}`);

        if (!frontElement || !backElement) {
            console.warn(`Card elements for student ${studentId} not found, skipping.`);
            continue;
        }

        const cardIndexOnPage = i % CARDS_PER_PAGE;
        if (i > 0 && cardIndexOnPage === 0) {
            pdf.addPage();
        }

        const frontCanvasRaw = await html2canvas(frontElement, canvasOptions);
        const frontCanvasRounded = getRoundedCanvas(frontCanvasRaw);
        const frontImgData = frontCanvasRounded.toDataURL('image/png');
        
        const backCanvasRaw = await html2canvas(backElement, canvasOptions);
        const backCanvasRounded = getRoundedCanvas(backCanvasRaw);
        const backImgData = backCanvasRounded.toDataURL('image/png');


      const yPos = verticalMargin * (cardIndexOnPage + 1) + CARD_HEIGHT_MM * cardIndexOnPage;
      const xPosFront = horizontalMargin;
      const xPosBack = horizontalMargin * 2 + CARD_WIDTH_MM;

      // Add images
      pdf.addImage(frontImgData, 'PNG', xPosFront, yPos, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      pdf.addImage(backImgData, 'PNG', xPosBack, yPos, CARD_WIDTH_MM, CARD_HEIGHT_MM);

      // Add rounded borders
      pdf.setDrawColor(150, 150, 150); // Light gray border
      pdf.setLineWidth(0.1);
      // The radius is calculated to match the visual 'rounded-2xl' (1rem) on the card.
      // (1rem / 24rem width) * 85.6mm width = (16px / 384px) * 85.6mm ~= 3.57mm
      const borderRadiusMm = 3.57;
      pdf.roundedRect(xPosFront, yPos, CARD_WIDTH_MM, CARD_HEIGHT_MM, borderRadiusMm, borderRadiusMm, 'S'); // 'S' for Stroke
      pdf.roundedRect(xPosBack, yPos, CARD_WIDTH_MM, CARD_HEIGHT_MM, borderRadiusMm, borderRadiusMm, 'S');
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw to be caught by the caller's try-catch-finally block
  }
};