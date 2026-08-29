import jsPDF from 'jspdf';
import { archivePdfReport } from './storage';

/**
 * Share PDF file directly via WhatsApp or Native Share Sheet.
 * STRICT RULE: No change to PDF generation or A4 layout. Converts doc to real Blob and File object, and shares the actual PDF file via navigator.share.
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

export const sharePdfToWhatsApp = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { 
    doc, 
    filename = 'Attendance_Report.pdf', 
    title = 'Attendance Report PDF', 
    reportType = 'monthly_attendance', 
    period = new Date().toISOString().slice(0, 7), 
    employeeId, 
    employeeName 
  } = options;

  try {
    // 1. Convert the generated jsPDF document into a real Blob and then into a File object
    const pdfBlob = doc.output('blob');
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

    const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

    // 2. Use navigator.share with the PDF file attachment to open the phone's native share sheet with the actual PDF document attached
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: title || 'Attendance Report PDF',
          text: 'A4 Printable Attendance Report'
        });
        return { success: true, message: 'PDF document shared via WhatsApp / Native Share' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: false, message: 'Sharing cancelled' };
        }
        console.warn('Native share error, falling back to direct download', shareErr);
      }
    }

    // 3. Fallback: Trigger direct PDF download so the user gets the exact A4 printable PDF immediately
    doc.save(filename);

    return { 
      success: true, 
      message: 'A4 PDF Report downloaded successfully!' 
    };
  } catch (err: any) {
    doc.save(filename);
    return { success: true, message: 'A4 PDF downloaded successfully!' };
  }
};

/**
 * Direct PDF export and Native Share
 */
export const sharePdfNative = async (options: SharePdfOptions): Promise<{ success: boolean; message: string }> => {
  const { doc, filename = 'Attendance_Report.pdf', title = 'Attendance Report PDF' } = options;

  try {
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: title || 'Attendance Report PDF',
          text: 'A4 Printable Attendance Report'
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

