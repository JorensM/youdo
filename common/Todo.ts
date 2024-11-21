export type Todo = {
    id: number,
    for: number,
    by: number,
    name: string,
    description: string
}

export type TodoCreate = Omit<Todo, 'id'>
export type TodoUpdate = Partial<Todo> & { id: number }