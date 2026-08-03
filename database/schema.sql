CREATE TABLE usuarios (

    usuario VARCHAR(50) PRIMARY KEY,

    nombres VARCHAR(100) NOT NULL,

    apellidos VARCHAR(100) NOT NULL,

    contrasena VARCHAR(255) NOT NULL

);

CREATE TABLE duenos (

    cedula VARCHAR(10) PRIMARY KEY,

    nombres VARCHAR(150) NOT NULL,

    telefono VARCHAR(20),

    direccion VARCHAR(200),

    ciudad VARCHAR(100)

);

CREATE TABLE clientes (

    cedula VARCHAR(10) PRIMARY KEY,

    nombres VARCHAR(150) NOT NULL,

    telefono VARCHAR(20),

    direccion VARCHAR(200),

    ciudad VARCHAR(100)

);

CREATE TABLE vehiculos (

    placa VARCHAR(8) PRIMARY KEY,

    marca VARCHAR(100) NOT NULL,

    modelo VARCHAR(100) NOT NULL,

    anio INT,

    color VARCHAR(50),

    combustible VARCHAR(50),

    fecha_compra DATE,

    precio_compra DECIMAL(10,2),

    numero_traspasos INT,

    sri DECIMAL(10,2),

    coopaire DECIMAL(10,2),

    ant DECIMAL(10,2),

    total_adeudado DECIMAL(10,2),

    motor VARCHAR(20),

    estetica_exterior VARCHAR(20),

    estetica_interior VARCHAR(20),

    observaciones TEXT,

    foto_principal VARCHAR(255),

    cedula_dueno VARCHAR(10)

);

CREATE TABLE aportes_socios (

    placa VARCHAR(8) PRIMARY KEY,

    aporte_raul DECIMAL(10,2),

    aporte_hector DECIMAL(10,2)

);

CREATE TABLE gastos (

    id INT AUTO_INCREMENT PRIMARY KEY,

    placa VARCHAR(8),

    tipo_gasto VARCHAR(50),

    valor DECIMAL(10,2),

    descripcion TEXT,

    fecha_gasto DATE

);