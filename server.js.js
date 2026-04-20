const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Estado global: 12 asientos
let asientos = Array(12).fill(false); 

io.on('connection', (socket) => {
    socket.emit('actualizar', asientos);

    // Lógica para ocupar/liberar
    socket.on('reservar', (index) => {
        asientos[index] = !asientos[index]; // Cambia el estado (Toggle)
        io.emit('actualizar', asientos); 
    });

    // Lógica para limpiar todo el tablero
    socket.on('limpiar_todo', () => {
        asientos = Array(12).fill(false);
        io.emit('actualizar', asientos);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Servidor listo'));
