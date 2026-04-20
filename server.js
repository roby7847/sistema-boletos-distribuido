const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let asientos = Array(12).fill(null);
let historial = []; // Nuevo: Almacena los últimos 10 movimientos

io.on('connection', (socket) => {
    socket.emit('actualizar', { asientos, historial });

    socket.on('reservar', (data) => {
        const { index, usuario } = data;
        const fecha = new Date().toLocaleTimeString();
        let accion = "";

        if (asientos[index] === null) {
            asientos[index] = usuario;
            accion = `reservó el asiento ${index + 1}`;
        } else if (asientos[index] === usuario) {
            asientos[index] = null;
            accion = `liberó el asiento ${index + 1}`;
        }

        if (accion) {
            historial.unshift({ usuario, accion, fecha });
            if (historial.length > 8) historial.pop(); // Mantener solo los últimos 8
            io.emit('actualizar', { asientos, historial });
        }
    });

    socket.on('limpiar_todo', () => {
        asientos = Array(12).fill(null);
        historial.unshift({ usuario: "Sistema", accion: "reinició todo el tablero", fecha: new Date().toLocaleTimeString() });
        io.emit('actualizar', { asientos, historial });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Servidor en línea'));
