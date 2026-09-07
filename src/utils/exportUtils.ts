import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, ContactMessage } from '../types/ecommerce';

/**
 * Format currency in Indian Rupees
 */
const formatINR = (val: number): string => {
  return 'Rs. ' + (val || 0).toLocaleString('en-IN');
};

/**
 * Export Orders to Excel (.xlsx)
 */
export const exportOrdersToExcel = (orders: Order[], filename = 'JSArtDecor_Orders') => {
  if (!orders || orders.length === 0) {
    alert('No orders available to export.');
    return;
  }

  const rows = orders.map((o, idx) => {
    const itemsSummary = (o.items || [])
      .map((it) => `${it.productName} (x${it.quantity})`)
      .join('; ');

    return {
      'S.No': idx + 1,
      'Order Number': o.orderNumber,
      'Order Date': o.createdAt || '',
      'Customer Name': o.customer?.fullName || '',
      'Mobile Number': o.customer?.mobileNumber || '',
      'Email': o.customer?.email || '',
      'City': o.customer?.city || '',
      'State': o.customer?.state || '',
      'Pincode': o.customer?.pinCode || '',
      'Full Address': o.customer?.address || '',
      'Items': itemsSummary,
      'Total Items Qty': (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0),
      'Total Amount (INR)': o.totalAmount || 0,
      'Payment Status': o.paymentStatus || '',
      'Payment Method': o.paymentMethod || '',
      'Razorpay Payment ID': o.razorpayPaymentId || '',
      'Order Status': o.orderStatus || '',
      'Order Type': o.orderType || 'Retail',
      'Courier Partner': o.courierPartner || '',
      'Tracking AWB': o.trackingAwb || '',
      'Estimated Delivery': o.estimatedDelivery || '',
      'Shipped Date': o.shippedAt || '',
      'Customer Notes': o.customer?.orderNotes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Column width auto-fit
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 15 }, // Order Number
    { wch: 20 }, // Order Date
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Mobile
    { wch: 26 }, // Email
    { wch: 14 }, // City
    { wch: 14 }, // State
    { wch: 10 }, // Pincode
    { wch: 35 }, // Address
    { wch: 40 }, // Items
    { wch: 14 }, // Total Qty
    { wch: 18 }, // Total Amount
    { wch: 14 }, // Payment Status
    { wch: 16 }, // Payment Method
    { wch: 24 }, // Razorpay Payment ID
    { wch: 14 }, // Order Status
    { wch: 12 }, // Order Type
    { wch: 20 }, // Courier Partner
    { wch: 18 }, // Tracking AWB
    { wch: 20 }, // Estimated Delivery
    { wch: 20 }, // Shipped Date
    { wch: 30 }  // Customer Notes
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}_${stamp}.xlsx`);
};

/**
 * Export Orders to PDF (.pdf)
 */
export const exportOrdersToPDF = (orders: Order[], filename = 'JSArtDecor_Orders') => {
  if (!orders || orders.length === 0) {
    alert('No orders available to export.');
    return;
  }

  // Create landscape PDF for rich tabular data
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(23, 23, 23); // #171717
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JSArt&Decor Jaipur - Orders Report', 40, 28);

  // Subtitle / Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(217, 119, 6); // Amber
  doc.text('Handcrafted Textiles & Heritage Home Decor', 40, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  const nowStr = new Date().toLocaleString('en-IN');
  doc.text(`Generated: ${nowStr} | Total Records: ${orders.length}`, pageWidth - 40, 34, { align: 'right' });

  // Summary Metrics Box
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const paidCount = orders.filter((o) => o.paymentStatus === 'Paid').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered').length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 65, pageWidth - 80, 26, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  const summaryText = `Total Order Volume: ${orders.length} orders    |    Cumulative Value: Rs. ${totalRevenue.toLocaleString('en-IN')}    |    Paid Orders: ${paidCount}    |    Dispatched/Delivered: ${shippedCount}`;
  doc.text(summaryText, 50, 81);

  // Table Columns & Rows
  const head = [['#', 'Order No', 'Date', 'Customer', 'Contact / City', 'Items Qty', 'Amount', 'Payment', 'Status', 'Courier & AWB']];

  const body = orders.map((o, idx) => {
    const contactCity = `${o.customer?.mobileNumber || ''}\n${o.customer?.city || ''}`;
    const courierInfo = o.courierPartner ? `${o.courierPartner}\n${o.trackingAwb || ''}` : '-';
    const totalQty = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

    return [
      String(idx + 1),
      o.orderNumber || '',
      (o.createdAt || '').substring(0, 10),
      o.customer?.fullName || '',
      contactCity,
      `${totalQty} item(s)`,
      formatINR(o.totalAmount),
      `${o.paymentStatus || ''}\n(${o.paymentMethod || 'Online'})`,
      o.orderStatus || '',
      courierInfo
    ];
  });

  autoTable(doc, {
    startY: 100,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [217, 119, 6], // Amber-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 60, halign: 'center' },
      3: { cellWidth: 95 },
      4: { cellWidth: 95 },
      5: { cellWidth: 55, halign: 'center' },
      6: { cellWidth: 70, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 75, halign: 'center' },
      8: { cellWidth: 70, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 95 }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()} - JSArt&Decor Confidential`;
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    }
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`${filename}_${stamp}.pdf`);
};

