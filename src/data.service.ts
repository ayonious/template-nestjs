import { Injectable } from '@nestjs/common';

// @Injectable makes this class a provider that Nest can inject into controllers.
// Nest creates one shared instance per application by default. This service acts
// as a tiny database layer with fixed dummy records, ready as soon as it is created.
@Injectable()
export class DataService {
  private readonly users: User[] = [
    { id: '1', name: 'Alice', createdAt: '2026-01-01T09:00:00.000Z' },
    { id: '2', name: 'Bob', createdAt: '2026-01-02T09:00:00.000Z' },
    { id: '3', name: 'Charlie', createdAt: '2026-01-03T09:00:00.000Z' },
    { id: '4', name: 'Diana', createdAt: '2026-01-04T09:00:00.000Z' },
    { id: '5', name: 'Ethan', createdAt: '2026-01-05T09:00:00.000Z' },
    { id: '6', name: 'Fatima', createdAt: '2026-01-06T09:00:00.000Z' },
    { id: '7', name: 'Grace', createdAt: '2026-01-07T09:00:00.000Z' },
    { id: '8', name: 'Hassan', createdAt: '2026-01-08T09:00:00.000Z' },
    { id: '9', name: 'Isabel', createdAt: '2026-01-09T09:00:00.000Z' },
    { id: '10', name: 'Jack', createdAt: '2026-01-10T09:00:00.000Z' },
  ];

  private readonly sales: Sale[] = [
    { id: '101', userId: '1', productName: 'Notebook', price: 12, createdAt: '2026-02-01T10:00:00.000Z' },
    { id: '102', userId: '1', productName: 'Pen', price: 3, createdAt: '2026-02-02T10:00:00.000Z' },
    { id: '103', userId: '2', productName: 'Notebook', price: 12, createdAt: '2026-02-03T10:00:00.000Z' },
    { id: '104', userId: '4', productName: 'Notebook', price: 12, createdAt: '2026-02-04T10:00:00.000Z' },
    { id: '105', userId: '4', productName: 'Pen', price: 3, createdAt: '2026-02-05T10:00:00.000Z' },
    { id: '106', userId: '4', productName: 'Backpack', price: 45, createdAt: '2026-02-06T10:00:00.000Z' },
    { id: '107', userId: '5', productName: 'Notebook', price: 12, createdAt: '2026-02-07T10:00:00.000Z' },
    { id: '108', userId: '5', productName: 'Pen', price: 3, createdAt: '2026-02-08T10:00:00.000Z' },
    { id: '109', userId: '5', productName: 'Backpack', price: 45, createdAt: '2026-02-09T10:00:00.000Z' },
    { id: '110', userId: '5', productName: 'Mug', price: 9.5, createdAt: '2026-02-10T10:00:00.000Z' },
    { id: '111', userId: '6', productName: 'Notebook', price: 12, createdAt: '2026-02-11T10:00:00.000Z' },
    { id: '112', userId: '6', productName: 'Pen', price: 3, createdAt: '2026-02-12T10:00:00.000Z' },
    { id: '113', userId: '6', productName: 'Backpack', price: 45, createdAt: '2026-02-13T10:00:00.000Z' },
    { id: '114', userId: '6', productName: 'Mug', price: 9.5, createdAt: '2026-02-14T10:00:00.000Z' },
    { id: '115', userId: '6', productName: 'Keyboard', price: 59, createdAt: '2026-02-15T10:00:00.000Z' },
    { id: '116', userId: '8', productName: 'Notebook', price: 12, createdAt: '2026-02-16T10:00:00.000Z' },
    { id: '117', userId: '8', productName: 'Pen', price: 3, createdAt: '2026-02-17T10:00:00.000Z' },
    { id: '118', userId: '9', productName: 'Notebook', price: 12, createdAt: '2026-02-18T10:00:00.000Z' },
    { id: '119', userId: '9', productName: 'Pen', price: 3, createdAt: '2026-02-19T10:00:00.000Z' },
    { id: '120', userId: '9', productName: 'Backpack', price: 45, createdAt: '2026-02-20T10:00:00.000Z' },
    { id: '121', userId: '10', productName: 'Notebook', price: 12, createdAt: '2026-02-21T10:00:00.000Z' },
    { id: '122', userId: '10', productName: 'Pen', price: 3, createdAt: '2026-02-22T10:00:00.000Z' },
    { id: '123', userId: '10', productName: 'Backpack', price: 45, createdAt: '2026-02-23T10:00:00.000Z' },
    { id: '124', userId: '10', productName: 'Mug', price: 9.5, createdAt: '2026-02-24T10:00:00.000Z' },
    { id: '125', userId: '10', productName: 'Keyboard', price: 59, createdAt: '2026-02-25T10:00:00.000Z' },
  ];

  // Keep fixture order (oldest first); an omitted limit returns the whole collection.
  getUsers(limit?: number) {
    return this.users.slice(0, limit);
  }

  getAllSales(limit?: number) {
    return this.sales.slice(0, limit);
  }

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
  createdAt: string;
}

interface Sale {
  id: string;
  userId: string;
  productName: string;
  price: number;
  createdAt: string;
}
