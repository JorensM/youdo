import PlayDatabase, { Database } from 'Database';
import * as express from 'express';
import * as session from 'express-session';
import TeamService from 'TeamService';
import TodoService from 'TodoService';
import * as cors from 'cors';

const PORT = process.env.PORT || 4444
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const app = express();
app.use(session({
    secret: 'cookie'
}));
app.use(express.json());
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

type MySession = session.Session & { userID: number }

type MyRequest = express.Request & { session: MySession };

abstract class AuthService {

    email: string;
    password: string;

    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    abstract login(): Promise<void>;
}

class PlayAuthService extends AuthService {

    session: MySession;
    db: Database;
    
    constructor(email, password, session, db) {
        super(email, password);
        this.session = session;
        this.db = db;
    }

    async login() {
        let user = await this.db.getUserByEmail(this.email);
        if(!user) {
            user = await this.db.createUser(
                "User",
                this.email
            );
        }
        this.session.userID = user.id;
        this.session.save();
        console.log('saved session');
        console.log(this.session);
    }
}

const todos = [];

const DB = PlayDatabase;

const validateProperties = (properties: Record<string, any>, res: express.Response) => {
    let missingPropertyNames = [];
    for(const property of Object.entries(properties)) {
        if(!property[1]) missingPropertyNames.push(property[0]);
    }
    if(missingPropertyNames.length) {
        throw missingPropertyNames;
    }
}

app.use((req: MyRequest, res, next) => {
    console.log(req.session);
    if(!req.url.includes('login') && typeof req.session.userID === 'undefined') {
        console.error('Not authenticated');
        res.status(401).send('Unauthorized');
    } else {
        next();
    }
})

app.post('/api/login', async (req: MyRequest, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    try {
        validateProperties({ email }, res);
    } catch (missingPropertyNames) {
        res.status(400).send('Missing properties: ' + 
            missingPropertyNames.join(', '));
        return;
    }

    const db = new PlayDatabase(undefined);

    const auth = new PlayAuthService(email, password, req.session, db);

    try{
        await auth.login();
    } catch {
        res.sendStatus(500);
        return;
    }

    console.log(req.session);

    res.json({
        ok: true
    })
    return;
})

app.delete('/api/account', async (req: MyRequest, res) => {
    const userID = req.session.userID;
    const db = new DB(userID);

    db.deleteUser(userID);

    res.json({
        ok: true
    })
})

app.post('/api/todos', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const todoService = new TodoService(db);

    const { name, description, teamID } = req.body;

    validateProperties({name, teamID}, res);

    const todo = todoService.createTodo({
        name,
        description,
        teamID
    })

    res.json(todo);
})

app.get('/api/todos', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const todoService = new TodoService(db);

    const teamID = parseInt(req.query.teamID as string);

    const team = db.getTeam(teamID);

    if(!team) res.status(404).send('Team with ID ' + teamID + ' not found');

    const todos = await todoService.getTodos(teamID);
    res.json(todos);
})

app.get('/api/todos/:todoID', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    
    const todoID = parseInt(req.params.todoID)

    const todo = db.getTodo(todoID);

    res.json(todo);
})

app.patch('/api/todos/:todoID', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const todoService = new TodoService(db);

    const todoID = parseInt(req.params.todoId);

    const todo = await db.getTodo(todoID);

    if(!todo) res.status(404).send('Todo with ID ' + todoID + ' not found');

    const newTodo = await todoService.updateTodo({...req.body});

    res.json(newTodo);
})

app.post('/api/teams', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const teamService = new TeamService(db);

    const { user2 }: { user2: string } = req.body;

    try {
        validateProperties({user2}, res);
    } catch (missingPropertyNames) {
        res.status(400).send(missingPropertyNames.join(', '));
    }

    const team = await teamService.createTeam({
        user2
    })

    res.json(team);
})

app.get('/api/teams', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const teamService = new TeamService(db);

    const teams = await teamService.getTeams();

    res.json(teams);
})


app.listen(PORT, () => {
    console.log("Server listening on " + PORT);
})