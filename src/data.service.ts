import { Injectable } from '@nestjs/common';

// @Injectable makes this class a provider that Nest can inject into controllers.
// Nest creates one shared instance per application by default. This service acts
// as a tiny database layer with fixed dummy records, ready as soon as it is created.
@Injectable()
export class DataService {
  private readonly users: User[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Diana' },
    { id: '5', name: 'Ethan' },
    { id: '6', name: 'Fatima' },
    { id: '7', name: 'Grace' },
    { id: '8', name: 'Hassan' },
    { id: '9', name: 'Isabel' },
    { id: '10', name: 'Jack' },
  ];

  private readonly sales: Sale[] = [
    { id: '101', userId: '1', productName: 'Notebook', price: 12 },
    { id: '102', userId: '1', productName: 'Pen', price: 3 },
    { id: '103', userId: '2', productName: 'Notebook', price: 12 },
    { id: '104', userId: '4', productName: 'Notebook', price: 12 },
    { id: '105', userId: '4', productName: 'Pen', price: 3 },
    { id: '106', userId: '4', productName: 'Backpack', price: 45 },
    { id: '107', userId: '5', productName: 'Notebook', price: 12 },
    { id: '108', userId: '5', productName: 'Pen', price: 3 },
    { id: '109', userId: '5', productName: 'Backpack', price: 45 },
    { id: '110', userId: '5', productName: 'Mug', price: 9.5 },
    { id: '111', userId: '6', productName: 'Notebook', price: 12 },
    { id: '112', userId: '6', productName: 'Pen', price: 3 },
    { id: '113', userId: '6', productName: 'Backpack', price: 45 },
    { id: '114', userId: '6', productName: 'Mug', price: 9.5 },
    { id: '115', userId: '6', productName: 'Keyboard', price: 59 },
    { id: '116', userId: '8', productName: 'Notebook', price: 12 },
    { id: '117', userId: '8', productName: 'Pen', price: 3 },
    { id: '118', userId: '9', productName: 'Notebook', price: 12 },
    { id: '119', userId: '9', productName: 'Pen', price: 3 },
    { id: '120', userId: '9', productName: 'Backpack', price: 45 },
    { id: '121', userId: '10', productName: 'Notebook', price: 12 },
    { id: '122', userId: '10', productName: 'Pen', price: 3 },
    { id: '123', userId: '10', productName: 'Backpack', price: 45 },
    { id: '124', userId: '10', productName: 'Mug', price: 9.5 },
    { id: '125', userId: '10', productName: 'Keyboard', price: 59 },
  ];

  getUser(userId: string) {
    return this.users.find((user) => user.id === userId) ?? null;
  }

  getSales(userId: string) {
    return this.sales.filter((sale) => sale.userId === userId);
  }

  getSale(userId: string, saleId: string) {
    // Check ownership as well as the sale ID for the nested user route.
    return this.sales.find((sale) => sale.userId === userId && sale.id === saleId) ?? null;
  }
}

interface User {
  id: string;
  name: string;
}

interface Sale {
  id: string;
  userId: string;
  productName: string;
  price: number;
}
