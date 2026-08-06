class LoginUseCase {

  constructor(userRepository) {

    this.userRepository = userRepository;

  }

  async ejecutar(usuario, password) {

    throw new Error(
      'Lógica de autenticación pendiente'
    );

  }

}

module.exports = LoginUseCase;