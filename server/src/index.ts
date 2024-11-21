import * as express from 'express';
import * as session from 'express-session';

const PORT = process.env.PORT || 4444

const app = express();
app.use(session({
    secret: 'cookie'
}));
app.use(express.json())

type MySession = session.Session & { userID: number }

type MyRequest = express.Request & { session: Session };

abstract class AuthService {

    username: string;
    password: string;

    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    abstract login();
}

class PlayAuthService extends AuthService {

    session: MySession;
    
    constructor(username, password, session) {
        super(username, password);
        this.session = session;
    }

    login() {
        this.session.userID = parseInt(this.username);
        this.session.save();
    }
}

const todos = [];

app.post('/api/login', (req: MyRequest, res) => {
    console.log(req.body);
    const { username, password } = req.body;

    const auth = new PlayAuthService(username, password, req.session);

    auth.login();

    res.send(200);
})

app.post('/api/todos', (req: MyRequest, res) => {
    const { name, user } = req.body;
    todos.push({
        name,
        user,
        by: req.session.username
    })
    res.sendStatus(200);
})

app.get('/api/todos/my', (req: MyRequest, res) => {
    res.json(todos.filter(todo => todo.user === req.session.username));
})

app.get('/api/users/me', (req: express.Request & { session: { username: string }}, res) => {
    res.json({
        username: req.session.username
    })
})


app.listen(PORT, () => {
    console.log("Server listening on " + PORT);
})