export const accessoryTypes = [
  { id: 'headphone', label: 'Headphones / Earphones', sublabel: 'Over-ear, in-ear, earbuds' },
  { id: 'bluetooth_speaker', label: 'Bluetooth Speaker', sublabel: 'Portable or desktop speaker' },
  { id: 'charger', label: 'Charger / Adapter', sublabel: 'Phone charger, laptop adapter, GaN charger' },
  { id: 'extension', label: 'Extension Cable / Power Strip', sublabel: 'Multi-socket extension board' },
  { id: 'powerbank', label: 'Power Bank', sublabel: 'Not charging, not holding charge' },
  { id: 'smartwatch', label: 'Smartwatch / Fitness Band', sublabel: 'Screen, strap, charging issues' },
  { id: 'keyboard_mouse', label: 'Keyboard / Mouse', sublabel: 'External keyboard or mouse repair' },
  { id: 'cable', label: 'Cable / Wire', sublabel: 'USB-C, Lightning, HDMI, audio cable' },
  { id: 'other_accessory', label: 'Other Accessory', sublabel: '' },
];

export const accessoryBrands: Record<string, string[]> = {
  headphone: [
    'Apple AirPods', 'Samsung Galaxy Buds', 'Sony WH-1000XM',
    'JBL', 'Bose', 'Sennheiser', 'Anker Soundcore', 'Oraimo', 'Infinix XE', 'Other',
  ],
  bluetooth_speaker: [
    'JBL', 'Sony', 'Bose', 'Anker Soundcore', 'Marshall',
    'Ultimate Ears', 'Oraimo', 'Other',
  ],
  charger: [
    'Apple', 'Samsung', 'Anker', 'Baseus', 'Oraimo',
    'Aukey', 'Belkin', 'Other',
  ],
  extension: ['Belkin', 'Oraimo', 'Local brand', 'Other'],
  powerbank: [
    'Anker', 'Baseus', 'Samsung', 'Oraimo', 'Romoss',
    'Xiaomi', 'Aukey', 'Other',
  ],
  smartwatch: [
    'Apple Watch', 'Samsung Galaxy Watch', 'Huawei Watch',
    'Garmin', 'Fitbit', 'Xiaomi Mi Band', 'Oraimo Watch', 'Other',
  ],
  keyboard_mouse: [
    'Logitech', 'Microsoft', 'Apple', 'Razer',
    'HyperX', 'Generic / No brand', 'Other',
  ],
  cable: ['Apple', 'Samsung', 'Anker', 'Baseus', 'Generic', 'Other'],
  other_accessory: ['Other'],
};

export const accessoryIssues = [
  { id: 'no_power', label: 'Not Turning On / No Power', sublabel: '' },
  { id: 'sound_issue', label: 'Sound / Audio Problem', sublabel: 'No sound, distorted, one side only' },
  { id: 'charging_issue', label: 'Not Charging', sublabel: 'Does not charge or very slow' },
  { id: 'connection', label: 'Connection Problem', sublabel: 'Bluetooth not pairing, USB not detecting' },
  { id: 'physical_damage', label: 'Physical Damage', sublabel: 'Cracked, broken, frayed cable' },
  { id: 'port_issue', label: 'Port / Jack Issue', sublabel: 'Audio jack, USB port, charging issues' },
  { id: 'other_issue', label: 'Other Issue', sublabel: '' },
];
