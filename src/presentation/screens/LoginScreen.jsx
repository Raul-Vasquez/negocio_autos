import { useState } from 'react';

import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const iniciarSesion = async () => {

    try {

      const response = await fetch(
        'http://TU_IP_LOCAL:3000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            usuario,
            contrasena
          })
        }
      );

      const data = await response.json();

      if (data.success) {

        Alert.alert(
          'Bienvenido',
          `${data.usuario.nombres} ${data.usuario.apellidos}`
        );

      } else {

        Alert.alert(
          'Acceso denegado',
          data.message
        );

      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No fue posible conectar con el servidor'
      );

    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Órbita Rodante
      </Text>

      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={usuario}
        onChangeText={setUsuario}
      />

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
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
    padding: 25,
    backgroundColor: '#F5F7FA'
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40
  },

  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF'
  },

  boton: {
    backgroundColor: '#0D6EFD',
    padding: 15,
    borderRadius: 10
  },

  textoBoton: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  }

});