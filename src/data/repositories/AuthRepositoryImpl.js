import { login as loginApi } from '../datasources/AuthApiDatasource';

class AuthRepositoryImpl {

  async login(usuario, contrasena) {

    return await loginApi(
      usuario,
      contrasena
    );

  }

}

export default AuthRepositoryImpl;