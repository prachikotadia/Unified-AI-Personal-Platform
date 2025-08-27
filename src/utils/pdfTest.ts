// Test PDF generation
export const testPDFGeneration = async () => {
  try {
    console.log('Testing PDF generation...');
    
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    console.log('jsPDF imported successfully');
    
    // Create new PDF document
    const doc = new jsPDF();
    console.log('PDF document created');
    
    // Add some text
    doc.setFontSize(16);
    doc.text('Test PDF Generation', 20, 20);
    doc.text('This is a test PDF', 20, 40);
    
    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    console.log('PDF blob generated:', pdfBlob);
    console.log('Blob type:', pdfBlob.type);
    console.log('Blob size:', pdfBlob.size);
    
    return pdfBlob;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    throw error;
  }
};
