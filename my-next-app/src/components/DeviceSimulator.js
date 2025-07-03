'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X, Monitor } from 'lucide-react';

const devices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 12/13 Pro Max', width: 428, height: 926 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 }
];

export default function DeviceSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDesktopView, setIsDesktopView] = useState(true);

  useEffect(() => {
    // Check if we're in desktop mode
    if (typeof window !== 'undefined') {
      setIsDesktopView(window.innerWidth >= 768);
    }

    // Add viewport meta tag for proper scaling
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }

    // Add styles for device simulation
    const style = document.createElement('style');
    style.innerHTML = `
      .device-wrapper {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        border: 2px solid #666 !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3) !important;
      }
      .device-content {
        width: 100% !important;
        height: 100% !important;
        overflow: auto !important;
      }
      body.simulating-device {
        overflow: hidden !important;
        height: 100vh !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      document.head.removeChild(style);
      document.body.classList.remove('simulating-device');
    };
  }, []);

  const handleDeviceSelect = (device) => {
    if (device) {
      // Apply device simulation
      document.body.classList.add('simulating-device');
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.classList.add('device-wrapper');
        mainContent.style.width = `${device.width}px`;
        mainContent.style.height = `${device.height}px`;
        mainContent.style.maxWidth = '95vw';
        mainContent.style.maxHeight = '95vh';
      }
    } else {
      // Reset to desktop view
      document.body.classList.remove('simulating-device');
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.classList.remove('device-wrapper');
        mainContent.style.width = '';
        mainContent.style.height = '';
        mainContent.style.maxWidth = '';
        mainContent.style.maxHeight = '';
      }
    }
    setSelectedDevice(device);
    setIsOpen(false);
  };

  // Only show if in desktop mode
  if (!isDesktopView) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        title="Device Simulator"
      >
        {selectedDevice ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Device Simulator
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2">
            {/* Reset to desktop option */}
            <button
              onClick={() => handleDeviceSelect(null)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                !selectedDevice
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Desktop (Reset)
              </div>
            </button>

            {/* Device options */}
            {devices.map((device) => (
              <button
                key={device.name}
                onClick={() => handleDeviceSelect(device)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                  selectedDevice?.name === device.name
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  {device.name}
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {device.width}x{device.height}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 