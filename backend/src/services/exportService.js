const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * Converts array of JSON objects to CSV string
 */
function exportToCSV(data, fields) {
  try {
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(data);
  } catch (error) {
    throw new Error(`CSV Export failed: ${error.message}`);
  }
}

/**
 * Generates PDF stream/buffer representing analytics data
 */
function exportToPDF(data, res) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Pipe to response
  doc.pipe(res);

  // Headers
  doc.fontSize(20).text('TransitOps Fleet Analytics Report', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown(2);

  // Draw table header
  const tableTop = 150;
  doc.font('Helvetica-Bold');
  doc.text('Reg No', 30, tableTop);
  doc.text('Type', 110, tableTop);
  doc.text('Odometer', 180, tableTop);
  doc.text('Fuel Consumed', 250, tableTop);
  doc.text('Op. Cost', 340, tableTop);
  doc.text('Efficiency', 420, tableTop);
  doc.text('ROI %', 500, tableTop);
  doc.moveDown(0.5);
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(30, tableTop + 15).lineTo(560, tableTop + 15).stroke();

  let position = tableTop + 25;
  doc.font('Helvetica');

  data.forEach((item) => {
    doc.text(item.registrationNumber || 'N/A', 30, position);
    doc.text(item.type || 'N/A', 110, position);
    doc.text(`${item.odometer || 0} km`, 180, position);
    doc.text(`${item.totalFuelLiters || 0} L`, 250, position);
    doc.text(`$${item.operationalCost || 0}`, 340, position);
    doc.text(`${item.fuelEfficiency || 0} km/L`, 420, position);
    doc.text(`${item.roi || 0}%`, 500, position);

    position += 20;

    // Page break helper
    if (position > 750) {
      doc.addPage();
      position = 50; // top margin
    }
  });

  // End Document
  doc.end();
}

module.exports = {
  exportToCSV,
  exportToPDF
};
