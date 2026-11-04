-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ejercicios Base
CREATE TABLE ejercicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    tipo ENUM('fuerza', 'cardio', 'flexibilidad') NOT NULL
);

-- Tabla de Rutinas Predefinidas
CREATE TABLE RutinaPredefinida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    nivel_dificultad ENUM('principiante', 'intermedio', 'avanzado') NOT NULL
);

-- Tabla de relación Rutinas Predefinidas - Ejercicios
CREATE TABLE rutina_predefinida_ejercicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rutina_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    series INT NOT NULL,
    repeticiones VARCHAR(50) NOT NULL, -- Puede ser un rango ej: "8-12"
    FOREIGN KEY (rutina_id) REFERENCES rutinas_predefinidas(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE
);

-- Tabla de Rutinas Personalizadas
CREATE TABLE rutinas_personalizadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de relación Rutinas Personalizadas - Ejercicios
CREATE TABLE rutina_personalizada_ejercicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rutina_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    dia ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL,
    series INT NOT NULL,
    repeticiones VARCHAR(50) NOT NULL,
    notas TEXT,
    FOREIGN KEY (rutina_id) REFERENCES rutinas_personalizadas(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE
);