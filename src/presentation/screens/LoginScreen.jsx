/*
|--------------------------------------------------------------------------
| 1. Librerías
|--------------------------------------------------------------------------
*/

import React, { useState } from 'react';

import {
  Alert,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AuthRepositoryImpl from '../../data/repositories/AuthRepositoryImpl';
import LoginUseCase from '../../domain/usecases/LoginUseCase';

/*
|--------------------------------------------------------------------------
| 2. Dependencias del Login
|--------------------------------------------------------------------------
*/

const authRepository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepository);

/*
|--------------------------------------------------------------------------
| 3. Pantalla Login
|--------------------------------------------------------------------------
*/

export default function LoginScreen() {

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  async function iniciarSesion() {

    if (!usuario.trim()) {

      Alert.alert(
        'Validación',
        'Ingrese el usuario'
      );

      return;
    }

    if (!contrasena.trim()) {

      Alert.alert(
        'Validación',
        'Ingrese la contraseña'
      );

      return;
    }

    try {

      const resultado =
        await loginUseCase.execute(
          usuario,
          contrasena
        );

      if (resultado.success) {

        Alert.alert(
          'Bienvenido',
          `${resultado.usuario.nombres} ${resultado.usuario.apellidos}`
        );

      } else {

        Alert.alert(
          'Acceso denegado',
          resultado.message
        );

      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No fue posible conectar con el servidor'
      );

    }

  }

  return (

    <ImageBackground
      source={require('../../../assets/images/Login_Inicio.jpg')}
      style={styles.background}
      resizeMode="cover"
    >

      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.overlay}>

        {/* Tarjeta principal */}

        <View style={styles.card}>

          <Text style={styles.titulo}>
            Órbita Rodante
          </Text>

          <Text style={styles.subtitulo}>
            Sistema de Gestión Vehicular
          </Text>

          {/* Usuario */}

          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#555"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          {/* Contraseña */}

          <View style={styles.passwordContainer}>

            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#555"
              secureTextEntry={!mostrarContrasena}
              value={contrasena}
              onChangeText={setContrasena}
            />

            <TouchableOpacity
              onPress={() =>
                setMostrarContrasena(
                  !mostrarContrasena
                )
              }
            >

              <Text style={styles.eye}>
                {mostrarContrasena ? '🔒' : '🕵️‍♂️'}
              </Text>

            </TouchableOpacity>

          </View>

          {/* Botón */}

          <TouchableOpacity
            style={styles.boton}
            onPress={iniciarSesion}
          >

            <Text style={styles.textoBoton}>
              Ingresar
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    </ImageBackground>

  );

}

/*
|--------------------------------------------------------------------------
| 4. Estilos
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },

  overlay: {
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 25,
  paddingBottom: 120,
  backgroundColor: 'rgba(0,0,0,0.15)',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderRadius: 25,
    padding: 25,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0D6EFD',
    marginBottom: 10,
  },

  subtitulo: {
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
    marginBottom: 25,
  },

  input: {
   backgroundColor: 'rgba(255,255,255,0.20)',
   borderWidth: 1,
   borderColor: 'rgba(255,255,255,0.70)',
   borderRadius: 12,
   padding: 15,
   marginBottom: 15,
   color: '#000',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#000',
  },

  eye: {
    fontSize: 22,
    paddingHorizontal: 15,
  },

  boton: {
    backgroundColor: '#0D6EFD',
    padding: 16,
    borderRadius: 12,
  },

  textoBoton: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

});