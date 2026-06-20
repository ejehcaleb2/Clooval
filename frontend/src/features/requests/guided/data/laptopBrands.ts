export const laptopBrands = [
  {
    id: 'apple',
    label: 'Apple MacBook',
    models: [
      'MacBook Air M1', 'MacBook Air M2', 'MacBook Air M3',
      'MacBook Pro 13" M1', 'MacBook Pro 13" M2',
      'MacBook Pro 14" M2', 'MacBook Pro 14" M3',
      'MacBook Pro 16" M2', 'MacBook Pro 16" M3',
      'MacBook Air (Intel) 2019', 'MacBook Air (Intel) 2020',
    ],
  },
  {
    id: 'dell',
    label: 'Dell',
    models: [
      'Inspiron 14', 'Inspiron 15', 'Inspiron 16',
      'XPS 13', 'XPS 15', 'XPS 17',
      'Latitude 5420', 'Latitude 5520', 'Latitude 7420',
      'Vostro 14', 'Vostro 15',
    ],
  },
  {
    id: 'hp',
    label: 'HP',
    models: [
      'HP 250 G8', 'HP 255 G9', 'HP 14s', 'HP 15s',
      'Pavilion 14', 'Pavilion 15', 'Pavilion x360',
      'Envy 13', 'Envy 14', 'Envy x360',
      'EliteBook 840', 'EliteBook 850',
      'ProBook 440', 'ProBook 450',
    ],
  },
  {
    id: 'lenovo',
    label: 'Lenovo',
    models: [
      'IdeaPad 3', 'IdeaPad 5', 'IdeaPad Slim 5',
      'ThinkPad E14', 'ThinkPad E15', 'ThinkPad T14',
      'Legion 5', 'Legion 5 Pro', 'Legion 7',
      'Yoga 6', 'Yoga 7', 'Yoga Slim 7',
    ],
  },
  {
    id: 'asus',
    label: 'Asus',
    models: [
      'VivoBook 14', 'VivoBook 15', 'VivoBook 16',
      'ZenBook 13', 'ZenBook 14', 'ZenBook Pro',
      'ROG Strix G15', 'ROG Strix G16',
      'TUF Gaming A15', 'TUF Gaming F15',
      'ExpertBook B1', 'ExpertBook B2',
    ],
  },
  {
    id: 'acer',
    label: 'Acer',
    models: [
      'Aspire 3', 'Aspire 5', 'Aspire 7',
      'Swift 3', 'Swift 5',
      'Nitro 5', 'Predator Helios 300',
      'Extensa 15', 'TravelMate P2',
    ],
  },
  {
    id: 'msi',
    label: 'MSI',
    models: [
      'Modern 14', 'Modern 15',
      'Prestige 14', 'Prestige 15',
      'GF63 Thin', 'GL66', 'Katana GF66',
    ],
  },
  {
    id: 'other_laptop',
    label: 'Other',
    models: [],
  },
];

export const laptopIssues = [
  { id: 'screen', label: 'Screen / Display', sublabel: 'Cracked, flickering, dead pixels, backlight' },
  { id: 'keyboard', label: 'Keyboard', sublabel: 'Keys not working, liquid damage, stuck keys' },
  { id: 'battery', label: 'Battery', sublabel: 'Not charging, short life, swollen' },
  { id: 'charging_port', label: 'Charging Port', sublabel: 'Loose, broken, not connecting' },
  { id: 'hinge', label: 'Hinge / Casing', sublabel: 'Broken hinge, cracked body, loose screen' },
  { id: 'fan_overheating', label: 'Fan / Overheating', sublabel: 'Loud fan, shutting down from heat' },
  { id: 'trackpad', label: 'Trackpad', sublabel: 'Not clicking, erratic cursor, not responding' },
  { id: 'software', label: 'Software Issue', sublabel: 'Virus, slow performance, OS problems, won\'t boot' },
  { id: 'ram_storage', label: 'RAM / Storage Upgrade', sublabel: 'Adding more RAM or replacing hard drive' },
  { id: 'speaker_audio', label: 'Speaker / Audio', sublabel: 'No sound, distorted audio, jack issues' },
  { id: 'usb_ports', label: 'USB / Ports', sublabel: 'Broken ports, not detecting devices' },
  { id: 'motherboard', label: 'Motherboard', sublabel: 'Not powering on, major hardware failure' },
  { id: 'other_issue', label: 'Other Issue', sublabel: '' },
];
