import { Database } from 'Database';
import { TeamCreate, TeamUpdate } from '../../common/Team';

export default class TeamService {

    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async getTeams() {
        return await this.db.getTeams();
    }
    async createTeam(team: Omit<TeamCreate, 'user2'> & { user2: string }) {

        const user2 = await this.db.getUserByEmail(team.user2);

        if(!user2) {
            throw new Error('User not registered');
        }

        const _team = await this.db.getTeamByUsers(this.db.userID, user2.id);
        if(!team) {
            return await this.db.createTeam({
                ...team,
                user2: user2.id
            });
        } else {
            return await this.db.updateTeam({
                ..._team,
                accepted: true
            })
        }

    }
    async deleteTeam(teamID: number) {
        return await this.db.deleteTeam(teamID);
    }
}