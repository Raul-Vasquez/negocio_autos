class LoginUseCase {

  constructor(repository) {
    this.repository = repository;
  }

  async execute(usuario, contrasena) {

    return await this.repository.login(
      usuario,
      contrasena
    );

  }

}

export default LoginUseCase;
