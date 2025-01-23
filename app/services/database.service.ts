import { Observable } from '@nativescript/core';

export class DatabaseService extends Observable {
    private products: Map<string, any> = new Map();
    private sales: Map<string, any> = new Map();

    // Product Operations
    addProduct(product: any) {
        product.id = Date.now().toString();
        this.products.set(product.id, product);
        return product;
    }

    updateProduct(id: string, product: any) {
        if (this.products.has(id)) {
            this.products.set(id, { ...this.products.get(id), ...product });
            return true;
        }
        return false;
    }

    getProduct(id: string) {
        return this.products.get(id);
    }

    getAllProducts() {
        return Array.from(this.products.values());
    }

    // Sales Operations
    createSale(sale: any) {
        sale.id = Date.now().toString();
        this.sales.set(sale.id, sale);
        
        // Update stock
        sale.items.forEach((item: any) => {
            const product = this.products.get(item.productId);
            if (product) {
                product.quantity -= item.quantity;
                this.products.set(item.productId, product);
            }
        });
        
        return sale;
    }

    getSale(id: string) {
        return this.sales.get(id);
    }

    getAllSales() {
        return Array.from(this.sales.values());
    }
}