import { NavigatedData, Page, EventData } from '@nativescript/core';
import { DatabaseService } from '../../services/database.service';

const dbService = new DatabaseService();

export function onNavigatingTo(args: NavigatedData) {
    const page = args.object as Page;
    
    const products = dbService.getAllProducts().map(product => ({
        ...product,
        saleQuantity: 0
    }));
    
    const viewModel = {
        products
    };
    
    page.bindingContext = viewModel;
}

export function onCompleteSale(args: EventData) {
    const button = args.object;
    const page = button.page;
    const vm = page.bindingContext;
    
    const saleItems = vm.products
        .filter((product: any) => product.saleQuantity > 0)
        .map((product: any) => ({
            productId: product.id,
            quantity: product.saleQuantity,
            price: product.price
        }));
    
    if (saleItems.length === 0) {
        return;
    }
    
    const total = saleItems.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.price), 0);
    
    const sale = {
        items: saleItems,
        total,
        date: new Date(),
        customerName: 'Customer',
        status: 'completed'
    };
    
    dbService.createSale(sale);
    page.frame.goBack();
}

export default {};