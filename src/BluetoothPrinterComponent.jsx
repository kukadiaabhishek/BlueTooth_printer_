import { useState } from 'react';

function BluetoothPrinterComponent() {
  const [printers, setPrinters] = useState([]);
  const [kotPrinter, setKotPrinter] = useState(null);
  const [saveAndPrintPrinter, setSaveAndPrintPrinter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


console.log("saveAndPrintPrinter" , saveAndPrintPrinter)
  // Discover and connect to Bluetooth printers
  const connectToPrinter = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'generic_access', 'generic_attribute'] // Add common services to check
      });
  
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      console.log('Available services:', services);
      
      // Save printer to the list of connected printers
      setPrinters((prevPrinters) => [...prevPrinters, device]);

        // Call listCharacteristics after connecting
        await listCharacteristics(device);
      
  
      // Automatically assign if only one printer is available
      if (printers.length === 1) {
        setKotPrinter(device);
        setSaveAndPrintPrinter(device);
      }

      console.log('connect:');
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
 const handleKOTPrint = async () => {
    if (kotPrinter) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://node-js-mnde.onrender.com/api/kot');
        const data = await response.json();
        await sendPrintJob(kotPrinter, data.printData);
      } catch (err) {
        console.error('Error fetching KOT data:', err);
        setError('Failed to fetch KOT data');
      } finally {
        setLoading(false);
      }
    } else {
      alert('No printer assigned for KOT Print!');
    }
  };

  // Handle Save & Print
  const handleSaveAndPrint = async () => {
    if (saveAndPrintPrinter) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://node-js-mnde.onrender.com/api/receipt');
        const data = await response.json();
        console.log("hello" , data)
        await sendPrintJob(saveAndPrintPrinter, data.printData);
      } catch (err) {
        console.error('Error fetching receipt data:', err);
        setError('Failed to fetch receipt data');
      }
    } else {
      alert('No printer assigned for Save & Print!');
    }
  };


  // const sendPrintJob = async (printer, data) => {
  //   try {

  //     console.log("data", data)
  //     const server = await printer.gatt.connect();
  //     const service = await server.getPrimaryService('00001801-0000-1000-8000-00805f9b34fb'); // Replace with correct service UUID
      
  //     // List all characteristics to find the correct one
  //     const characteristics = await service.getCharacteristics();
  //     characteristics.forEach((char) => {
  //       console.log('Characteristic UUID:', char.properties);
  //     });
  
  //     // Now, use the correct characteristic UUID found above
  //     const characteristic = await service.getCharacteristic('00002a05-0000-1000-8000-00805f9b34fb'); // Replace with correct characteristic UUID
  
  //     const encoder = new TextEncoder();
  //     const printData = encoder.encode(data);
  //     await characteristic.writeValue(printData);
  //     console.log("Print Job sent:", data);
  //   } catch (error) {
  //     console.error("Failed to send print job:", error);
  //   }
  // };
  

  const sendPrintJob = async (printer, data) => {
    try {
      const response = await fetch('https://node-js-mnde.onrender.com/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerIp: printer.id, // Assuming `id` is the printer's IP
          printData: data,
        }),
      });

      console.log(response , "responce")

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('Print job sent successfully');
        setLoading(false);
      } else {
        console.error('Failed to send print job');
        setLoading(false)
      }
    } catch (error) {
      console.error('Error sending print job:', error.message || error);
      setError('Failed to send print job');
      setLoading(false);
    }
    
  };


  const listCharacteristics = async (printer) => {
    try {
      const server = await printer.gatt.connect();
      const service = await server.getPrimaryService('00001801-0000-1000-8000-00805f9b34fb'); // Replace with correct service UUID
      
      const characteristics = await service.getCharacteristics();
      characteristics.forEach(char => {
        console.log('Characteristic UUID:', char.uuid);
        console.log('Characteristic properties:', char.properties);
        if (char.properties.write || char.properties.writeWithoutResponse) {
          console.log(`Writable characteristic found: ${char.uuid}`);
        }
      });
    } catch (error) {
      console.error("Failed to list characteristics:", error);
    }
  };
  
  
  // Call this function after connecting to the printer
  
  
  

  return (
    <div className="p-6 text-center bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Bluetooth Printer Management</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <button onClick={connectToPrinter} className="mx-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition">
          Connect to Bluetooth Printer
        </button>
        <button onClick={assignPrinters} className="mx-2 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition">
          Assign Printers
        </button>
      </div>

      <div className="mb-4">
        <button onClick={handleKOTPrint} className="mx-2 px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600 transition">
          KOT Print
        </button>
        <button onClick={handleSaveAndPrint} className="mx-2 px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 transition">
          Save & Print
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {kotPrinter && <p className="mt-2 text-lg text-gray-700">KOT Printer: {kotPrinter.name}</p>}
      {saveAndPrintPrinter && <p className="mt-2 text-lg text-gray-700">Save & Print Printer: {saveAndPrintPrinter.name}</p>}

      {printers.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Connected Printers:</h2>
          <ul className="list-disc list-inside">
            {printers.map((printer, index) => (
              <li key={index} className="text-gray-600">{printer.name || `Printer ${index + 1}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


export default BluetoothPrinterComponent;
