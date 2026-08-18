class User {

  constructor(data) {
    this.usuario = data.usuario;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.rol = data.rol;
  }

}

module.exports = User;