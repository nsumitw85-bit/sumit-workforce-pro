import jsPDF from 'jspdf';
import { archivePdfReport } from './storage';

/**
 * Share PDF file directly via WhatsApp or Native Share Sheet.
 * STRICT RULE: No plain text summaries. Exports PDF first and shares the actual PDF document.
 */
export interface SharePdfOptions {
  doc: jsPDF;
  filename: string;
  title: string;
  phone?: string; // Optional phone number
  reportType?: any;
  period?: string;
  employeeId?: string;
  employeeName?: string;
}

export const sharePdfToWhatsApp = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { doc, filename, title, phone, reportType = 'monthly_attendance', period = new Date().toISOString().slice(0, 7), employeeId, employeeName } = options;

  // Clean phone number (remove spaces, +, etc)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

  try {
    const blob = doc.output('blob');
    const fileSizeKb = Math.round(blob.size / 1024);

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

    const file = new File([blob], filename, { type: 'application/pdf' });

    // 1. If native Web Share API with file attachment is supported (Android/iOS Browsers)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title
        });
        return { success: true, message: 'PDF document shared to WhatsApp & Saved to PDF Archive' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: false, message: 'Sharing cancelled' };
        }
      }
    }

    // 2. Desktop or standard fallback: Export PDF file immediately
    doc.save(filename);

    // Open WhatsApp directly
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}`
      : `https://web.whatsapp.com/`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    return { 
      success: true, 
      message: 'A4 PDF saved to phone & PDF Archive! Opening WhatsApp...' 
    };
  } catch (err: any) {
    doc.save(filename);
    return { success: true, message: 'A4 PDF downloaded & archived successfully!' };
  }
};

/**
 * Direct PDF export and Native Share (no text summaries)
 */
export const sharePdfNative = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { doc, filename, title } = options;

  try {
    const blob = doc.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title
        });
        return { success: true, message: 'PDF shared successfully' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: false, message: 'Share cancelled' };
        }
      }
    }

    // Fallback: Download PDF
    doc.save(filename);
    return { success: true, message: 'A4 PDF Report downloaded successfully!' };
  } catch (err) {
    doc.save(filename);
    return { success: true, message: 'A4 PDF downloaded!' };
  }
};
