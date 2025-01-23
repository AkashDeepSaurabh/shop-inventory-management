import { ReactNode } from "react";

export interface Product {
  sellPrice: ReactNode;
  purchasePrice: ReactNode;
  brand: ReactNode;
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  purchasePrice: any;
  sellPrice: any;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  purchasePrice: any;
  sellPrice: any;
  purchaseAmount: number;
  customerMobile: ReactNode;
  paid: any;
  customerAddress: ReactNode;
  duesAmount: any;
  id: string;
  items: SaleItem[];
  total: number;
  date: Date;
  customerName: string;
  status: 'pending' | 'completed' | 'cancelled';
}