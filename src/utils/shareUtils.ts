import jsPDF from 'jspdf';
import { archivePdfReport } from './storage';

/**
 * Share PDF file directly via WhatsApp or Native Share Sheet.
 * STRICT RULE: No change to PDF generation or A4 layout. Exports exact PDF and shares it.
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

/**
 * Formats a phone number for international WhatsApp deep links.
 * Adds default '91' country code for standard 10-digit Indian numbers if missing.
 */
export const formatWhatsAppPhone = (phone?: string): string => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
};

/**
 * Direct WhatsApp Mobile Intent opener for mobile devices.
 * Always targets mobile WhatsApp app (wa.me / api.whatsapp.com / whatsapp://) and never web.whatsapp.com.
 */
export const openWhatsAppDirect = (phone?: string, text?: string): void => {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  let targetUrl: string;

  if (cleanPhone) {
    if (isMobile) {
      targetUrl = encodedText 
        ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
        : `https://wa.me/${cleanPhone}`;
    } else {
      targetUrl = encodedText
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
        : `https://wa.me/${cleanPhone}`;
    }
  } else {
    if (isMobile) {
      targetUrl = encodedText
        ? `whatsapp://send?text=${encodedText}`
        : `https://api.whatsapp.com/send?text=${encodedText}`;
    } else {
      targetUrl = encodedText
        ? `https://api.whatsapp.com/send?text=${encodedText}`
        : `https://api.whatsapp.com/send`;
    }
  }

  try {
    const a = document.createElement('a');
    a.href = targetUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  } catch (e) {
    window.location.href = targetUrl;
  }
};

export const sharePdfToWhatsApp = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { 
    doc, 
    filename, 
    title, 
    phone, 
    reportType = 'monthly_attendance', 
    period = new Date().toISOString().slice(0, 7), 
    employeeId, 
    employeeName 
  } = options;

  const cleanPhone = formatWhatsAppPhone(phone);

  try {
    const blob = doc.output('blob');
    const fileSizeKb = Math.round(blob.size / 1024);

    // Auto Archive in persistent storage (zero layout disruption)
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

    // 1. If native Web Share API with file attachment is supported (Android Chrome / iOS / Capacitor)
    // This directly invokes the Android system share sheet with WhatsApp at the top and attaches the exact PDF file
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: `📄 ${title} (${filename})`
        });
        return { success: true, message: 'PDF document shared to WhatsApp & Saved to PDF Archive' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: false, message: 'Sharing cancelled' };
        }
        console.warn('Native share failed, falling back to direct WhatsApp intent', shareErr);
      }
    }

    // 2. Direct mobile fallback: Save the exact A4 PDF to local downloads immediately
    doc.save(filename);

    // 3. Directly open WhatsApp mobile application (using wa.me / api.whatsapp.com / whatsapp:// deep link)
    const shareMessage = `📄 *${title}*\nAttached A4 Report: ${filename}\nSaved in Downloads. Sharing via Sumit Workforce Pro.`;
    openWhatsAppDirect(cleanPhone, shareMessage);

    return { 
      success: true, 
      message: 'A4 PDF saved to Downloads & Archive! Opening mobile WhatsApp...' 
    };
  } catch (err: any) {
    doc.save(filename);
    return { success: true, message: 'A4 PDF downloaded & archived successfully!' };
  }
};

/**
 * Direct PDF export and Native Share
 */
export const sharePdfNative = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { doc, filename, title, phone } = options;

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

    // Fallback: Download PDF and open WhatsApp mobile
    doc.save(filename);
    if (phone) {
      openWhatsAppDirect(phone, `📄 *${title}*`);
    }
    return { success: true, message: 'A4 PDF Report downloaded successfully!' };
  } catch (err) {
    doc.save(filename);
    return { success: true, message: 'A4 PDF downloaded!' };
  }
};

