/*
|--------------------------------------------------------------------------
| BLOQUE 1: HERRAMIENTAS Y LIBRERÍAS
| Traemos las herramientas de React Native, AsyncStorage y navegación.
|--------------------------------------------------------------------------
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthRepositoryImpl from '../../data/repositories/AuthRepositoryImpl';
import LoginUseCase from '../../domain/usecases/LoginUseCase';

/*
|--------------------------------------------------------------------------
| BLOQUE 2: CONEXIÓN DE REGLAS DE NEGOCIO
|--------------------------------------------------------------------------
*/
const authRepository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepository);

/*
|--------------------------------------------------------------------------
| BLOQUE 3: PANTALLA VISUAL Y LÓGICA DE ACCESO
|--------------------------------------------------------------------------
*/
export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  async function iniciarSesion() {
    if (!usuario.trim()) {
      Alert.alert('Validación', 'Ingrese el usuario');
      return;
    }

    if (!contrasena.trim()) {
      Alert.alert('Validación', 'Ingrese la contraseña');
      return;
    }

    try {
      const resultado = await loginUseCase.execute(usuario, contrasena);

      if (resultado.success) {
        // Guardamos los datos reales del usuario (Raúl u Héctor) en el teléfono
        await AsyncStorage.setItem('usuarioSesion', JSON.stringify(resultado.usuario));

        Alert.alert(
          'Bienvenido',
          `${resultado.usuario.nombres} ${resultado.usuario.apellidos}`,
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Acceso denegado', resultado.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No fue posible conectar con el servidor');
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/Login_Inicio.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent={false} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Órbita Rodante</Text>
          <Text style={styles.subtitulo}>Sistema de Gestión Vehicular</Text>

          {/* Campo de Usuario */}
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#555"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          {/* Campo de Contraseña */}
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
              onPress={() => setMostrarContrasena(!mostrarContrasena)}
            >
              <Text style={styles.eye}>
                {mostrarContrasena ? '🔒' : '🕵️‍♂️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón para Ingresar */}
          <TouchableOpacity style={styles.boton} onPress={iniciarSesion}>
            <Text style={styles.textoBoton}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/*
|--------------------------------------------------------------------------
| BLOQUE 4: DISEÑO Y ESTILOS
|--------------------------------------------------------------------------
*/
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
 overlay: {
    flex: 1,
    justifyContent: 'center', // Centra el contenido verticalmente
    paddingHorizontal: 25,
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