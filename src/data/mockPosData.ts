import { POSTransaction } from '../types';

export interface POSProduct {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: 'Industrial Solvents' | 'Lab Reagents' | 'Safety Equipment' | 'Sanitation & Disinfectants' | 'Packaging & Containers';
  price: number;
  stock: number;
  unit: string;
  taxable: boolean;
  color: string;
}

export const posCatalog: POSProduct[] = [
  {
    id: 'POS-P1',
    sku: 'CHEM-ETH-99',
    barcode: '480651234001',
    name: 'Ethanol Absolute 99.8% (4L Jug)',
    category: 'Industrial Solvents',
    price: 1850,
    stock: 142,
    unit: 'Jug',
    taxable: true,
    color: 'bg-blue-600',
  },
  {
    id: 'POS-P2',
    sku: 'CHEM-IPA-99',
    barcode: '480651234002',
    name: 'Isopropanol USP Grade 99.5% (20L Drum)',
    category: 'Industrial Solvents',
    price: 4950,
    stock: 65,
    unit: 'Drum',
    taxable: true,
    color: 'bg-indigo-600',
  },
  {
    id: 'POS-P3',
    sku: 'REAG-HCL-37',
    barcode: '480651234003',
    name: 'Hydrochloric Acid 37% AR Grade (2.5L)',
    category: 'Lab Reagents',
    price: 1250,
    stock: 88,
    unit: 'Bottle',
    taxable: true,
    color: 'bg-amber-600',
  },
  {
    id: 'POS-P4',
    sku: 'REAG-NAOH-500',
    barcode: '480651234004',
    name: 'Sodium Hydroxide Pellets 98% (1kg)',
    category: 'Lab Reagents',
    price: 480,
    stock: 210,
    unit: 'Pouch',
    taxable: true,
    color: 'bg-cyan-600',
  },
  {
    id: 'POS-P5',
    sku: 'SAFE-NITR-L',
    barcode: '480651234005',
    name: 'Heavy Duty Nitrile Chemical Gloves (Box of 100)',
    category: 'Safety Equipment',
    price: 650,
    stock: 350,
    unit: 'Box',
    taxable: true,
    color: 'bg-emerald-600',
  },
  {
    id: 'POS-P6',
    sku: 'SAFE-RESP-3M',
    barcode: '480651234006',
    name: 'Dual Cartridge Organic Vapor Respirator Mask',
    category: 'Safety Equipment',
    price: 2400,
    stock: 45,
    unit: 'Piece',
    taxable: true,
    color: 'bg-teal-600',
  },
  {
    id: 'POS-P7',
    sku: 'SANI-QUAT-20L',
    barcode: '480651234007',
    name: 'Quaternary Ammonium Sanitizer Concentrated (20L)',
    category: 'Sanitation & Disinfectants',
    price: 3200,
    stock: 94,
    unit: 'Carboy',
    taxable: true,
    color: 'bg-purple-600',
  },
  {
    id: 'POS-P8',
    sku: 'PACK-HDPE-20L',
    barcode: '480651234008',
    name: 'UN-Certified HDPE Jerrycan 20L with Vented Cap',
    category: 'Packaging & Containers',
    price: 320,
    stock: 420,
    unit: 'Piece',
    taxable: true,
    color: 'bg-rose-600',
  },
  {
    id: 'POS-P9',
    sku: 'CHEM-ACET-100',
    barcode: '480651234009',
    name: 'Acetone Technical Grade (18L Pail)',
    category: 'Industrial Solvents',
    price: 3800,
    stock: 58,
    unit: 'Pail',
    taxable: true,
    color: 'bg-blue-700',
  }
];

export const sampleTransactions: POSTransaction[] = [
  {
    id: 'TX-9001',
    receiptNumber: 'POS-2026-00912',
    cashierName: 'Maria Santos (Cashier 01)',
    customerName: 'AeroLab Technologies Inc.',
    items: [
      { productId: 'POS-P1', name: 'Ethanol Absolute 99.8% (4L Jug)', sku: 'CHEM-ETH-99', price: 1850, qty: 2, total: 3700 },
      { productId: 'POS-P5', name: 'Heavy Duty Nitrile Chemical Gloves (Box of 100)', sku: 'SAFE-NITR-L', price: 650, qty: 3, total: 1950 },
    ],
    subtotal: 5650,
    taxAmount: 605.36,
    discountAmount: 0,
    grandTotal: 5650,
    paymentMethod: 'GCASH',
    amountTendered: 5650,
    change: 0,
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'TX-9002',
    receiptNumber: 'POS-2026-00913',
    cashierName: 'Maria Santos (Cashier 01)',
    customerName: 'BioHealth Pharma Lab',
    items: [
      { productId: 'POS-P2', name: 'Isopropanol USP Grade 99.5% (20L Drum)', sku: 'CHEM-IPA-99', price: 4950, qty: 1, total: 4950 },
      { productId: 'POS-P7', name: 'Quaternary Ammonium Sanitizer Concentrated (20L)', sku: 'SANI-QUAT-20L', price: 3200, qty: 1, total: 3200 },
    ],
    subtotal: 8150,
    taxAmount: 873.21,
    discountAmount: 407.50,
    grandTotal: 7742.50,
    paymentMethod: 'CARD',
    amountTendered: 7742.50,
    change: 0,
    timestamp: Date.now() - 3600000,
  }
];
