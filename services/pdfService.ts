import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDF = async (elementId: string, fileName: string) => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        console.error(`Element with id ${elementId} not found`);
        alert("Error: Could not find the document content to generate PDF.");
        return;
    }

    // A4 Dimensions in Pixels at 96 DPI
    // Width: 210mm approx 794px
    // Height: 297mm approx 1123px
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;

    // Validate dimensions
    if (originalElement.offsetWidth === 0 || originalElement.offsetHeight === 0) {
        console.error("Element has zero dimensions");
        alert("Error: The document content appears to be empty.");
        return;
    }

    // Wait for fonts to be ready to prevent layout shifts/overlapping text
    try {
        await document.fonts.ready;
    } catch (e) {
        console.warn("Font loading check failed, proceeding anyway", e);
    }

    // Create a temporary container to hold the clone
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    // Hide it from view, but ensure it's "visible" for the renderer
    container.style.zIndex = '-9999'; 
    // Force exact A4 pixel width for consistent text wrapping during capture
    container.style.width = `${A4_WIDTH_PX}px`; 
    document.body.appendChild(container);

    // Clone the element
    const clonedElement = originalElement.cloneNode(true) as HTMLElement;
    
    // Reset styles on the clone to ensure full capture
    clonedElement.style.width = `${A4_WIDTH_PX}px`;
    clonedElement.style.minHeight = `${A4_HEIGHT_PX}px`;
    clonedElement.style.height = 'auto'; // Allow expansion for multi-page
    clonedElement.style.margin = '0';
    clonedElement.style.padding = '0';
    clonedElement.style.overflow = 'visible'; // CRITICAL: Allow content to overflow so we capture it all
    
    // Remove any transforms or transitions that might mess up capture
    clonedElement.style.transform = 'none';
    clonedElement.style.transition = 'none';

    container.appendChild(clonedElement);

    // --- SMART PAGE BREAK LOGIC ---
    // Detect elements that cross the page boundary and push them down
    const rows = clonedElement.querySelectorAll('.pdf-item-row');
    const containerRect = clonedElement.getBoundingClientRect();
    
    // We iterate and check against page boundaries (1123px, 2246px, etc.)
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as HTMLElement;
        const rect = row.getBoundingClientRect();
        
        // Calculate relative position from top of the document
        const elTop = rect.top - containerRect.top;
        const elBottom = elTop + rect.height;
        
        // Determine which page this element starts on (0-indexed)
        const startPage = Math.floor(elTop / A4_HEIGHT_PX);
        const endPage = Math.floor(elBottom / A4_HEIGHT_PX);
        
        // If element crosses a page boundary
        if (startPage !== endPage) {
            // Calculate how much space we need to push it to the next page
            // The boundary is (startPage + 1) * A4_HEIGHT_PX
            const pageBoundary = (startPage + 1) * A4_HEIGHT_PX;
            const pushAmount = pageBoundary - elTop + 20; // +20px safety margin
            
            // Add padding-top to the first cell of the row (if table row) 
            // or margin-top if block element
            const firstCell = row.querySelector('td, th') as HTMLElement;
            if (firstCell) {
                const currentPadding = parseFloat(window.getComputedStyle(firstCell).paddingTop) || 0;
                firstCell.style.paddingTop = `${currentPadding + pushAmount}px`;
            } else {
                const currentMargin = parseFloat(window.getComputedStyle(row).marginTop) || 0;
                row.style.marginTop = `${currentMargin + pushAmount}px`;
            }
        }
    }
    // ------------------------------

    try {
        // Wait a short moment for DOM updates in the clone to settle
        await new Promise(resolve => setTimeout(resolve, 300));

        // Capture the clone
        const canvas = await html2canvas(clonedElement, {
            scale: 2, // 2x scale for Retina-like quality (keeps text sharp)
            useCORS: true, // Allow loading cross-origin images (like user logos)
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: A4_WIDTH_PX, // Ensure the render context matches our container width
            onclone: (doc) => {
                // Additional safety: ensure all elements inside are visible
                const el = doc.body.getElementsByTagName('*');
                for (let i = 0; i < el.length; i++) {
                   const htmlEl = el[i] as HTMLElement;
                   if (htmlEl.style) {
                       htmlEl.style.overflow = 'visible'; 
                   }
                }
            }
        });

        if (canvas.width === 0 || canvas.height === 0) {
            throw new Error("Canvas generation produced empty output.");
        }

        const imgData = canvas.toDataURL('image/png');
        
        // Initialize PDF document (A4 size, mm units)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfPageWidth = 210; 
        const pdfPageHeight = 297; 
        
        // Calculate image height in PDF units based on aspect ratio
        const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight);
        heightLeft -= pdfPageHeight;

        // Loop to add subsequent pages
        // Tolerance threshold (1mm) prevents blank pages due to sub-pixel rounding
        while (heightLeft >= 1) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight);
            heightLeft -= pdfPageHeight;
        }

        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        // Clean up
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};