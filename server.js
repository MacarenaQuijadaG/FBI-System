const express = require('express');
const agentes = require('./data/agentes.js').results;
const app = express();
const jwt = require('jsonwebtoken')

app.use(express.json());
// salida del puerto
app.listen(3000, () => console.log('Your app listening on port 3000'));

// salida del html
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const key = "clave";
// ruta de inicio de session
app.get("/SignIn", (req, res) => {
    const { email, password } = req.query;
    const agente = agentes.find((agente) => agente.email === email && agente.password === password);
   
    if (!agente) {
        return res.send(`
            <script>
                alert("Credenciales incorrectas");
                window.location.href = "/";
            </script>
        `);
    }

    if (agente) {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60,
            data: agente
        }, key);

        res.send(`
            Bienvenido, ${email}. Tu session expirara en segundos.
            <a href="/rutaRestringida?token=${token}">
                <p> Ingresar a la Ruta Restringida</p>
            </a>
            <script>
                sessionStorage.setItem('token', '${token}');
            </script>
        `);
    } else {
        res.send(`
            <script>
                alert("Usuario o contraseña incorrecta");
                window.location.href = "/";
            </script>
            `
         // res.send("Usuario o contraseña incorrecta");
        );
    }
});

app.get('/rutaRestringida', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.send(`
            <script>
                alert("No hay token, no esta autorizado");
                window.location.href = "/";
            </script>
        `);
    } else {
        jwt.verify(token, key, (err, data) => {
            if (err) {
                res.send(`
                    <script>
                        alert("Token invalido o ha expirado");
                        window.location.href = "/";
                    </script>
                `
                // res.status(403).send("Token invalido o ha expirado");
            );
            } else {
                res.send(`
                    Bienvenido ${data.data.email}. La session expirara en unos minutos.
                `);
            }
        });
    }
});
