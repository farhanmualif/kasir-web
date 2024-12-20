// pages/TransactionSuccessPage.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, Select } from 'flowbite-react';
import { FaCheckCircle, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../assets/env';
import PropTypes from 'prop-types';

import { useState } from 'react';
import { getAuthToken } from '../lib/getAuthToken';
import { jsPDF } from 'jspdf';

const TransactionSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionDetails, change } = location.state || {};
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [printerList, setPrinterList] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fungsi untuk menangani error bluetooth dengan lebih spesifik
  const handleBluetoothError = (error) => {
    console.error('Bluetooth Error:', error);
    
    switch(error.code) {
      case 8: 
        alert('Bluetooth tidak diaktifkan. Silakan aktifkan Bluetooth di perangkat Anda.');
        break;
      case 20:
        alert('Koneksi Bluetooth terputus. Coba sambungkan kembali.');
        break;
      default:
        alert(`Kesalahan Bluetooth: ${error.message}`);
    }
  };

  // Tambahkan timeout untuk koneksi printer
  const connectPrinterWithTimeout = async (printer, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        reject(new Error('Koneksi printer timeout'));
      }, timeout);

      // Coba reconnect jika terputus
      const connect = () => {
        if (!printer.gatt.connected) {
          return printer.gatt.connect()
            .then((server) => {
              clearTimeout(connectionTimeout);
              resolve(server);
            })
            .catch((error) => {
              clearTimeout(connectionTimeout);
              if (error.code === 19 || error.message.includes('GATT Server is disconnected')) {
                // Coba reconnect sekali lagi
                return connect();
              }
              reject(error);
            });
        }
        return Promise.resolve(printer.gatt);
      };

      connect();
    });
  };

  const handleBackToTransaction = () => {
    navigate('/transaction-page');
  };

  const handlePrintInvoice = async () => {
    try {
      if (!transactionDetails || !transactionDetails.no_transaction) {
        throw new Error('No transaction data available');
      }

      const token = getAuthToken();
      const response = await axios.get(
        `${API_URL()}/api/invoices/${transactionDetails.no_transaction}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const invoice = response.data.data;
      
      // Generate PDF
      const doc = new jsPDF({
        unit: 'mm',
        format: [58, 200] // Ukuran kertas struk thermal (58mm)
      });

      doc.setFontSize(8);
      doc.setFont('helvetica');

      // Header
      doc.text('TOKO NAY SAHABAT ALAM', 29, 10, { align: 'center' });
      doc.text('============================', 29, 15, { align: 'center' });
      
      // Info Transaksi
      doc.text(`No: ${invoice.no_transaction}`, 5, 20);
      doc.text(`Tgl: ${invoice.date}`, 5, 25);
      doc.text(`Waktu: ${invoice.time}`, 5, 30);
      doc.text('============================', 29, 35, { align: 'center' });

      // Items
      let yPos = 40;
      invoice.items.forEach(item => {
        doc.text(item.name, 5, yPos);
        doc.text(`${item.quantity} x ${item.item_price.toLocaleString()}`, 5, yPos + 4);
        doc.text(`Total: ${item.total_price.toLocaleString()}`, 5, yPos + 8);
        yPos += 12;
      });

      // Footer
      doc.text('============================', 29, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Total: Rp ${invoice.total_payment.toLocaleString()}`, 5, yPos);
      doc.text(`Tunai: Rp ${invoice.cash.toLocaleString()}`, 5, yPos + 4);
      doc.text(`Kembali: Rp ${(invoice.cash - invoice.total_payment).toLocaleString()}`, 5, yPos + 8);
      doc.text('============================', 29, yPos + 12, { align: 'center' });
      doc.text('Terima Kasih', 29, yPos + 16, { align: 'center' });
      
      // Save PDF
      doc.save(`struk-${invoice.no_transaction}.pdf`);

    } catch (error) {
      console.error('Gagal membuat struk:', error);
      alert('Gagal membuat struk');
    }
  };

  const scanBluetoothPrinters = async () => {
    try {
      // Cek dukungan Web Bluetooth
      if (!navigator.bluetooth) {
        alert('Browser Anda tidak mendukung Bluetooth. Gunakan Chrome/Edge terbaru.');
        return;
      }

      // Tambahkan filter untuk printer thermal umum
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Contoh service printer
          { namePrefix: 'Thermal' }, // Filter nama umum printer thermal
          { namePrefix: 'POS' }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          // Tambahkan service lain yang mungkin digunakan printer thermal
        ]
      });

      // Cek apakah printer sudah ada di list
      const existingPrinter = printerList.find(p => p.id === device.id);
      if (!existingPrinter) {
        setPrinterList(prev => [...prev, device]);
        alert(`Printer ditemukan: ${device.name || 'Unnamed Device'}`);
      }
      
    } catch (error) {
      handleBluetoothError(error);
    }
  };

  const printToSelectedPrinter = async () => {
    let server = null;
    try {
      setIsConnecting(true);

      if (!selectedPrinter) {
        throw new Error('Silakan pilih printer terlebih dahulu');
      }

      const token = getAuthToken();

      // Ambil data invoice
      const response = await axios.get(
        `${API_URL()}/api/invoices/${transactionDetails.no_transaction}`,
        {
          headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const invoice = response.data.data;

      // Gunakan fungsi koneksi dengan timeout
      server = await connectPrinterWithTimeout(selectedPrinter);

      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      // Siapkan content struk dengan format yang lebih rapi
      let printContent = `
=============================
    NAMA TOKO
=============================
No Transaksi: ${invoice.no_transaction}
Tanggal: ${invoice.date}
Waktu: ${invoice.time}
=============================\n`;

      invoice.items.forEach(item => {
        printContent += `${item.name.padEnd(20, ' ')}
${item.quantity} x ${item.item_price.toLocaleString().padStart(10, ' ')}
  Total: ${item.total_price.toLocaleString()}\n`;
      });

      printContent += `
=============================
Total: Rp ${invoice.total_payment.toLocaleString()}
Tunai: Rp ${invoice.cash.toLocaleString()}
Kembali: Rp ${(invoice.cash - invoice.total_payment).toLocaleString()}
=============================
    Terima Kasih
    Struk Digital
=============================
`;

      // Kirim ke printer dengan chunk data
      const encoder = new TextEncoder();
      const data = encoder.encode(printContent);
      
      // Kirim data dalam chunk untuk menghindari overflow
      const chunkSize = 512; // Sesuaikan dengan kemampuan printer
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Delay antar chunk
      }

      alert('Struk berhasil dicetak!');
      setShowPrinterModal(false);

    } catch (error) {
      console.error('Error printing:', error);
      handleBluetoothError(error);
    } finally {
      if (server && server.connected) {
        server.disconnect();
      }
      setIsConnecting(false);
    }
  };

  const PrinterSelectionModal = () => (
    <Modal
      show={showPrinterModal}
      onClose={() => setShowPrinterModal(false)}
      size="sm"
    >
      <Modal.Header><h1 className="text-2xl font-bold text-gray-600">Pilih Printer</h1></Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <Button 
            onClick={scanBluetoothPrinters}
            gradientDuoTone="purpleToBlue"
            className='bg-blue-600'
          >
            <span className="text-white">Scan Printer Bluetooth</span>
          </Button>

          {printerList.length > 0 && (
            <Select
              value={selectedPrinter?.id || ''}
              onChange={(e) => {
                const printer = printerList.find(p => p.id === e.target.value);
                setSelectedPrinter(printer);
              }}
              className="text-black"
            >
              <option value="" style={{ color: 'black' }}>Pilih Printer</option>
              {printerList.map((printer) => (
                <option key={printer.id} value={printer.id} style={{ color: 'black' }}>
                  {printer.name || 'Unknown Printer'}
                </option>
              ))}
            </Select>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={printToSelectedPrinter}
          disabled={!selectedPrinter || isConnecting}
          gradientDuoTone="purpleToBlue"
          className="bg-blue-600"
        >
          {isConnecting ? 'Mencetak...' : 'Cetak'}
        </Button>
        <Button
          color="gray"
          className="bg-gray-600"
          onClick={() => setShowPrinterModal(false)}
        >
          Batal
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Transaksi Berhasil!</h2>
        
        {transactionDetails && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Nomor Transaksi: <span className="font-semibold">{transactionDetails.no_transaction}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Kembalian: <span className="font-semibold">Rp {change.toLocaleString()}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handlePrintInvoice}
            className="w-full bg-blue-600"
            gradientDuoTone="purpleToBlue"
          >
            <FaPrint className="mr-2" />
            Cetak PDF
          </Button>

          {/* <Button 
            onClick={() => setShowPrinterModal(true)}
            className="w-full bg-blue-600"
            gradientDuoTone="purpleToBlue"
          >
            <FaPrint className="mr-2" />
            Print Struk
          </Button> */}

          <Button 
            onClick={handleBackToTransaction}
            className="w-full bg-blue-600"
            gradientDuoTone="greenToBlue"
          >
            Kembali ke Transaksi
          </Button>
        </div>

        <PrinterSelectionModal />
      </div>
    </div>
  );
};

TransactionSuccessPage.propTypes = {
  no_transaction: PropTypes.string.isRequired
};

export default TransactionSuccessPage;