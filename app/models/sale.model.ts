export interface SaleItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    date: Date;
    customerName: string;
    status: 'pending' | 'completed' | 'cancelled';
}