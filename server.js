const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Estructura de Datos: 20 asientos y una bitácora
let asientos = Array(20).fill(null);
let historial = [];

io.on('connection', (socket) => {
    // Enviar estado actual al conectar
    socket.emit('actualizar', { asientos, historial });

    // Función de Latencia (Ping) para demostrar Programación en Red
    socket.on("ping", (callback) => {
        if (typeof callback === "function") callback();
    });

    // Manejo de Reservas (Concurrencia)
    socket.on('reservar', (data) => {
        const { index, usuario } = data;
        if (index < 0 || index >= asientos.length) return;

        if (asientos[index] === null) {
            asientos[index] = usuario;
            agregarLog(usuario, `Reservó el asiento A-${index + 1}`);
        } else if (asientos[index] === usuario) {
            asientos[index] = null;
            agregarLog(usuario, `Canceló la reserva A-${index + 1}`);
        }
        io.emit('actualizar', { asientos, historial });
    });

    // Limpiar Servidor
    socket.on('limpiar_todo', (data) => {
        asientos = Array(20).fill(null);
        historial = [];
        agregarLog(data.usuario, "REINICIÓ EL TABLERO GLOBAL");
        io.emit('actualizar', { asientos, historial });
    });
});

function agregarLog(usuario, accion) {
    const entrada = {
        usuario,
        accion,
        fecha: new Date().toLocaleTimeString()
    };
    historial.push(entrada);
    if (historial.length > 25) historial.shift(); // Mantiene la lista limpia
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`CineUiepa corriendo en puerto ${PORT}`);
});
