export type Team = {
    id: number
    user1: number
    user2: number
    accepted: boolean
}

export type TeamCreate = Omit<Team, 'id' | 'accepted' | 'user1'>;
export type TeamUpdate = Omit<Team, 'user1' | 'user2'>;

