import jsPDF from 'jspdf';
import { archivePdfReport } from './storage';

/**
 * Share PDF file directly via WhatsApp or Native Share Sheet.
 * Converts jsPDF doc to real Blob and File object, and shares via navigator.share.
 * Robust fallback to physical <a> tag download and print/view for mobile browsers & iframes.
 */
export interface SharePdfOptions {
  doc: jsPDF;
  filename: string;
  title: string;
  phone?: string;
  reportType?: any;
  period?: string;
  employeeId?: string;
  employeeName?: string;
}

/**
 * Robust physical PDF download helper using hidden <a> tag and Object URL
 * Bypasses iframe restrictions and ensures reliable mobile/desktop download
 */
export const downloadPdfBlob = (blob: Blob, filename: string): void => {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (err) {
    console.error('Error downloading PDF blob:', err);
  }
};

/**
 * Direct PDF Download trigger for jsPDF instances
 */
export const downloadPdf = (doc: jsPDF, filename: string): void => {
  try {
    const blob = doc.output('blob');
    downloadPdfBlob(blob, filename);
  } catch (err) {
    console.warn('downloadPdf fallback to doc.save', err);
    doc.save(filename);
  }
};

/**
 * Open PDF in a new browser tab for direct viewing and A4 printing
 */
export const viewOrPrintPdf = (doc: jsPDF, filename: string = 'Attendance_Report.pdf'): void => {
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // If popup blocker prevents new tab, fallback to direct download
      downloadPdfBlob(blob, filename);
    }
  } catch (err) {
    console.warn('viewOrPrintPdf fallback to download', err);
    downloadPdf(doc, filename);
  }
};

export const sharePdfToWhatsApp = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { 
    doc, 
    filename = 'Attendance_Report.pdf', 
    title = 'Attendance Report', 
    reportType = 'monthly_attendance', 
    period = new Date().toISOString().slice(0, 7), 
    employeeId, 
    employeeName 
  } = options;

  let pdfBlob: Blob;
  try {
    // 1. Generate the PDF Blob from jsPDF
    pdfBlob = doc.output('blob');
  } catch (e) {
    doc.save(filename);
    return { 
      success: true, 
      message: 'PDF saved to your Downloads! You can now send it on WhatsApp as a document.' 
    };
  }

  const fileSizeKb = Math.round(pdfBlob.size / 1024);

  // Auto Archive in persistent storage
  try {
    archivePdfReport({
      title,
      filename,
      reportType,
      period,
      fileSizeKb,
      employeeId,
      employeeName
    });
  } catch (e) {
    console.warn('Auto-archive deferred', e);
  }

  // 2. Convert Blob into a File object
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  // 3. Check and call navigator.share with PDF file attachment
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: title || 'Attendance Report',
        text: 'A4 Attendance Report PDF'
      });
      return { success: true, message: 'PDF document shared via WhatsApp / Native Share' };
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        return { success: false, message: 'Sharing cancelled' };
      }
      console.warn('navigator.share blocked or failed in environment:', shareErr);
    }
  }

  // 4. Fallback: Trigger direct physical PDF download and display prompt
  downloadPdfBlob(pdfBlob, filename);

  return { 
    success: true, 
    message: 'PDF saved to your Downloads! You can now send it on WhatsApp as a document.' 
  };
};

/**
 * Direct PDF export and Native Share with robust fallback
 */
export const sharePdfNative = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  return sharePdfToWhatsApp(options);
};


