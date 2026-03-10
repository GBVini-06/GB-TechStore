const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '123456', 
    database: 'techstore' 
});

db.connect((err) => {
    if (err) {
        console.error(' Erro no banco:', err.message);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});

app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) res.json({ message: 'Login OK!', user: results[0] });
        else res.status(401).json({ message: 'Inválido' });
    });
});

app.get('/api/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/produtos/:id', (req, res) => {
    const id = req.params.id;
    
    db.query('SELECT * FROM produtos WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            res.json(results[0]); 
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});