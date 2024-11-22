import { Database } from 'Database';
import { TodoCreate, TodoUpdate } from '../../common/Todo';
import { TeamCreate } from '../../common/Team';

export default class TodoService {

    db: Database;

    constructor(db) {
        this.db = db;
    }

    async getTodos(teamID: number) {
        return await this.db.getTodos(teamID);
    }
    async createTodo(todo: Omit<TodoCreate, 'for' | 'by' | 'completed'>) {
        const teams = await this.db.getTeams();
        const team = teams.find(team => team.id === todo.teamID);

        const _todo = await this.db.createTodo({
            ...todo,
            for: team.user1 === this.db.userID ? team.user2 : team.user1,
            completed: false
        });

        return _todo;
    }
    async updateTodo(todo: TodoUpdate) {
        return await this.db.updateTodo(todo);
    }
    async deleteTodo(todoID: number) {
        return await this.db.deleteTodo(todoID);
    }
}