/**
 * Export Enquiries & Wholesale Leads to Excel (.xlsx)
 */
export const exportEnquiriesToExcel = (enquiries: ContactMessage[], filename = 'JSArtDecor_Enquiries') => {
  if (!enquiries || enquiries.length === 0) {
    alert('No enquiries available to export.');
    return;
  }

  const rows = enquiries.map((m, idx) => ({
    'S.No': idx + 1,
    'Enquiry ID': m.id,
    'Date & Time': m.created_at || '',
    'Enquiry Type': m.enquiry_type || 'General',
    'Customer Name': m.name || '',
    'Email Address': m.email || '',
    'Mobile / Phone': m.mobile || '',
    'Subject': m.subject || '',
    'City / Region': m.city || '',
    'Message / Requirements': m.message || '',
    'Read Status': m.is_read ? 'Read' : 'Unread'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 12 }, // ID
    { wch: 20 }, // Date
    { wch: 16 }, // Type
    { wch: 22 }, // Name
    { wch: 26 }, // Email
    { wch: 16 }, // Mobile
    { wch: 25 }, // Subject
    { wch: 16 }, // City
    { wch: 50 }, // Message
    { wch: 12 }  // Read Status
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}_${stamp}.xlsx`);
};

/**
 * Export Enquiries & Wholesale Leads to PDF (.pdf)
 */
export const exportEnquiriesToPDF = (enquiries: ContactMessage[], filename = 'JSArtDecor_Enquiries') => {
  if (!enquiries || enquiries.length === 0) {
    alert('No enquiries available to export.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(23, 23, 23);
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JSArt&Decor Jaipur - Enquiries & B2B Leads', 40, 28);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(217, 119, 6);
  doc.text('Wholesale Quotes, Hospitality Inquiries & Customer Communications', 40, 42);

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  const nowStr = new Date().toLocaleString('en-IN');
  doc.text(`Generated: ${nowStr} | Total Records: ${enquiries.length}`, pageWidth - 40, 34, { align: 'right' });

  // Summary Metrics Box
  const unreadCount = enquiries.filter((m) => !m.is_read).length;
  const wholesaleCount = enquiries.filter((m) => (m.enquiry_type || '').toLowerCase().includes('wholesale')).length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 65, pageWidth - 80, 26, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  const summaryText = `Total Leads: ${enquiries.length}    |    Wholesale/B2B Inquiries: ${wholesaleCount}    |    Unread Messages: ${unreadCount}`;
  doc.text(summaryText, 50, 81);

  // Table Columns & Rows
  const head = [['#', 'Date', 'Type', 'Customer Name', 'Email Address', 'Phone', 'City', 'Message Details', 'Status']];

  const body = enquiries.map((m, idx) => [
    String(idx + 1),
    (m.created_at || '').substring(0, 10),
    m.enquiry_type || 'General',
    m.name || '',
    m.email || '',
    m.mobile || '-',
    m.city || '-',
    m.message || '',
    m.is_read ? 'Read' : 'Unread'
  ]);

  autoTable(doc, {
    startY: 100,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [217, 119, 6], // Amber-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 60, halign: 'center' },
      2: { cellWidth: 70, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 90, fontStyle: 'bold' },
      4: { cellWidth: 110 },
      5: { cellWidth: 75, halign: 'center' },
      6: { cellWidth: 65 },
      7: { cellWidth: 190 },
      8: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()} - JSArt&Decor Confidential`;
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    }
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`${filename}_${stamp}.pdf`);
};
