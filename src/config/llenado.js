const { Sequelize } = require('sequelize');
const { Usuario, RutinaPredefinida, RutinaPersonalizada, Ejercicio,RutinaPersonalizadaEjercicios,RutinaPredefinidaEjercicios } = require('../db');

exports.cargarDatos = async (req, res) => {
    (async () => {
        try {
            const sequelize = new Sequelize('postgres', 'postgres', 'yones', {
                host: 'localhost',
                dialect: 'postgres',
                logging: false,
            });
            await sequelize.sync({ force: true });
            console.log('Base de datos sincronizada.');

            // Crear usuarios
            const usuarios = await Usuario.bulkCreate([
                { nombre: 'Juan Pérez', email: 'juan@email.com', contraseña_hash: 'juan123' },
                { nombre: 'María Gómez', email: 'maria@email.com', contraseña_hash: 'maria123' },
                { nombre: 'Carlos Ruiz', email: 'carlos@email.com', contraseña_hash: 'carlos123' },
            ]);

            // Crear ejercicios
            const ejercicios =await Ejercicio.bulkCreate([
                { nombre: 'Sentadillas', descripcion: 'Ejercicio para piernas y glúteos.', tipo: 'fuerza', imagen_url: 'https://ejemplo.com/sentadillas.jpg' },
                { nombre: 'Burpees', descripcion: 'Ejercicio completo de cuerpo.', tipo: 'cardio', imagen_url: 'https://ejemplo.com/burpees.jpg' },
                { nombre: 'Planchas', descripcion: 'Ejercicio isométrico para core.', tipo: 'fuerza', imagen_url: 'https://ejemplo.com/planchas.jpg' },
            ]);

            // Crear rutinas predefinidas
            const rutinaPredefinida =await RutinaPredefinida.bulkCreate([
                {
                    nombre: 'Rutina Básica',
                    descripcion: 'Rutina para principiantes.',
                    imagen_url: 'https://ejemplo.com/rutina-basica.jpg',
                    nivel_dificultad: 'principiante',  // Se agregó el campo obligatorio
                },
                {
                    nombre: 'Rutina Intermedia',
                    descripcion: 'Rutina para nivel intermedio.',
                    imagen_url: 'https://ejemplo.com/rutina-intermedia.jpg',
                    nivel_dificultad: 'intermedio',  // Se agregó el campo obligatorio
                }
            ]);
            

            // Crear rutinas personalizadas
            const rutinasPersonalizadas = await Promise.all([
                RutinaPersonalizada.create({
                    nombre: 'Rutina Quema Grasa',
                    descripcion: 'Rutina intensiva para perder peso.',
                    dia:"Lunes",
                    imagen_url: 'https://ejemplo.com/rutina-quema-grasa.jpg',
                    usuarioId: usuarios[0].id,
                }),
                RutinaPersonalizada.create({
                    nombre: 'Rutina Tonificación',
                    descripcion: 'Rutina para tonificar músculos.',
                    dia:"Lunes",
                    imagen_url: 'https://ejemplo.com/rutina-tonificacion.jpg',
                    usuarioId: usuarios[1].id,
                }),
            ]);
            const rutinaPersonalizadaEjercicios = await Promise.all([
                RutinaPersonalizadaEjercicios.create({
                    series:4,
                    repeticiones:'8-12',
                    RutinaPersonalizadaId: rutinasPersonalizadas[1].id,
                    EjercicioId: ejercicios[0].id,
                }),
                RutinaPersonalizadaEjercicios.create({
                    series:3,
                    repeticiones:'10-15',
                    RutinaPersonalizadaId: rutinasPersonalizadas[0].id,
                    EjercicioId: ejercicios[1].id,
                }),
            ]);
            const rutinaPredefinidaEjercicios = await Promise.all([
                RutinaPredefinidaEjercicios.create({
                    series:4,
                    repeticiones:'8-12',
                    RutinaPredefinidaId: rutinaPredefinida[0].id,
                    EjercicioId: ejercicios[1].id,
                }),
                RutinaPredefinidaEjercicios.create({
                    series:4,
                    repeticiones:'8-12',
                    RutinaPredefinidaId: rutinaPredefinida[0].id,
                    EjercicioId: ejercicios[2].id,
                }),
                RutinaPredefinidaEjercicios.create({
                    series:3,
                    repeticiones:'10-15',
                    RutinaPredefinidaId: rutinaPredefinida[1].id,
                    EjercicioId: ejercicios[0].id,
                }),
                RutinaPredefinidaEjercicios.create({
                    series:4,
                    repeticiones:'8-12',
                    RutinaPredefinidaId: rutinaPredefinida[1].id,
                    EjercicioId: ejercicios[1].id,
                }),
                RutinaPredefinidaEjercicios.create({
                    series:4,
                    repeticiones:'8-12',
                    RutinaPredefinidaId: rutinaPredefinida[1].id,
                    EjercicioId: ejercicios[2].id,
                }),
            ]);

            console.log('Rutinas personalizadas creadas.');
        } catch (error) {
            console.error('Error al llenar la base de datos:', error);
        }
    })();
};
