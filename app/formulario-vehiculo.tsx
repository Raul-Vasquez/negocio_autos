/*
|--------------------------------------------------------------------------
| CAPA DE PRESENTACIÓN: FORMULARIO WIZARD RESTRUCTURADO (5 PASOS)
|--------------------------------------------------------------------------
*/
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import VehiculoRepositoryImpl from '../src/data/repositories/VehiculoRepositoryImpl';
import CrearVehiculoUseCase from '../src/domain/usecases/CrearVehiculoUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const crearVehiculoUseCase = new CrearVehiculoUseCase(vehiculoRepo);

export default function FormularioVehiculoScreen() {
  const params = useLocalSearchParams();

  const [paso, setPaso] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  // Paso 1: Datos Principales del Vehículo
  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState((params.tipo as string) || 'Camioneta');
  const [marca, setMarca] = useState('Ford');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('Gris Plomo');
  const [combustible, setCombustible] = useState('Diesel');

  // Paso 2: Estética y Foto desde Galería
  const [motor, setMotor] = useState('');
  const [esteticaExterior, setEsteticaExterior] = useState('10/10');
  const [esteticaInterior, setEsteticaInterior] = useState('10/10');
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');

  // Paso 3: Datos del Dueño
  const [cedulaDueno, setCedulaDueno] = useState('');
  const [nombreDueno, setNombreDueno] = useState('');
  const [telefonoDueno, setTelefonoDueno] = useState('');

  // Paso 4: Financiero y Deudas (Informativo)
  const [fechaCompra, setFechaCompra] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [numeroTraspasos, setNumeroTraspasos] = useState('');
  const [sri, setSri] = useState('0');
  const [coopaire, setCoopaire] = useState('0');
  const [ant, setAnt] = useState('0');

  // Paso 5: Aportes de Socios
  const [aporteRaul, setAporteRaul] = useState('');
  const [aporteHector, setAporteHector] = useState('');

  const totalAdeudadoCalculado =
    (parseFloat(sri) || 0) + (parseFloat(coopaire) || 0) + (parseFloat(ant) || 0);

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso Denegado', 'Se necesita acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFotoPrincipal(result.assets[0].uri);
    }
  };

  const guardar = async () => {
    if (!placa.trim() || !modelo.trim() || !precioCompra.trim()) {
      Alert.alert('Atención', 'Por favor complete Placa, Modelo y Precio de Compra.');
      return;
    }

    try {
      await crearVehiculoUseCase.execute({
        placa,
        marca,
        modelo,
        tipoVehiculo,
        anio: parseInt(anio) || 2024,
        color,
        combustible,
        fechaCompra,
        precioCompra: parseFloat(precioCompra) || 0,
        numeroTraspasos: parseInt(numeroTraspasos) || 0,
        sri: parseFloat(sri) || 0,
        coopaire: parseFloat(coopaire) || 0,
        ant: parseFloat(ant) || 0,
        totalAdeudado: totalAdeudadoCalculado,
        motor,
        esteticaExterior,
        esteticaInterior,
        observaciones,
        fotoPrincipal: fotoPrincipal || '',
        cedulaDueno,
        nombreDueno,
        telefonoDueno,
        aporteRaul: parseFloat(aporteRaul) || 0,
        aporteHector: parseFloat(aporteHector) || 0,
      });

      setModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el registro.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (paso > 1 ? setPaso(paso - 1) : router.back())}>
          <Text style={styles.backBtn}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ingreso (Paso {paso} de 5)</Text>
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[styles.progressStep, paso >= item && styles.progressStepActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {paso === 1 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 1: Datos del Vehículo</Text>
            <Text style={styles.label}>Placa del Vehículo *</Text>
            <TextInput style={styles.input} placeholder="Ej: PBC-1234" value={placa} onChangeText={setPlaca} autoCapitalize="characters" />

            <Text style={styles.label}>Tipo de Vehículo</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={tipoVehiculo} onValueChange={(val: string) => setTipoVehiculo(val)}>
                <Picker.Item label="Camioneta" value="Camioneta" />
                <Picker.Item label="Camión" value="Camión" />
                <Picker.Item label="Auto" value="Auto" />
                <Picker.Item label="SUV" value="SUV" />
              </Picker>
            </View>

            <Text style={styles.label}>Marca *</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={marca} onValueChange={(val: string) => setMarca(val)}>
                <Picker.Item label="Ford" value="Ford" />
                <Picker.Item label="Toyota" value="Toyota" />
                <Picker.Item label="Hino" value="Hino" />
                <Picker.Item label="Chevrolet" value="Chevrolet" />
                <Picker.Item label="Nissan" value="Nissan" />
              </Picker>
            </View>

            <Text style={styles.label}>Modelo *</Text>
            <TextInput style={styles.input} placeholder="Ej: F-150 Lariat" value={modelo} onChangeText={setModelo} />

            <Text style={styles.label}>Año</Text>
            <TextInput style={styles.input} placeholder="Ej: 2023" keyboardType="numeric" value={anio} onChangeText={setAnio} />

            <Text style={styles.label}>Color</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={color} onValueChange={(val: string) => setColor(val)}>
                <Picker.Item label="Gris Plomo" value="Gris Plomo" />
                <Picker.Item label="Blanco" value="Blanco" />
                <Picker.Item label="Negro" value="Negro" />
                <Picker.Item label="Plateado" value="Plateado" />
                <Picker.Item label="Rojo" value="Rojo" />
              </Picker>
            </View>

            <Text style={styles.label}>Combustible</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={combustible} onValueChange={(val: string) => setCombustible(val)}>
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="Gasolina Extra" value="Gasolina Extra" />
                <Picker.Item label="Gasolina Súper" value="Gasolina Súper" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setPaso(2)}>
              <Text style={styles.btnText}>Siguiente: Estética y Foto ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 2 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 2: Inspección y Foto</Text>
            <Text style={styles.label}>Foto Principal del Vehículo</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={seleccionarFoto}>
              <Text style={styles.imagePickerText}>
                {fotoPrincipal ? '📷 Cambiar Foto' : '🖼️ Seleccionar desde Galería'}
              </Text>
            </TouchableOpacity>

            {fotoPrincipal && (
              <Image source={{ uri: fotoPrincipal }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>Especificación del Motor</Text>
            <TextInput style={styles.input} placeholder="Ej: 3.5L V6 Turbo" value={motor} onChangeText={setMotor} />

            <Text style={styles.label}>Estética Exterior</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={esteticaExterior} onValueChange={(val: string) => setEsteticaExterior(val)}>
                <Picker.Item label="10/10 (Como Nuevo)" value="10/10" />
                <Picker.Item label="9/10 (Excelente)" value="9/10" />
                <Picker.Item label="8/10 (Bueno)" value="8/10" />
                <Picker.Item label="7/10 (Detalles)" value="7/10" />
              </Picker>
            </View>

            <Text style={styles.label}>Estética Interior</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={esteticaInterior} onValueChange={(val: string) => setEsteticaInterior(val)}>
                <Picker.Item label="10/10 (Como Nuevo)" value="10/10" />
                <Picker.Item label="9/10 (Excelente)" value="9/10" />
                <Picker.Item label="8/10 (Bueno)" value="8/10" />
                <Picker.Item label="7/10 (Detalles)" value="7/10" />
              </Picker>
            </View>

            <Text style={styles.label}>Observaciones</Text>
            <TextInput style={[styles.input, { height: 70 }]} multiline placeholder="Detalles de carrocería..." value={observaciones} onChangeText={setObservaciones} />

            <TouchableOpacity style={styles.nextBtn} onPress={() => setPaso(3)}>
              <Text style={styles.btnText}>Siguiente: Datos del Dueño ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 3 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 3: Datos del Dueño Original</Text>
            <Text style={styles.label}>Cédula del Dueño</Text>
            <TextInput style={styles.input} placeholder="Ej: 2200123456" keyboardType="numeric" value={cedulaDueno} onChangeText={setCedulaDueno} />

            <Text style={styles.label}>Nombres y Apellidos</Text>
            <TextInput style={styles.input} placeholder="Ej: Juan Carlos Pérez" value={nombreDueno} onChangeText={setNombreDueno} />

            <Text style={styles.label}>Teléfono de Contacto</Text>
            <TextInput style={styles.input} placeholder="Ej: 0991234567" keyboardType="phone-pad" value={telefonoDueno} onChangeText={setTelefonoDueno} />

            <TouchableOpacity style={styles.nextBtn} onPress={() => setPaso(4)}>
              <Text style={styles.btnText}>Siguiente: Datos Financieros ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 4 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 4: Compra y Deudas (Informativo)</Text>
            <Text style={styles.label}>Fecha de Compra</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={fechaCompra} onChangeText={setFechaCompra} />

            <Text style={styles.label}>Precio de Compra ($) *</Text>
            <TextInput style={styles.input} placeholder="Ej: 42000" keyboardType="decimal-pad" value={precioCompra} onChangeText={setPrecioCompra} />

            <Text style={styles.label}>Número de Traspasos</Text>
            <TextInput style={styles.input} placeholder="Ej: 2" keyboardType="numeric" value={numeroTraspasos} onChangeText={setNumeroTraspasos} />

            <Text style={styles.label}>Deuda SRI ($)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={sri} onChangeText={setSri} />

            <Text style={styles.label}>Deuda Coopaire ($)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={coopaire} onChangeText={setCoopaire} />

            <Text style={styles.label}>Deuda ANT ($)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={ant} onChangeText={setAnt} />

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Total Adeudado (Informativo):</Text>
              <Text style={styles.infoAmount}>${totalAdeudadoCalculado.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setPaso(5)}>
              <Text style={styles.btnText}>Siguiente: Aportes ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 5 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 5: Aportes de Socios</Text>
            <Text style={styles.label}>Aporte Raúl ($)</Text>
            <TextInput style={styles.input} placeholder="Ej: 21000" keyboardType="decimal-pad" value={aporteRaul} onChangeText={setAporteRaul} />

            <Text style={styles.label}>Aporte Héctor ($)</Text>
            <TextInput style={styles.input} placeholder="Ej: 21000" keyboardType="decimal-pad" value={aporteHector} onChangeText={setAporteHector} />

            <TouchableOpacity style={styles.saveBtn} onPress={guardar}>
              <Text style={styles.btnText}>Finalizar y Guardar Registro</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 ¡Registro Exitoso!</Text>
            <Text style={styles.modalSub}>Resumen del vehículo ingresado:</Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>• Placa: {placa}</Text>
              <Text style={styles.summaryText}>• Vehículo: {marca} {modelo}</Text>
              <Text style={styles.summaryText}>• Tipo: {tipoVehiculo}</Text>
              <Text style={styles.summaryText}>• Precio Compra: ${precioCompra}</Text>
              <Text style={styles.summaryText}>• Total Deudas: ${totalAdeudadoCalculado.toFixed(2)}</Text>
              <Text style={styles.summaryText}>• Aporte Raúl: ${aporteRaul || '0'}</Text>
              <Text style={styles.summaryText}>• Aporte Héctor: ${aporteHector || '0'}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setModalVisible(false);
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.btnText}>Aceptar y Volver al Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  backBtn: { fontSize: 16, color: '#6B21A8', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, color: '#111827' },
  progressRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 10, gap: 6 },
  progressStep: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  progressStepActive: { backgroundColor: '#6B21A8' },
  form: { padding: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#6B21A8', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 15 },
  pickerBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden' },
  imagePickerBtn: { backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#D8B4FE', borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginVertical: 6 },
  imagePickerText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 15 },
  previewImage: { width: '100%', height: 160, borderRadius: 12, marginVertical: 8 },
  infoCard: { backgroundColor: '#F3E8FF', padding: 15, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#D8B4FE' },
  infoTitle: { color: '#6B21A8', fontWeight: '600', fontSize: 13 },
  infoAmount: { color: '#6B21A8', fontWeight: 'bold', fontSize: 22, marginTop: 4 },
  nextBtn: { backgroundColor: '#6B21A8', padding: 16, borderRadius: 12, marginTop: 25 },
  saveBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 12, marginTop: 25 },
  btnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 5 },
  summaryBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginVertical: 15 },
  summaryText: { fontSize: 14, color: '#374151', marginBottom: 6 },
  modalBtn: { backgroundColor: '#6B21A8', padding: 14, borderRadius: 12 },
});