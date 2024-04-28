const express = require('express');
const router = express.Router();
const Registro = require('../models/registro');

// Obtener el número de personas en cada habitación
router.get('/personas_todas_habitaciones', async (req, res) => {
    try {
        // Obtener todos los registros de entrada que no tienen un registro de salida correspondiente
        const registrosActivos = await Registro.find({ tipo: 'entrada' }).lean();

        // Crear un objeto para almacenar el recuento de personas en cada habitación
        const habitaciones = {};

        // Recorrer los registros activos y actualizar el recuento para cada habitación
        registrosActivos.forEach(registro => {
            const habitacion = registro.habitacion;
            if (habitaciones[habitacion]) {
                habitaciones[habitacion]++;
            } else {
                habitaciones[habitacion] = 1;
            }
        });

        // Convertir el objeto habitaciones en una lista de objetos
        const listaHabitaciones = Object.keys(habitaciones).map(habitacion => ({
            habitacion: habitacion,
            numPersonas: habitaciones[habitacion]
        }));

        // Si no hay ninguna habitación con personas, devolver un error
        if (listaHabitaciones.length === 0) {
            return res.status(400).json({ msg: "No hay ninguna habitación con personas" });
        }

        res.json(listaHabitaciones);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/personas_por_habitacion/:letra', async (req, res) => {
    try {
        const letra = req.params.letra.toUpperCase();

        // Obtener todos los registros
        const todosLosRegistros = await Registro.find();

        const habitaciones = {};

        // Inicializar el recuento para todas las habitaciones que comienzan con la letra especificada
        todosLosRegistros.forEach(registro => {
            const habitacion = registro.habitacion;
            if (habitacion.toUpperCase().startsWith(letra)) {
                habitaciones[habitacion] = 0;
            }
        });

        // Recorrer todos los registros y actualizar el recuento para cada habitación de tipo 'entrada'
        todosLosRegistros.forEach(registro => {
            const habitacion = registro.habitacion;
            if (registro.tipo === 'entrada' && habitacion.toUpperCase().startsWith(letra)) {
                habitaciones[habitacion]++;
            }
        });

        // Convertir el objeto habitaciones en una lista de objetos
        const listaHabitaciones = Object.keys(habitaciones).map(habitacion => ({
            habitacion: habitacion,
            numPersonas: habitaciones[habitacion]
        }));

        res.json(listaHabitaciones);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
