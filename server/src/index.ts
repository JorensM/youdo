import PlayDatabase, { Database } from 'Database';
import * as express from 'express';
import * as session from 'express-session';
import TodoService from 'TodoService';

const PORT = process.env.PORT || 4444

const app = express();
app.use(session({
    secret: 'cookie'
}));
app.use(express.json())

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
    db: Database
    
    constructor(email, password, session, db) {
        super(email, password);
        this.session = session;
        this.db = db;
    }

    async login() {
        let user = await this.db.getUserByEmail(this.email);
        if(user) {
            user = await this.db.createUser(
                "User",
                this.email
            );
        }
        this.session.userID = user.id;
        this.session.save();
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
        res.status(400).send('Missing properties: ' + 
        missingPropertyNames.join(', '));
    }
}

app.use((req: MyRequest, res) => {
    if(!req.url.includes('login') && !req.session.userID) {
        console.error('Not authenticated');
        res.status(401).send('Unauthorized');
    }
})

app.post('/api/login', (req: MyRequest, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    validateProperties({email, password}, res);

    const db = new PlayDatabase(undefined);

    const auth = new PlayAuthService(email, password, req.session, db);

    auth.login();


    res.send(200);
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

app.get('/api/todos/:teamID', async (req: MyRequest, res) => {
    const db = new DB(req.session.userID);
    const todoService = new TodoService(db);

    const teamID = parseInt(req.params.todoID);

    const todos = await todoService.getTodos(teamID);
    res.json(todos);
})

app.get('')


app.listen(PORT, () => {
    console.log("Server listening on " + PORT);
})