import { Application } from '@nativescript/core';
import { DatabaseService } from './services/database.service';

// Register pages
const pages = [
    'pages/dashboard/dashboard-page',
    'pages/products/products-page',
    'pages/sales/new-sale-page'
];

pages.forEach(page => {
    const moduleExports = require(`./${page}`);
    moduleExports.default;
});

// Initialize database with some sample data
const dbService = new DatabaseService();

// Add some sample products if none exist
if (dbService.getAllProducts().length === 0) {
    dbService.addProduct({
        name: 'Sample Product 1',
        description: 'Description for product 1',
        price: 19.99,
        quantity: 50,
        category: 'General',
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

Application.run({ moduleName: 'app-root' });