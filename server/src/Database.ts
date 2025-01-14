import { Todo, TodoCreate, TodoUpdate } from '../../common/Todo';
import { Team, TeamCreate, TeamUpdate } from '../../common/Team';
import { User } from '../../common/User'; 

const users: User[] = [];
const teams: Team[] = [];
const todos: Todo[] = [];

export abstract class Database {

    userID: number

    constructor(userID: number) {
        this.userID = userID;
    }

    abstract getTodos(teamID: number): Promise<Todo[]>;
    abstract getTodo(todoID: number): Promise<Todo>;
    abstract createTodo(todo: TodoCreate): Promise<Todo>;
    abstract updateTodo(todo: TodoUpdate): Promise<Todo>;
    abstract deleteTodo(todoID: number): Promise<Todo>;

    abstract getTeams(): Promise<Team[]>;
    abstract getTeamByUsers(user1ID: number, user2ID: number): Promise<Team>;
    abstract getTeam(teamID: number): Promise<Team>;
    abstract createTeam(team: TeamCreate): Promise<Team>;
    abstract updateTeam(team: TeamUpdate): Promise<Team>;
    abstract deleteTeam(teamID: number): Promise<Team>;

    abstract getUser(id: number): Promise<User>;
    abstract getUserByEmail(email: string): Promise<User>;
    abstract createUser(name: string, email: string): Promise<User>;
}

export default class PlayDatabase extends Database {

    teams: Team[] = teams;
    todos: Todo[] = todos;
    users: User[] = users;

    maxID = 0;

    async getTeams(): Promise<Team[]> {
        return this.teams.filter(team => team.user1 === this.userID || team.user2 === this.userID);
    }
    async getTeamByUsers(user1ID: number, user2ID: number): Promise<Team> {
        return this.teams.find(team => 
            (team.user1 === user1ID && team.user2 === user2ID) ||
            (team.user1 === user2ID && team.user2 === user1ID)
        )
    }
    async getTeam(teamID: number): Promise<Team> {
        return this.teams.find(team => team.id === teamID);
    }
    async createTeam(team: TeamCreate): Promise<Team> {
        const _team: Team = {
            ...team,
            id: this.maxID++,
            user1: this.userID,
            accepted: false
        }
        this.teams.push(_team);
        return _team;
    }
    async updateTeam(team: TeamUpdate): Promise<Team> {
        const index = this.teams.findIndex(_team => _team.id === team.id);
        if(index === -1) {
            throw new Error('Could not find team')
        }
        const originalTeam = this.teams[index];
        const _team = {
            ...originalTeam,
            ...team
        }
        this.teams[index] = _team;
        return _team;
    }
    async deleteTeam(teamID: number): Promise<Team> {
        const index = this.teams.findIndex(team => team.id === teamID);
        if(index === -1) throw new Error('Could not find team');
        const team = this.teams[index];
        this.teams.splice(index, 1);
        return team;
    }

    async getTodos(teamID: number): Promise<Todo[]> {
        return this.todos.filter(todo => todo.teamID === teamID);
    }
    async getTodo(todoID: number): Promise<Todo> {
        return this.todos.find(todo => todo.id === todoID);
    }
    async createTodo(todo: TodoCreate): Promise<Todo> {
        const _todo: Todo = {
            ...todo,
            id: this.maxID++,
            by: this.userID
        }
        this.todos.push(_todo);
        return _todo;
    }
    async updateTodo(todo: TodoUpdate): Promise<Todo> {
        const index = this.todos.findIndex(_todo => _todo.id === todo.id);
        if(index === -1) {
            throw new Error('Could not find team')
        }
        const originalTodo = this.todos[index];
        const _todo = {
            ...originalTodo,
            ...todo
        }
        this.todos[index] = _todo;
        return _todo;
    }
    async deleteTodo(todoID: number): Promise<Todo> {
        const index = this.todos.findIndex(todo => todo.id === todoID);
        if(index === -1) throw new Error('Could not find team');
        const todo = this.todos[index];
        this.todos.splice(index, 1);
        return todo;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = this.users.find(user => user.email === email);
        return user;
    }
    async getUser(id: number) {
        const user = this.users.find(user => user.id === id);
        if(!user) throw new Error('Cannot find user with id ' + id);
        return user;
    }
    async createUser(name: string, email: string): Promise<User> {
        const user: User = {
            name,
            email,
            id: this.maxID++
        }

        this.users.push(user);
        return user;
    }
    async deleteUser(userID: number) {
        const index = this.users.findIndex(user => user.id === userID);
        if(index === -1) throw new Error('Cannot find user with ID ' + userID);
        const filteredTeams = this.teams.filter(team => team.user1 !== userID && team.user2 !== userID);
        const filteredTodos = this.todos.filter(todo => todo.by !== userID && todo.for !== userID);

        this.todos = filteredTodos;
        this.teams = filteredTeams;

        this.users.splice(index, 1);
    }
}