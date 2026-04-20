const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONFIGURACIÓN DE RUTAS ---
// Servimos los archivos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- ESTRUCTURA DE DATOS (Punto 1 de tu rúbrica) ---
// Inicializamos 20 asientos vacíos (null)
let asientos = Array(20).fill(null);
let historial = [];

// --- LÓGICA DE PROGRAMACIÓN EN RED (Punto 7) ---
io.on('connection', (socket) => {
    console.log('Nuevo nodo conectado al sistema CineUiepa');

    // Enviar estado inicial al nuevo cliente
    socket.emit('actualizar', { asientos, historial });

    // Función de Latencia (Ping)
    socket.on("ping", (callback) => {
        if (typeof callback === "function") callback();
    });

    // Manejo de Reservas (Punto 3: Concurrencia)
    socket.on('reservar', (data) => {
        const { index, usuario } = data;

        // Validación de Integridad
        if (index < 0 || index >= asientos.length) return;

        if (asientos[index] === null) {
            // Reservar asiento
            asientos[index] = usuario;
            agregarAlHistorial(usuario, `Reservó el asiento A-${index + 1}`);
        } else if (asientos[index] === usuario) {
            // Cancelar reserva propia
            asientos[index] = null;
            agregarAlHistorial(usuario, `Canceló la reserva del asiento A-${index + 1}`);
        }

        // Sincronizar a todos los clientes (Broadcast)
        io.emit('actualizar', { asientos, historial });
    });

    // Reiniciar Sistema (Punto 4: Integración)
    socket.on('limpiar_todo', (data) => {
        asientos = Array(20).fill(null);
        historial = [];
        agregarAlHistorial(data.usuario, "REINICIÓ EL SISTEMA COMPLETO");
        io.emit('actualizar', { asientos, historial });
    });
});

// --- FUNCIÓN DE BITÁCORA (Punto 5: OOP / Modularidad) ---
function agregarAlHistorial(usuario, accion) {
    const nuevaEntrada = {
        usuario,
        accion,
        fecha: new Date().toLocaleTimeString()
    };
    historial.push(nuevaEntrada);
    
    // Mantener solo los últimos 30 movimientos para no saturar la memoria
    if (historial.length > 30) historial.shift();
}

// --- ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor CineUiepa corriendo en puerto ${PORT}`);
});
