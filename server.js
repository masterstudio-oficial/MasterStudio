// AÑADE ESTA LÍNEA CERCA DEL INICIO DE TU server.js
// --------------------------------------------------
// Para activar el mantenimiento, cambia 'false' a 'true'.
const MAINTENANCE_MODE = true; 

// AÑADE ESTA RUTA DEBAJO DE LAS OTRAS RUTAS DE LA API (ej: /api/quiz/status)
// --------------------------------------------------------------------------
app.get('/api/maintenance/status', (req, res) => {
    // Devuelve el estado actual del modo de mantenimiento
    res.json({
        status: MAINTENANCE_MODE
    });
});
