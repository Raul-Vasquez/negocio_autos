/*
|--------------------------------------------------------------------------
| CAPA DE PRESENTACIÓN: FORMULARIO WIZARD RESTRUCTURADO (5 PASOS)
|--------------------------------------------------------------------------
*/
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import CrearVehiculoUseCase from '../../domain/usecases/CrearVehiculoUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const crearVehiculoUseCase = new CrearVehiculoUseCase(vehiculoRepo);

export default function FormularioVehiculoScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  const [paso, setPaso] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('Camioneta');
  const [marca, setMarca] = useState('Ford');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('Azul (incluyendo tonos marino y azul oscuro)');
  const [combustible, setCombustible] = useState('Diesel');

  const listaMarcas = [
    'Ford',
    'Toyota',
    'Hino',
    'Chevrolet',
    'Nissan',
    'Kia',
    'GWM (Great Wall Motors)',
    'Hyundai',
    'Dongfeng',
    'JAC Motors',
    'Suzuki',
    'Renault',
    'Mazda',
    'Sinotruk',
  ];

  const listaColores = [
    'Gris Plomo',
    'Blanco',
    'Negro',
    'Plateado',
    'Rojo',
    'Azul (incluyendo tonos marino y azul oscuro)',
    'Crema / Beige',
    'Vino',
    'Amarillo',
    'Verde',
    'Naranja',
    'Dorado',
    'Café',
    'Celeste',
    'Cobre',
    'Morado',
  ];

  const [motor, setMotor] = useState('');
  const [esteticaExterior, setEsteticaExterior] = useState('10/10');
  const [esteticaInterior, setEsteticaInterior] = useState('10/10');
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');

  const [cedulaDueno, setCedulaDueno] = useState('');
  const [nombreDueno, setNombreDueno] = useState('');
  const [telefonoDueno, setTelefonoDueno] = useState('');

  const [fechaObjeto, setFechaObjeto] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [precioCompra, setPrecioCompra] = useState('');
  const [numeroTraspasos, setNumeroTraspasos] = useState('');
  const [sri, setSri] = useState('0');
  const [coopaire, setCoopaire] = useState('0');
  const [ant, setAnt] = useState('0');

  const [aporteRaul, setAporteRaul] = useState('');
  const [aporteHector, setAporteHector] = useState('');

  const normalizarNumero = (valorText: string): number => {
    if (!valorText) return 0;
    const limpio = valorText.replace(',', '.');
    return parseFloat(limpio) || 0;
  };

  const obtenerFechaFormateada = (date: Date): string => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anioVal = date.getFullYear();
    return `${dia}/${mes}/${anioVal}`;
  };

  const onChangeFecha = (event: DateTimePickerEvent, selectedDate?: Date) => {
    try {
      setMostrarDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        const hoy = new Date();
        if (selectedDate > hoy) {
          Alert.alert('Fecha inválida', 'La fecha de compra no puede ser posterior al día de hoy.');
          return;
        }
        setFechaObjeto(selectedDate);
      }
    } catch (error) {
      console.error('Error al cambiar la fecha del vehículo:', error);
      Alert.alert('Error', 'No se pudo procesar la fecha seleccionada.');
    }
  };

  const totalAdeudadoCalculado = normalizarNumero(sri) + normalizarNumero(coopaire) + normalizarNumero(ant);
  const precioNum = normalizarNumero(precioCompra);
  const raulNum = normalizarNumero(aporteRaul);
  const hectorNum = normalizarNumero(aporteHector);
  const sumaAportes = raulNum + hectorNum;
  const faltanteAportes = precioNum - sumaAportes;

  const seleccionarFoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFotoPrincipal(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen del vehículo:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const validarPaso = (pasoActual: number): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (pasoActual === 1) {
      if (!placa.trim()) nuevosErrores.placa = 'La placa es requerida.';
      if (!modelo.trim()) nuevosErrores.modelo = 'El modelo es requerido.';
    }

    if (pasoActual === 3) {
      if (cedulaDueno.trim() && cedulaDueno.trim().length !== 10) {
        nuevosErrores.cedulaDueno = 'La cédula debe contener exactamente 10 dígitos.';
      }
      if (telefonoDueno.trim() && telefonoDueno.trim().length !== 10) {
        nuevosErrores.telefonoDueno = 'El teléfono debe contener exactamente 10 dígitos.';
      }
    }

    if (pasoActual === 4) {
      if (!precioCompra.trim() || precioNum <= 0) {
        nuevosErrores.precioCompra = 'Ingrese un precio de compra válido.';
      }
    }

    if (pasoActual === 5) {
      if (Math.abs(faltanteAportes) > 0.01) {
        nuevosErrores.aportes = `La suma de aportes no coincide con el precio de compra ($${precioNum.toFixed(2)}).`;
      }
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return false;
    }

    return true;
  };

  const cambiarPaso = (siguientePaso: number) => {
    if (validarPaso(paso)) {
      setPaso(siguientePaso);
    }
  };

  const formatearMonto = (valor: string | number) => {
    const numero = Number(String(valor).replace(/[^0-9.]/g, '')) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
  };

  const confirmarGuardado = () => {
    if (!validarPaso(5)) return;

    Alert.alert(
      'Confirmar registro',
      `¿Deseas guardar este vehículo?\n\nPrecio compra: ${formatearMonto(precioNum)}\nAportes Raúl: ${formatearMonto(raulNum)}\nAportes Héctor: ${formatearMonto(hectorNum)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              const payload: any = {
                placa,
                marca,
                modelo,
                tipoVehiculo,
                anio: parseInt(anio) || 2024,
                color,
                combustible,
                fechaCompra: obtenerFechaFormateada(fechaObjeto),
                precioCompra: precioNum,
                numeroTraspasos: parseInt(numeroTraspasos) || 0,
                sri: normalizarNumero(sri),
                coopaire: normalizarNumero(coopaire),
                ant: normalizarNumero(ant),
                totalAdeudado: totalAdeudadoCalculado,
                motor,
                esteticaExterior,
                esteticaInterior,
                observaciones,
                fotoPrincipal: fotoPrincipal || '',
                cedulaDueno,
                nombreDueno,
                telefonoDueno,
                aporteRaul: raulNum,
                aporteHector: hectorNum,
              };

              if (fotoPrincipal) {
                payload.foto = {
                  uri: fotoPrincipal,
                  name: `${placa || 'vehiculo'}.jpg`,
                  type: 'image/jpeg',
                };
              }

              await crearVehiculoUseCase.execute(payload);
              setModalVisible(true);
            } catch (error: any) {
              console.error('Error al guardar el vehículo:', error);
              Alert.alert('Error', error?.message || 'No se pudo guardar el registro.');
            }
          },
        },
      ]
    );
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
          <View key={item} style={[styles.progressStep, paso >= item && styles.progressStepActive]} />
        ))}
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.form}>
        {paso === 1 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 1: Datos del Vehículo</Text>

            <Text style={styles.label}>Placa del Vehículo *</Text>
            <TextInput
              style={[styles.input, errores.placa && styles.inputError]}
              placeholder="Ej: PBC-1234"
              value={placa}
              onChangeText={(txt) => {
                setPlaca(txt);
                setErrores((prev) => ({ ...prev, placa: '' }));
              }}
              autoCapitalize="characters"
            />
            {errores.placa && <Text style={styles.errorText}>⚠️ {errores.placa}</Text>}

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
                {listaMarcas.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Modelo *</Text>
            <TextInput
              style={[styles.input, errores.modelo && styles.inputError]}
              placeholder="Ej: F-150 Lariat"
              value={modelo}
              onChangeText={(txt) => {
                setModelo(txt);
                setErrores((prev) => ({ ...prev, modelo: '' }));
              }}
            />
            {errores.modelo && <Text style={styles.errorText}>⚠️ {errores.modelo}</Text>}

            <Text style={styles.label}>Año</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2023"
              keyboardType="numeric"
              value={anio}
              onChangeText={setAnio}
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={color} onValueChange={(val: string) => setColor(val)}>
                {listaColores.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
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

            <TouchableOpacity style={styles.nextBtn} onPress={() => cambiarPaso(2)}>
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
                {fotoPrincipal ? '📷 Cambiar Foto' : '🖼️ Seleccionar desde Galería / WhatsApp'}
              </Text>
            </TouchableOpacity>

            {fotoPrincipal && <Image source={{ uri: fotoPrincipal }} style={styles.previewImage} />}

            <Text style={styles.label}>Especificación del Motor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 3.5L V6 Turbo"
              value={motor}
              onChangeText={setMotor}
            />

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
            <TextInput
              style={[styles.input, { height: 70 }]}
              multiline
              placeholder="Detalles de carrocería..."
              value={observaciones}
              onChangeText={setObservaciones}
            />

            <TouchableOpacity style={styles.nextBtn} onPress={() => cambiarPaso(3)}>
              <Text style={styles.btnText}>Siguiente: Datos del Dueño ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 3 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 3: Datos del Dueño Original</Text>

            <Text style={styles.label}>Cédula del Dueño (10 dígitos)</Text>
            <TextInput
              style={[styles.input, errores.cedulaDueno && styles.inputError]}
              placeholder="Ej: 2200123456"
              keyboardType="numeric"
              maxLength={10}
              value={cedulaDueno}
              onChangeText={(txt) => {
                setCedulaDueno(txt);
                setErrores((prev) => ({ ...prev, cedulaDueno: '' }));
              }}
            />
            {errores.cedulaDueno && <Text style={styles.errorText}>⚠️ {errores.cedulaDueno}</Text>}

            <Text style={styles.label}>Nombres y Apellidos</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Carlos Pérez"
              value={nombreDueno}
              onChangeText={setNombreDueno}
            />

            <Text style={styles.label}>Teléfono de Contacto (10 dígitos)</Text>
            <TextInput
              style={[styles.input, errores.telefonoDueno && styles.inputError]}
              placeholder="Ej: 0991234567"
              keyboardType="phone-pad"
              maxLength={10}
              value={telefonoDueno}
              onChangeText={(txt) => {
                setTelefonoDueno(txt);
                setErrores((prev) => ({ ...prev, telefonoDueno: '' }));
              }}
            />
            {errores.telefonoDueno && <Text style={styles.errorText}>⚠️ {errores.telefonoDueno}</Text>}

            <TouchableOpacity style={styles.nextBtn} onPress={() => cambiarPaso(4)}>
              <Text style={styles.btnText}>Siguiente: Datos Financieros ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 4 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 4: Compra y Deudas (Informativo)</Text>

            <Text style={styles.label}>Fecha de Compra (DD/MM/YYYY)</Text>
            <TouchableOpacity style={styles.datePickerInput} onPress={() => setMostrarDatePicker(true)}>
              <Text style={styles.datePickerText}>{obtenerFechaFormateada(fechaObjeto)}</Text>
            </TouchableOpacity>

            {mostrarDatePicker && (
              <DateTimePicker
                value={fechaObjeto}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={onChangeFecha}
              />
            )}

            <Text style={styles.label}>Precio de Compra ($) *</Text>
            <TextInput
              style={[styles.input, errores.precioCompra && styles.inputError]}
              placeholder="Ej: 25000.00"
              keyboardType="decimal-pad"
              value={precioCompra}
              onChangeText={(txt) => {
                setPrecioCompra(txt);
                setErrores((prev) => ({ ...prev, precioCompra: '' }));
              }}
            />
            <Text style={styles.moneyPreview}>Monto confirmado: {formatearMonto(precioCompra || 0)}</Text>
            {errores.precioCompra && <Text style={styles.errorText}>⚠️ {errores.precioCompra}</Text>}

            <Text style={styles.label}>Número de Traspasos</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2"
              keyboardType="numeric"
              value={numeroTraspasos}
              onChangeText={setNumeroTraspasos}
            />

            <Text style={styles.label}>SRI</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={sri}
              onChangeText={setSri}
            />

            <Text style={styles.label}>Coopaire</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={coopaire}
              onChangeText={setCoopaire}
            />

            <Text style={styles.label}>ANT</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={ant}
              onChangeText={setAnt}
            />

            <TouchableOpacity style={styles.nextBtn} onPress={() => cambiarPaso(5)}>
              <Text style={styles.btnText}>Siguiente: Aportes ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 5 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 5: Aportes de Socios</Text>

            <Text style={styles.label}>Aporte Raúl ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 10000.00"
              keyboardType="decimal-pad"
              value={aporteRaul}
              onChangeText={setAporteRaul}
            />
            <Text style={styles.moneyPreview}>Monto confirmado: {formatearMonto(aporteRaul || 0)}</Text>

            <Text style={styles.label}>Aporte Héctor ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 15000.00"
              keyboardType="decimal-pad"
              value={aporteHector}
              onChangeText={setAporteHector}
            />
            <Text style={styles.moneyPreview}>Monto confirmado: {formatearMonto(aporteHector || 0)}</Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryText}>Precio compra: ${precioNum.toFixed(2)}</Text>
              <Text style={styles.summaryText}>Aportes: ${sumaAportes.toFixed(2)}</Text>
              <Text style={styles.summaryText}>Faltante: ${faltanteAportes.toFixed(2)}</Text>
              {errores.aportes && <Text style={styles.errorText}>⚠️ {errores.aportes}</Text>}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={confirmarGuardado}>
              <Text style={styles.saveBtnText}>Guardar Vehículo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Vehículo registrado</Text>
            <Text style={styles.modalText}>La información se guardó correctamente.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => {
              setModalVisible(false);
              router.back();
            }}>
              <Text style={styles.modalBtnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backBtn: { fontSize: 18, color: '#111827', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  progressRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginBottom: 16 },
  progressStep: {
    flex: 1,
    height: 6,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
  },
  progressStepActive: { backgroundColor: '#111827' },
  form: { paddingHorizontal: 18, paddingBottom: 24 },
  sectionHeader: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  inputError: { borderColor: '#DC2626' },
  moneyPreview: {
    marginTop: 6,
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: { color: '#DC2626', fontSize: 12, fontWeight: '600', marginTop: 6 },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextBtn: {
    marginTop: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  imagePickerBtn: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 6,
  },
  imagePickerText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 15 },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  datePickerText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  summaryBox: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  summaryText: { color: '#374151', fontSize: 14, marginBottom: 4 },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#4B5563', marginBottom: 16 },
  modalBtn: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
