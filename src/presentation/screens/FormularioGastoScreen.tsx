import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../../shared/constants/api';

const TIPOS_GASTO = [
  'Mantenimiento',
  'Combustible',
  'Repuestos',
  'Lavado',
  'Contrato/Notaria',
  'Movilizacion',
  'Comida',
];

const SOCIOS = ['Raúl', 'Héctor'];

export default function FormularioGastoScreen() {
  const router = useRouter();
  
  const { placa } = useLocalSearchParams<{ placa: string }>();

  const [tipoGasto, setTipoGasto] = useState(TIPOS_GASTO[0]);
  const [registradoPor, setRegistradoPor] = useState(SOCIOS[0]);
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [fecha, setFecha] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  // Manejo de selección de fecha con validación para no permitir fechas futuras
  const onChangeFecha = (event: any, selectedDate?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (selectedDate) {
      const hoy = new Date();
      if (selectedDate > hoy) {
        mostrarAlertaAdvertencia('Fecha no válida', 'No puedes registrar gastos con fechas futuras.');
        setFecha(hoy);
      } else {
        setFecha(selectedDate);
      }
    }
  };

  const mostrarAlertaAdvertencia = (titulo: string, mensaje: string) => {
    Alert.alert(`⚠️ ${titulo}`, mensaje, [{ text: 'Entendido' }]);
  };

  const guardarGasto = async () => {
    setErrorMensaje(null);

    // Validaciones de campos
    if (!placa || !placa.trim()) {
      mostrarAlertaAdvertencia('Campo requerido', 'No se ha detectado la placa del vehículo.');
      return;
    }

    if (!tipoGasto || !tipoGasto.trim()) {
      mostrarAlertaAdvertencia('Campo requerido', 'Selecciona un tipo de gasto.');
      return;
    }

    if (!registradoPor || !registradoPor.trim()) {
      mostrarAlertaAdvertencia('Campo requerido', 'Selecciona la persona que registró el gasto.');
      return;
    }

    if (!valor || !valor.trim()) {
      mostrarAlertaAdvertencia('Campo requerido', 'Ingresa el valor del gasto.');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      mostrarAlertaAdvertencia('Valor inválido', 'Ingresa un monto numérico mayor a cero.');
      return;
    }

    if (!descripcion || !descripcion.trim()) {
      mostrarAlertaAdvertencia('Campo requerido', 'Ingresa una descripción del gasto.');
      return;
    }

    // Validación extra antes de enviar
    if (fecha > new Date()) {
      mostrarAlertaAdvertencia('Fecha no válida', 'La fecha del gasto no puede ser mayor a la fecha actual.');
      return;
    }

    setCargando(true);

    try {
      // Formato DD/MM/YYYY para coincidir con el backend
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      const fechaFormatted = `${dia}/${mes}/${anio}`;

      const respuesta = await fetch(`${API_BASE_URL}/api/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: placa.trim(),
          tipoGasto: tipoGasto.trim(),
          registradoPor: registradoPor.trim(),
          valor: valorNumerico,
          descripcion: descripcion.trim(),
          fechaGasto: fechaFormatted,
        }),
      });

      // Manejo seguro para evitar "JSON parse error: Unexpected character"
      const textoRespuesta = await respuesta.text();
      let json: any = {};

      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        throw new Error(`El servidor respondió con un formato no válido (${respuesta.status}).`);
      }

      if (!respuesta.ok) {
        throw new Error(json.error || 'No se pudo registrar el gasto en el servidor.');
      }

      Alert.alert('Éxito', 'Gasto registrado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const mensaje = error.message || 'Error de conexión con el servidor.';
      setErrorMensaje(mensaje);
      mostrarAlertaAdvertencia('Error al Guardar', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.titulo}>Registrar Gasto</Text>

        {errorMensaje && (
          <View style={styles.bannerError}>
            <Ionicons name="warning" size={20} color="#EAB308" />
            <Text style={styles.textoBannerError}>{errorMensaje}</Text>
          </View>
        )}

        <Text style={styles.label}>Placa del Vehículo *</Text>
        <TextInput
          style={[styles.input, styles.inputBloqueado]}
          value={placa || 'Sin Placa'}
          editable={false}
        />

        <Text style={styles.label}>Tipo de Gasto *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoGasto}
            onValueChange={(itemValue) => setTipoGasto(itemValue)}
          >
            {TIPOS_GASTO.map((tipo) => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Pagado Por *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={registradoPor}
            onValueChange={(itemValue) => setRegistradoPor(itemValue)}
          >
            {SOCIOS.map((socio) => (
              <Picker.Item key={socio} label={socio} value={socio} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Valor ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={valor}
          onChangeText={setValor}
        />

        <Text style={styles.label}>Fecha del Gasto *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setMostrarCalendario(true)}
        >
          <Text style={styles.textoFecha}>
            {fecha.toLocaleDateString('es-ES')}
          </Text>
        </TouchableOpacity>

        {mostrarCalendario && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            maximumDate={new Date()} // Bloquea fechas futuras en el calendario
            onChange={onChangeFecha}
          />
        )}

        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalles adicionales del gasto..."
          multiline
          numberOfLines={3}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDesactivado]}
          onPress={guardarGasto}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.textoBoton}>Guardar Gasto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20, backgroundColor: '#FFFFFF', flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  textoBannerError: { color: '#991B1B', fontSize: 13, flex: 1, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    justifyContent: 'center',
  },
  inputBloqueado: { backgroundColor: '#E2E8F0', color: '#64748B', fontWeight: 'bold' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#F8FAFC',
  },
  textoFecha: { fontSize: 16, color: '#0F172A' },
  textArea: { height: 80, textAlignVertical: 'top' },
  boton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  botonDesactivado: { backgroundColor: '#94A3B8' },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});