import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * QR Cards Page
 * Route: /school-admin/qr-cards (SCHOOL_ADMIN only)
 * 
 * Allows school admins to:
 * 1. Select grade and section
 * 2. Generate QR code cards for entire class
 * 3. Print cards in A4 format (4 cards per page)
 * 4. Each card shows: QR code, name, class, roll number
 */
const QRCardsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [selectedGrade, setSelectedGrade] = useState('6');
  const [selectedSection, setSelectedSection] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCards, setQrCards] = useState([]);
  const [generated, setGenerated] = useState(false);

  const grades = ['6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  /**
   * Generate QR codes for selected class
   */
  const handleGenerateQRCodes = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        `/api/v1/qr/class/${selectedGrade}/${selectedSection}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR codes');
      }

      setQrCards(data.data.qrCards);
      setGenerated(true);
      setSuccess(
        `✅ Generated ${data.data.qrCards.length} QR codes for Class ${selectedGrade}-${selectedSection}`
      );
    } catch (err) {
      setError(err.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Print QR cards (A4, 4 cards per page)
   */
  const handlePrintCards = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📱 QR Code Cards Generator
          </h1>
          <p className="text-gray-600">
            Generate and print QR code login cards for your students
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 print:hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Class
              </h2>

              {/* Grade Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {sections.map((section) => (
                    <button
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        selectedSection === section
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerateQRCodes}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
                >
                  {loading ? 'Generating...' : '📋 Generate QR Cards'}
                </button>

                {generated && qrCards.length > 0 && (
                  <button
                    onClick={handlePrintCards}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition print:hidden"
                  >
                    🖨️ Print Cards
                  </button>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">{success}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📖 How to Use
                </h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Select grade and section</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Click "Generate QR Cards"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Review the cards preview</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Click "Print Cards" and print on A4 paper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">5.</span>
                    <span>Cut and distribute to students</span>
                  </li>
                </ol>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Print on cardstock or glossy paper for durability. Each A4 sheet contains 4 QR code cards.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {!generated ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-600 text-lg">
                  Select a class and click "Generate QR Cards" to get started
                </p>
              </div>
            ) : qrCards.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-red-600 text-lg">
                  No students found in Class {selectedGrade}-{selectedSection}
                </p>
              </div>
            ) : (
              <>
                {/* Print Layout - Hidden in browser, visible in print */}
                <div className="print:block hidden">
                  {/* Print in A4 format with 4 cards per page */}
                  {qrCards.map((card, index) => (
                    <div key={card.studentId} className="page-break print:break-after-page">
                      {index % 4 === 0 && (
                        <div className="w-full h-screen flex flex-col gap-6 p-4 page-break">
                          {qrCards.slice(index, Math.min(index + 4, qrCards.length)).map((c) => (
                            <QRCardPrintItem key={c.studentId} card={c} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Browser Preview - Grid layout */}
                <div className="grid grid-cols-1 gap-6 print:hidden">
                  {qrCards.map((card) => (
                    <QRCardPreviewItem key={card.studentId} card={card} />
                  ))}
                </div>

                {/* Print Button - Sticky */}
                <div className="mt-8 flex gap-4 print:hidden">
                  <button
                    onClick={handlePrintCards}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                  >
                    🖨️ Print All Cards ({qrCards.length} cards)
                  </button>
                  <button
                    onClick={() => setGenerated(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 rounded-lg transition"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * QR Card Component for Preview
 */
const QRCardPreviewItem = ({ card }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200">
      <div className="p-6">
        <div className="mb-4 text-right text-sm text-gray-600">
          Class {card.grade}-{card.section}
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6 bg-white p-4 border border-gray-200 rounded">
          <img
            src={card.qrBase64}
            alt={`QR Code for ${card.studentName}`}
            className="w-48 h-48"
          />
        </div>

        {/* Student Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {card.studentName}
          </h3>
          <p className="text-gray-600 mb-1">
            Roll Number: <span className="font-semibold">{card.rollNumber}</span>
          </p>
          <p className="text-yellow-600 text-sm mt-3">
            👆 Scan to Login 👆
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * QR Card Component for Printing (A4, 4 per page)
 */
const QRCardPrintItem = ({ card }) => {
  const cardWidth = 'w-full';
  const cardHeight = 'h-64';

  return (
    <div className={`${cardWidth} ${cardHeight} bg-white p-4 border border-gray-300 rounded print:break-after-page print:page-break-inside-avoid`}>
      <div className="text-center">
        <h3 className="text-sm font-bold text-gray-900 mb-2">EcoKids India</h3>

        {/* QR Code */}
        <div className="flex justify-center mb-3 print:mb-2">
          <img
            src={card.qrBase64}
            alt={`QR Code for ${card.studentName}`}
            className="w-32 h-32 print:w-28 print:h-28"
          />
        </div>

        {/* Student Info */}
        <div className="text-xs print:text-xs">
          <p className="font-bold text-gray-900">{card.studentName}</p>
          <p className="text-gray-700">
            Class {card.grade}-{card.section} | Roll {card.rollNumber}
          </p>
          <p className="text-yellow-600 text-xs mt-1">Scan to login →</p>
        </div>
      </div>
    </div>
  );
};

export default QRCardsPage;
