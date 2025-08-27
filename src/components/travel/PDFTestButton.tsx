import React from 'react';
import travelAPI from '../../services/travelAPI';

const PDFTestButton: React.FC = () => {
  const handleTestPDF = async () => {
    try {
      console.log('Testing PDF generation...');
      
      const testData = {
        bookingReference: 'TEST123',
        passenger: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1-555-0123',
          passportNumber: 'TEST123456',
          nationality: 'Test'
        },
        flight: {
          airline: 'Test Airlines',
          flightNumber: 'TEST-001',
          origin: 'Test Origin',
          destination: 'Test Destination',
          departureTime: '2024-01-01',
          arrivalTime: '2024-01-02',
          duration: '1 day',
          cabinClass: 'Economy',
          aircraft: 'Test Aircraft'
        },
        seat: {
          seatNumber: 'TEST-001',
          seatType: 'window',
          price: 100
        },
        totalPrice: 100
      };
      
      const blob = await travelAPI.generatePDFTicket(testData);
      console.log('PDF blob generated:', blob);
      
      // Download the test PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-ticket.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Test PDF downloaded successfully!');
    } catch (error) {
      console.error('Test PDF generation failed:', error);
    }
  };

  return (
    <button
      onClick={handleTestPDF}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Test PDF Generation
    </button>
  );
};

export default PDFTestButton;
