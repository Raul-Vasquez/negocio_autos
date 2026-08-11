import {
  useState
} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AuthRepositoryImpl from '../../data/repositories/AuthRepositoryImpl';

import LoginUseCase from '../../domain/usecases/LoginUseCase';

const repository =
new AuthRepositoryImpl();

const loginUseCase =
new LoginUseCase(repository);

export default function LoginScreen() {

  const [usuario, setUsuario] =
    useState('');

  const [contrasena, setContrasena] =
    useState('');

  async function iniciarSesion() {

    try {

      const resultado =
        await loginUseCase.execute(
          usuario,
          contrasena
        );

      if (resultado.success) {

        Alert.alert(
          'Bienvenido',
          resultado.usuario.nombres
        );

      } else {

        Alert.alert(
          'Acceso denegado',
          resultado.message
        );

      }

    } catch {

      Alert.alert(
        'Error',
        'No fue posible conectar al servidor'
      );

    }

  }

  return (

    <View style={styles.container}>

      <Text style={styles.titulo}>
        Órbita Rodante
      </Text>

      <TextInput
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={iniciarSesion}
      >

        <Text style={styles.textoBoton}>
          Ingresar
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 50
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50
  },

  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15
  },

  boton: {
    backgroundColor: '#b4ef13',
    padding: 20,
    borderRadius: 15
  },

  textoBoton: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  }

});