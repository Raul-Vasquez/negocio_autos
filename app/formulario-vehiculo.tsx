/*
|--------------------------------------------------------------------------
| CAPA DE PRESENTACIÓN: FORMULARIO WIZARD RESTRUCTURADO (5 PASOS)
|--------------------------------------------------------------------------
*/
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
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

import VehiculoRepositoryImpl from '../src/data/repositories/VehiculoRepositoryImpl';
import CrearVehiculoUseCase from '../src/domain/usecases/CrearVehiculoUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const crearVehiculoUseCase = new CrearVehiculoUseCase(vehiculoRepo);

export default function FormularioVehiculoScreen() {
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const [paso, setPaso] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para capturar y mostrar errores visuales
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  // Paso 1: Datos Principales del Vehículo
  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState((params.tipo as string) || 'Camioneta');
  const [marca, setMarca] = useState('Ford');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('Azul (incluyendo tonos marino y azul oscuro)');
  const [combustible, setCombustible] = useState('Diesel');

  // Listas completas de Marcas y Colores
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
  const [fechaObjeto, setFechaObjeto] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [precioCompra, setPrecioCompra] = useState('');
  const [numeroTraspasos, setNumeroTraspasos] = useState('');
  const [sri, setSri] = useState('0');
  const [coopaire, setCoopaire] = useState('0');
  const [ant, setAnt] = useState('0');

  // Paso 5: Aportes de Socios
  const [aporteRaul, setAporteRaul] = useState('');
  const [aporteHector, setAporteHector] = useState('');

  /*
  |--------------------------------------------------------------------------
  | HELPER: NORMALIZAR Y CONVERTIR TEXTO A NÚMERO (PUNTO Y COMA)
  |--------------------------------------------------------------------------
  */
  const normalizarNumero = (valorText: string): number => {
    if (!valorText) return 0;
    const limpio = valorText.replace(',', '.');
    return parseFloat(limpio) || 0;
  };

  // Formato estricto DD/MM/YYYY
  const obtenerFechaFormateada = (date: Date): string => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anioVal = date.getFullYear();
    return `${dia}/${mes}/${anioVal}`;
  };

  const onChangeFecha = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setMostrarDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hoy = new Date();
      if (selectedDate > hoy) {
        Alert.alert('Fecha inválida', 'La fecha de compra no puede ser posterior al día de hoy.');
        return;
      }
      setFechaObjeto(selectedDate);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CÁLCULOS MATEMÁTICOS DE DEUDAS Y APORTES
  |--------------------------------------------------------------------------
  */
  const totalAdeudadoCalculado =
    normalizarNumero(sri) + normalizarNumero(coopaire) + normalizarNumero(ant);

  const precioNum = normalizarNumero(precioCompra);
  const raulNum = normalizarNumero(aporteRaul);
  const hectorNum = normalizarNumero(aporteHector);
  const sumaAportes = raulNum + hectorNum;
  const faltanteAportes = precioNum - sumaAportes;

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

  /*
  |--------------------------------------------------------------------------
  | VALIDACIONES POR PASO CON AUTO-SCROLL
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | GUARDAR REGISTRO FINAL
  |--------------------------------------------------------------------------
  */
  const guardar = async () => {
    if (!validarPaso(5)) return;

    try {
      await crearVehiculoUseCase.execute({
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
      });

      setModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el registro.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DE NAVEGACIÓN */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (paso > 1 ? setPaso(paso - 1) : router.back())}>
          <Text style={styles.backBtn}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ingreso (Paso {paso} de 5)</Text>
      </View>

      {/* BARRA DE PROGRESO */}
      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[styles.progressStep, paso >= item && styles.progressStepActive]}
          />
        ))}
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.form}>
        {/* PASO 1: DATOS PRINCIPALES */}
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

        {/* PASO 2: INSPECCIÓN Y FOTO */}
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

        {/* PASO 3: DATOS DEL DUEÑO ORIGINAL */}
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

        {/* PASO 4: COMPRA Y DEUDAS */}
        {paso === 4 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 4: Compra y Deudas (Informativo)</Text>
            
            <Text style={styles.label}>Fecha de Compra (DD/MM/YYYY)</Text>
            <TouchableOpacity 
              style={styles.datePickerInput} 
              onPress={() => setMostrarDatePicker(true)}
            >
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
            {errores.precioCompra && <Text style={styles.errorText}>⚠️ {errores.precioCompra}</Text>}

            <Text style={styles.label}>Número de Traspasos</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2"
              keyboardType="numeric"
              value={numeroTraspasos}
              onChangeText={setNumeroTraspasos}
            />

            <Text style={styles.label}>Deuda SRI ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={sri}
              onChangeText={setSri}
            />

            <Text style={styles.label}>Deuda Coopaire ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={coopaire}
              onChangeText={setCoopaire}
            />

            <Text style={styles.label}>Deuda ANT ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={ant}
              onChangeText={setAnt}
            />

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Total Adeudado (Informativo):</Text>
              <Text style={styles.infoAmount}>${totalAdeudadoCalculado.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => cambiarPaso(5)}>
              <Text style={styles.btnText}>Siguiente: Aportes ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PASO 5: APORTES DE SOCIOS */}
        {paso === 5 && (
          <View>
            <Text style={styles.sectionHeader}>Paso 5: Aportes de Socios</Text>

            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeTitle}>Precio de Compra Registrado:</Text>
              <Text style={styles.summaryBadgePrice}>${precioNum.toFixed(2)}</Text>
            </View>

            <Text style={styles.label}>Aporte Raúl ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 20000.00"
              keyboardType="decimal-pad"
              value={aporteRaul}
              onChangeText={(txt) => {
                setAporteRaul(txt);
                setErrores((prev) => ({ ...prev, aportes: '' }));
              }}
            />

            <Text style={styles.label}>Aporte Héctor ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5000.00"
              keyboardType="decimal-pad"
              value={aporteHector}
              onChangeText={(txt) => {
                setAporteHector(txt);
                setErrores((prev) => ({ ...prev, aportes: '' }));
              }}
            />

            {/* ALERTA VISUAL DE APORTES FALTANTES O EXCEDIDOS */}
            {faltanteAportes > 0 && (
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  ⚠️ Faltan <Text style={styles.boldText}>${faltanteAportes.toFixed(2)}</Text> por asignar para completar el precio de compra.
                </Text>
              </View>
            )}

            {faltanteAportes < 0 && (
              <View style={styles.errorCard}>
                <Text style={styles.errorCardText}>
                  🚫 Te has excedido por <Text style={styles.boldText}>${Math.abs(faltanteAportes).toFixed(2)}</Text> del precio de compra.
                </Text>
              </View>
            )}

            {faltanteAportes === 0 && precioNum > 0 && (
              <View style={styles.successCard}>
                <Text style={styles.successCardText}>
                  ✅ Los aportes coinciden exactamente con el precio de compra.
                </Text>
              </View>
            )}

            {errores.aportes && <Text style={styles.errorText}>⚠️ {errores.aportes}</Text>}

            <TouchableOpacity style={styles.saveBtn} onPress={guardar}>
              <Text style={styles.btnText}>Finalizar y Guardar Registro</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL DE ÉXITO Y RESUMEN */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 ¡Registro Exitoso!</Text>
            <Text style={styles.modalSub}>Resumen del vehículo ingresado:</Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>• Placa: {placa}</Text>
              <Text style={styles.summaryText}>• Vehículo: {marca} {modelo}</Text>
              <Text style={styles.summaryText}>• Tipo: {tipoVehiculo}</Text>
              <Text style={styles.summaryText}>• Fecha Compra: {obtenerFechaFormateada(fechaObjeto)}</Text>
              <Text style={styles.summaryText}>• Precio Compra: ${precioNum.toFixed(2)}</Text>
              <Text style={styles.summaryText}>• Total Deudas: ${totalAdeudadoCalculado.toFixed(2)}</Text>
              <Text style={styles.summaryText}>• Aporte Raúl: ${raulNum.toFixed(2)}</Text>
              <Text style={styles.summaryText}>• Aporte Héctor: ${hectorNum.toFixed(2)}</Text>
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

/*
|--------------------------------------------------------------------------
| ESTILOS VISUALES CON ALERTAS DE ERROR
|--------------------------------------------------------------------------
*/
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
  
  /* ESTILOS DE CAMPOS CON SOPORTE DE ERRORES */
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 15 },
  inputError: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' },
  errorText: { color: '#DC2626', fontSize: 12, fontWeight: 'bold', marginTop: 4, marginLeft: 2 },
  
  pickerBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden' },
  datePickerInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, justifyContent: 'center' },
  datePickerText: { fontSize: 15, color: '#111827' },
  imagePickerBtn: { backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#D8B4FE', borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginVertical: 6 },
  imagePickerText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 15 },
  previewImage: { width: '100%', height: 160, borderRadius: 12, marginVertical: 8 },
  
  /* TARJETAS DE INFORMACIÓN Y ALERTAS */
  infoCard: { backgroundColor: '#F3E8FF', padding: 15, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#D8B4FE' },
  infoTitle: { color: '#6B21A8', fontWeight: '600', fontSize: 13 },
  infoAmount: { color: '#6B21A8', fontWeight: 'bold', fontSize: 22, marginTop: 4 },
  
  summaryBadge: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  summaryBadgeTitle: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  summaryBadgePrice: { fontSize: 20, fontWeight: 'bold', color: '#111827' },

  warningCard: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#F59E0B' },
  warningText: { color: '#B45309', fontSize: 13 },
  errorCard: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#EF4444' },
  errorCardText: { color: '#991B1B', fontSize: 13 },
  successCard: { backgroundColor: '#DCFCE7', padding: 12, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#22C55E' },
  successCardText: { color: '#15803D', fontSize: 13, fontWeight: '600' },
  boldText: { fontWeight: 'bold' },

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