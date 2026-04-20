const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Estado global: 12 asientos disponibles
let asientos = Array(12).fill(false); 

io.on('connection', (socket) => {
    // Enviar estado actual al conectar
    socket.emit('actualizar', asientos);

    socket.on('reservar', (index) => {
        // Lógica de Exclusión Mutua (Sistemas Distribuidos)
        if (!asientos[index]) {
            asientos[index] = true; 
            // Paso de mensajes a todos los usuarios
            io.emit('actualizar', asientos); 
        } else {
            socket.emit('error_concurrencia', '¡Demasiado tarde! Alguien más lo reservó.');
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Servidor activo en puerto ' + PORT));