
import {Board} from '../board';
import {Store} from '../store';

describe('Store', () => {

    describe('constructor', () => {
        test('constructor creates an Object', () => {
            const store = new Store(new Board());
            expect(store).toBeTruthy();
        });

        test('getCurrent gets object passed in constructor', () => {
            const originalBoard = new Board();
            const store = new Store(new Board());

            expect(store.getCurrent()).not.toBe(originalBoard);

            const storeWithOriginal = new Store(originalBoard);
            expect(storeWithOriginal.getCurrent()).toBe(originalBoard);
        });

        test('cannot go next', () => {
            const store = new Store(new Board());
            expect(() => store.next()).toThrowError(/Store says next is not possible/);
        });

        test('cannot go back', () => {
            const store = new Store(new Board());
            expect(() => store.back()).toThrowError(/Store says back is not possible/);
        });
    });    

    describe('add', () => {
        test('getCurrent gets latest object passed in add', () => {
            const originalBoard = new Board();
            const store = new Store(new Board());

            expect(store.getCurrent()).not.toBe(originalBoard);

            store.add(originalBoard);
            expect(store.getCurrent()).toBe(originalBoard);
        });
        
        test('cannot go next after add', () => {
            const store = new Store(new Board());
            store.add(new Board());
            expect(() => store.next()).toThrowError(/Store says next is not possible/);
        });
        
        test('can go back', () => {
            const store = new Store(new Board());
            store.add(new Board());
            expect(() => store.back()).not.toThrow();
        });
        
        test('cleans stack after insertion', () => {
            const board1 = new Board();
            const board2 = new Board();
            const board3 = new Board();
            const store = new Store(new Board());
            
            store.add(board1);
            store.add(board2);
            expect(store.getCurrent()).toBe(board2);

            store.back();
            expect(store.getCurrent()).toBe(board1);
            
            store.next();
            expect(store.getCurrent()).toBe(board2);

            store.back();
            store.add(board3);
            expect(store.getCurrent()).toBe(board3);
            expect(() => store.next()).toThrowError(/Store says next is not possible/);
            
            store.back();
            expect(store.getCurrent()).toBe(board1);
        });
    });    

    describe('back/next', () => {
        test('cannot go next after "add" but yes after "back"', () => {
            const store = new Store(new Board());
            store.add(new Board());
            expect(() => store.next()).toThrowError(/Store says next is not possible/);
            store.back();
            expect(() => store.next()).not.toThrowError(/Store says next is not possible/);
        });
        
        test('can go back the same added', () => {
            const store = new Store(new Board()); // 1
            
            store.add(new Board()); // 2
            store.add(new Board()); // 3
            store.add(new Board()); // 4

            expect(() => store.back()).not.toThrow(); // 4
            expect(() => store.back()).not.toThrow(); // 3 
            expect(() => store.back()).not.toThrow(); // 2
            expect(() => store.back()).toThrow();
        });
        
        test('can go next the same that went back', () => {
            const store = new Store(new Board()); // 1
            
            store.add(new Board()); // 2
            store.add(new Board()); // 3
            store.add(new Board()); // 4

            store.back(); // 4
            store.back(); // 3
            store.back(); // 2

            expect(() => store.next()).not.toThrow(); // 2
            expect(() => store.next()).not.toThrow(); // 3 
            expect(() => store.next()).not.toThrow(); // 4
            expect(() => store.next()).toThrow();
        });
    });    
    
    describe('observables', () => {
        test('constructor fires false in next', done => {
            const store = new Store(new Board());

            store.hasNext$.subscribe(data => {
                expect(data).toBe(false);
                done();
            });
        });
        
        test('constructor fires false in back', done => {
            const store = new Store(new Board());

            store.hasBack$.subscribe(data => {
                expect(data).toBe(false);
                done();
            });
        });

        test('add fires false in next', done => {
            const store = new Store(new Board());

            store.add(new Board());

            store.hasNext$.subscribe(data => {
                expect(data).toBe(false);
                done();
            });
        });        

        test('add fires true in back', done => {
            const store = new Store(new Board());

            store.add(new Board());

            store.hasBack$.subscribe(data => {
                expect(data).toBe(true);
                done();
            });
        });

        
    });




});