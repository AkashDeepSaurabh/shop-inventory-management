import { NavigatedData, Page, EventData } from '@nativescript/core';
import { DatabaseService } from '../../services/database.service';

const dbService = new DatabaseService();

export function onNavigatingTo(args: NavigatedData) {
    const page = args.object as Page;
    
    const viewModel = {
        products: dbService.getAllProducts()
    };
    
    page.bindingContext = viewModel;
}

export function onEditProduct(args: EventData) {
    const button = args.object;
    const page = button.page;
    const product = button.bindingContext;
    console.log('Edit product:', product);
}

export default {};