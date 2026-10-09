import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import RegistrarVentaUseCase from '../../domain/usecases/RegistrarVentaUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const registrarVentaUseCase = new RegistrarVentaUseCase(vehiculoRepo);

export default function FormularioVentaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placa?: string }>();
  const placa = params.placa || '';

  const [cedulaCliente, setCedulaCliente] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({ cedula: '', telefono: '', precio: '' });

  const limpiarError = (campo: 'cedula' | 'telefono' | 'precio') => {
    setErrores((prev) => ({ ...prev, [campo]: '' }));
  };

  const validarFormulario = () => {
    const nuevosErrores = { cedula: '', telefono: '', precio: '' };

    if (!/^\d{10}$/.test(cedulaCliente.trim())) {
      nuevosErrores.cedula = 'La cédula debe tener exactamente 10 dígitos numéricos.';
    }

    if (!/^\d{10}$/.test(telefono.trim())) {
      nuevosErrores.telefono = 'El teléfono debe tener exactamente 10 dígitos numéricos.';
    }

    const precioNormalizado = precioVenta.trim();
    const precioNumerico = Number(precioNormalizado);
    const precioValido = /^\d+(\.\d{1,2})?$/.test(precioNormalizado) && Number.isFinite(precioNumerico) && precioNumerico > 0;

    if (!precioValido) {
      nuevosErrores.precio = 'El precio de venta debe ser un número válido mayor a 0.';
    }

    setErrores(nuevosErrores);
    return !nuevosErrores.cedula && !nuevosErrores.telefono && !nuevosErrores.precio;
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
    if (!validarFormulario()) {
      return;
    }

    const precio = Number(precioVenta);

    Alert.alert(
      'Confirmar venta',
      `¿Confirmas la venta del vehículo?\n\nPrecio de compra: ${formatearMonto(precioVenta || 0)}\nGastos estimados: ${formatearMonto(0)}\nPrecio de venta: ${formatearMonto(precio)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!placa) {
                throw new Error('No se recibió la placa del vehículo.');
              }

              if (!nombreCliente.trim()) {
                throw new Error('El nombre del cliente es obligatorio.');
              }

              setCargando(true);

              await registrarVentaUseCase.execute({
                placa,
                cedula_cliente: cedulaCliente,
                nombre_cliente: nombreCliente,
                telefono: telefono || '',
                direccion: direccion || '',
                precio_venta: precio,
                fecha_venta: fechaVenta,
              });

              Alert.alert('Venta registrada', 'El vehículo pasó a estado vendido.');
              router.back();
            } catch (error: any) {
              console.error('Error al registrar la venta del vehículo:', error);
              Alert.alert('Error', error?.message || 'No se pudo registrar la venta.');
            } finally {
              setCargando(false);
            }
          },
        },
      ]
    );
  };

  const renderError = (campo: 'cedula' | 'telefono' | 'precio') => {
    if (!errores[campo]) return null;

    return (
      <View style={styles.warningRow}>
        <Ionicons name="warning-outline" size={14} color="#F59E0B" />
        <Text style={styles.warningText}>{errores[campo]}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Venta</Text>
        <Text style={styles.subtitle}>Vehículo: {placa || 'Sin placa'}</Text>

        <Text style={styles.label}>Cédula del cliente</Text>
        <TextInput
          style={[styles.input, errores.cedula ? styles.inputError : null]}
          value={cedulaCliente}
          onChangeText={(text) => {
            const soloNumeros = text.replace(/\D/g, '').slice(0, 10);
            setCedulaCliente(soloNumeros);
            limpiarError('cedula');
          }}
          keyboardType="numeric"
          placeholder="Ej: 1723456789"
          maxLength={10}
        />
        {renderError('cedula')}

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={nombreCliente}
          onChangeText={setNombreCliente}
          placeholder="Ej: Juan Pérez"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={[styles.input, errores.telefono ? styles.inputError : null]}
          value={telefono}
          onChangeText={(text) => {
            const soloNumeros = text.replace(/\D/g, '').slice(0, 10);
            setTelefono(soloNumeros);
            limpiarError('telefono');
          }}
          keyboardType="numeric"
          placeholder="Ej: 0991234567"
          maxLength={10}
        />
        {renderError('telefono')}

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ej: Avenida Napo 123"
        />

        <Text style={styles.label}>Precio de venta</Text>
        <TextInput
          style={[styles.input, errores.precio ? styles.inputError : null]}
          value={precioVenta}
          onChangeText={(text) => {
            const valor = text.replace(/[^0-9.]/g, '');
            const partes = valor.split('.');
            const limpio = partes.length > 2 ? `${partes[0]}.${partes.slice(1).join('')}` : valor;
            setPrecioVenta(limpio);
            limpiarError('precio');
          }}
          keyboardType="numeric"
          placeholder="Ej: 25000.00"
        />
        <Text style={styles.moneyPreview}>Monto confirmado: {formatearMonto(precioVenta || 0)}</Text>
        {renderError('precio')}

        <Text style={styles.label}>Fecha de venta</Text>
        <TextInput
          style={styles.input}
          value={fechaVenta}
          onChangeText={setFechaVenta}
          placeholder="YYYY-MM-DD"
        />

        <TouchableOpacity style={styles.button} onPress={confirmarGuardado} disabled={cargando}>
          <Text style={styles.buttonText}>{cargando ? 'Guardando...' : 'Registrar Venta'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#4B5563', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 12 },
  moneyPreview: {
    marginTop: 6,
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  inputError: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  warningText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    flexShrink: 1,
  },
  button: {
    marginTop: 22,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
