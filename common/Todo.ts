export type Todo = {
    id: number,
    for: number,
    by: number,
    name: string,
    description: string,
    completed: boolean,
    teamID: number,
}

export type TodoCreate = Omit<Todo, 'id' | 'by'>
export type TodoUpdate = Partial<Todo> & { id: number }