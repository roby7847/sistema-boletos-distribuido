const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let asientos = Array(12).fill(null); // Guardaremos el nombre de quien reserva

io.on('connection', (socket) => {
    socket.emit('actualizar', asientos);

    socket.on('reservar', (data) => {
        const { index, usuario } = data;
        // Si está libre, lo ocupa el usuario. Si ya es suyo, lo libera.
        if (asientos[index] === null) {
            asientos[index] = usuario;
        } else if (asientos[index] === usuario) {
            asientos[index] = null;
        }
        io.emit('actualizar', asientos);
    });

    socket.on('limpiar_todo', () => {
        asientos = Array(12).fill(null);
        io.emit('actualizar', asientos);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Servidor en marcha'));
