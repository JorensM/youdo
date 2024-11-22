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
        return await this.db.createTeam(team);
    }
    async updateTeam(team: TeamUpdate) {
        return await this.db.updateTeam(team);
    }
    async deleteTeam(teamID: number) {
        return await this.db.deleteTeam(teamID);
    }
}