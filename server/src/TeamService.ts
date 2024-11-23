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
    async createTeam(team: TeamCreate) {

        const _team = await this.db.getTeamByUsers(this.db.userID, team.user2);
        if(!team) {
            return await this.db.createTeam(team);
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