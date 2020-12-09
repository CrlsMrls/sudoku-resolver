import './styles/index.scss'
import { Board } from './board';
import {Template, Position} from './template';
import { Store } from './store';

let store:Store = new Store(new Board());

const template = new Template();
template.build('#board-placeholder', store);

template.onPadClicked$.subscribe(updateBoard);
template.onResolveClicked$.subscribe(resolveBoard);


function updateBoard(position:Position): void {
    const newBoard = store.getCurrent().setValue(position.pad, position.pos, position.num);
    store.add(newBoard);
}

async function resolveBoard() {
    const newBoard = await store.getCurrent().resolve();
    store.add(newBoard);
}

