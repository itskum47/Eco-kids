const PDFDocument = require('pdfkit');

function writeLine(doc, label, value) {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value ?? 'N/A');
}

function buildCertificateId(student) {
  const suffix = String(student?._id || '').slice(-6).toUpperCase() || 'STUDENT';
  return `ECOKIDS-${suffix}-${Date.now()}`;
}

async function generateCertificate(student, teacher, school, stats = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 48,
      info: {
        Title: 'EcoKids India Certificate',
        Author: 'EcoKids India'
      }
    });

    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(2).stroke('#1f7a5c');

    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#1f7a5c').font('Helvetica-Bold').text('EcoKids India', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(18).fillColor('#111827').text('Student Achievement Certificate', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12).font('Helvetica').fillColor('#374151').text('This certificate recognizes the environmental learning and participation of', {
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#111827').text(student?.name || 'Student', { align: 'center' });
    doc.moveDown(1.5);

    writeLine(doc, 'School', school?.name || student?.profile?.school || student?.school || 'N/A');
    writeLine(doc, 'Teacher', teacher?.name || 'N/A');
    writeLine(doc, 'Issue Date', new Date().toLocaleDateString('en-IN'));
    writeLine(doc, 'Certificate ID', buildCertificateId(student));
    doc.moveDown();

    doc.font('Helvetica-Bold').fillColor('#1f7a5c').text('Student Impact Snapshot');
    doc.moveDown(0.5);
    writeLine(doc, 'Activities Completed', stats.activities ?? 0);
    writeLine(doc, 'Eco Points', stats.ecoPoints ?? 0);
    writeLine(doc, 'Current Level', student?.gamification?.level ?? 1);
    doc.moveDown(1.5);

    doc.font('Helvetica').fillColor('#374151').text(
      'Awarded in recognition of continued participation in sustainability activities, environmental stewardship, and learning through the EcoKids India platform.',
      {
        align: 'center'
      }
    );

    doc.moveDown(2.5);
    doc.text('______________________________', 70, doc.y);
    doc.text('______________________________', 330, doc.y - 12);
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').text('Teacher Signature', 100, doc.y);
    doc.text('School Seal / Signature', 345, doc.y - 14);

    doc.end();
  });
}

module.exports = {
  generateCertificate
};