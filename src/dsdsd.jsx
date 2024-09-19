import { useState } from 'react';

function BluetoothPrinterComponent() {
  const [printers, setPrinters] = useState([]);
  const [kotPrinter, setKotPrinter] = useState(null);
  const [saveAndPrintPrinter, setSaveAndPrintPrinter] = useState(null);

  // Discover and connect to Bluetooth printers
  const connectToPrinter = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['printer_service_uuid'], // Replace with correct printer service UUID
      });
  
      setPrinters((prevPrinters) => {
        const updatedPrinters = [...prevPrinters, device];
        
        // Automatically assign the first two printers if available
        if (updatedPrinters.length === 1) {
          setKotPrinter(updatedPrinters[0]);
          setSaveAndPrintPrinter(updatedPrinters[0]);
        } else if (updatedPrinters.length === 2) {
          setKotPrinter(updatedPrinters[0]);
          setSaveAndPrintPrinter(updatedPrinters[1]);
        }
  
        return updatedPrinters;
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };
  

  // Assign printers to specific buttons (KOT and Save & Print)
  const assignPrinters = () => {
    if (printers.length >= 2) {
      setKotPrinter(printers[0]);
      setSaveAndPrintPrinter(printers[1]);
    } else if (printers.length === 1) {
      setKotPrinter(printers[0]);
      setSaveAndPrintPrinter(printers[0]);
    }
  };

  // Handle KOT Print
  const handleKOTPrint = () => {
    if (kotPrinter) {
      sendPrintJob(kotPrinter, "KOT Order data");
    } else {
      alert("No printer assigned for KOT Print!");
    }
  };

  // Handle Save & Print
  const handleSaveAndPrint = () => {
    if (saveAndPrintPrinter) {
      sendPrintJob(saveAndPrintPrinter, "Save and Print Order data");
    } else {
      alert("No printer assigned for Save & Print!");
    }
  };

  const sendPrintJob = async (printer, data) => {
    try {
      const server = await printer.gatt.connect();
      const service = await server.getPrimaryService('printer_service_uuid');
      const characteristic = await service.getCharacteristic('printer_characteristic_uuid');
      
      // Prepare ESC/POS commands (this is an example)
      const encoder = new TextEncoder();
      const escposCommand = encoder.encode('\x1B\x40' + data + '\x0A' + '\x1D\x56\x41');  // ESC/POS format
     
      await characteristic.writeValue(escposCommand);
      console.log("Print Job sent:", data);
    } catch (error) {
      console.error("Failed to send print job:", error);
    }
  };
  
  

  return (
    <div>
      <button onClick={connectToPrinter}>Connect to Bluetooth Printer</button>
      <button onClick={assignPrinters}>Assign Printers</button>
  
      <button onClick={handleKOTPrint} disabled={!kotPrinter}>KOT Print</button>
      <button onClick={handleSaveAndPrint} disabled={!saveAndPrintPrinter}>Save & Print</button>
    </div>
  );
  
}

export default BluetoothPrinterComponent;
