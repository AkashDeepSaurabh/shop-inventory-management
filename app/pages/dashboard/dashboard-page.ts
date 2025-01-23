import { NavigatedData, Page, EventData } from '@nativescript/core';
import { DatabaseService } from '../../services/database.service';

const dbService = new DatabaseService();

export function onNavigatingTo(args: NavigatedData) {
    const page = args.object as Page;
    
    const viewModel = {
        totalProducts: dbService.getAllProducts().length,
        totalSales: dbService.getAllSales().length,
    };
    
    page.bindingContext = viewModel;
}

export function onManageProducts(args: EventData) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate('pages/products/products-page');
}

export function onNewSale(args: EventData) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate('pages/sales/new-sale-page');
}

export default {};