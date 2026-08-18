import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../shared/constants/api';

interface Gasto {
  id?: number;
  tipoGasto: string;
  registradoPor: string;
  valor: number;
  descripcion: string;
  fechaGasto: string;
}

interface VehiculoDetalle {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  precioCompra: number;
  propietarioAnterior?: string;
  cedulaPropietario?: string;
  telefonoPropietario?: string;
  fotoUrl?: string;
}

interface Props {
  placa: string;
}

export default function DetalleVehiculoScreen({ placa }: Props) {
  const router = useRouter();

  const [vehiculo, setVehiculo] = useState<VehiculoDetalle | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarDatos = async () => {
    if (!placa) return;
    try {
      setCargando(true);

      // 1. Obtener datos del vehículo
      const resVehiculo = await fetch(`${API_BASE_URL}/api/vehiculos/${placa}`);
      if (resVehiculo.ok) {
        const dataVehiculo = await resVehiculo.json();
        setVehiculo(dataVehiculo);
      }

      // 2. Obtener lista de gastos por placa
      const resGastos = await fetch(`${API_BASE_URL}/api/gastos/${placa}`);
      if (resGastos.ok) {
        const dataGastos = await resGastos.json();
        setGastos(Array.isArray(dataGastos) ? dataGastos : []);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los detalles del vehículo.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [placa]);

  const totalGastos = gastos.reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const inversionTotal = Number(vehiculo?.precioCompra || 0) + totalGastos;

  if (cargando && !refrescando) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.textoCargando}>Cargando información del vehículo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargarDatos();
            }}
          />
        }
      >
        {/* Encabezado / Hero Banner */}
        <View style={styles.heroCard}>
          {vehiculo?.fotoUrl ? (
            <Image source={{ uri: vehiculo.fotoUrl }} style={styles.fotoVehiculo} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Ionicons name="car-sport" size={64} color="#94A3B8" />
            </View>
          )}
          <View style={styles.badgePlaca}>
            <Text style={styles.textoBadgePlaca}>{vehiculo?.placa || placa}</Text>
          </View>
          <Text style={styles.tituloVehiculo}>
            {vehiculo?.marca || 'Vehículo'} {vehiculo?.modelo || ''}
          </Text>
          <Text style={styles.subtituloVehiculo}>
            Año {vehiculo?.anio || 'N/A'} • Color {vehiculo?.color || 'N/A'}
          </Text>
        </View>

        {/* Balance Financiero */}
        <Text style={styles.seccionTitulo}>Resumen Financiero</Text>
        <View style={styles.gridFinanciero}>
          <View style={[styles.cardFinanciera, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="cart" size={22} color="#2563EB" />
            <Text style={styles.labelFinanciero}>Precio Compra</Text>
            <Text style={[styles.montoFinanciero, { color: '#1E40AF' }]}>
              ${Number(vehiculo?.precioCompra || 0).toFixed(2)}
            </Text>
          </View>

          <View style={[styles.cardFinanciera, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="receipt" size={22} color="#DC2626" />
            <Text style={styles.labelFinanciero}>Total Gastos</Text>
            <Text style={[styles.montoFinanciero, { color: '#991B1B' }]}>
              ${totalGastos.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.cardInversionTotal}>
          <View>
            <Text style={styles.labelInversion}>Inversión Total Actualizada</Text>
            <Text style={styles.montoInversion}>${inversionTotal.toFixed(2)}</Text>
          </View>
          <Ionicons name="trending-up" size={32} color="#10B981" />
        </View>

        {/* Propietario Anterior */}
        {vehiculo?.propietarioAnterior && (
          <>
            <Text style={styles.seccionTitulo}>Dueño Anterior</Text>
            <View style={styles.cardInfo}>
              <View style={styles.filaInfo}>
                <Ionicons name="person" size={18} color="#64748B" />
                <Text style={styles.textoInfo}>Nombre: {vehiculo.propietarioAnterior}</Text>
              </View>
              {vehiculo.cedulaPropietario && (
                <View style={styles.filaInfo}>
                  <Ionicons name="card" size={18} color="#64748B" />
                  <Text style={styles.textoInfo}>Cédula: {vehiculo.cedulaPropietario}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Lista de Gastos */}
        <View style={styles.headerGastos}>
          <Text style={styles.seccionTitulo}>Historial de Gastos ({gastos.length})</Text>
        </View>

        {gastos.length === 0 ? (
          <View style={styles.cardVacia}>
            <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
            <Text style={styles.textoVacio}>No hay gastos registrados para este vehículo.</Text>
          </View>
        ) : (
          gastos.map((item, index) => (
            <View key={item.id || index} style={styles.cardGasto}>
              <View style={styles.iconoGasto}>
                <Ionicons name="cash-outline" size={20} color="#0284C7" />
              </View>
              <View style={styles.infoGasto}>
                <Text style={styles.tipoGasto}>{item.tipoGasto}</Text>
                <Text style={styles.descGasto}>{item.descripcion}</Text>
                <Text style={styles.metaGasto}>
                  Pagado por: {item.registradoPor} • {item.fechaGasto}
                </Text>
              </View>
              <Text style={styles.montoGasto}>-${Number(item.valor).toFixed(2)}</Text>
            </View>
          ))
        )}

        {/* Botón Principal Flotante/Footer */}
        <TouchableOpacity
          style={styles.botonGasto}
          onPress={() =>
            router.push({
              pathname: '/formulario-gasto',
              params: { placa: vehiculo?.placa || placa },
            })
          }
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.textoBotonGasto}>Registrar Nuevo Gasto</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  textoCargando: { marginTop: 10, color: '#64748B', fontSize: 14 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fotoVehiculo: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  fotoPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgePlaca: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  textoBadgePlaca: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  tituloVehiculo: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtituloVehiculo: { fontSize: 13, color: '#64748B', marginTop: 2 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, marginTop: 10 },
  gridFinanciero: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardFinanciera: { flex: 1, padding: 14, borderRadius: 12, gap: 4 },
  labelFinanciero: { fontSize: 12, color: '#475569', fontWeight: '500' },
  montoFinanciero: { fontSize: 18, fontWeight: 'bold' },
  cardInversionTotal: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  labelInversion: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  montoInversion: { color: '#10B981', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  filaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoInfo: { fontSize: 14, color: '#334155' },
  headerGastos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardVacia: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  textoVacio: { color: '#64748B', marginTop: 8, fontSize: 13 },
  cardGasto: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconoGasto: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoGasto: { flex: 1 },
  tipoGasto: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  descGasto: { fontSize: 12, color: '#475569', marginVertical: 1 },
  metaGasto: { fontSize: 11, color: '#94A3B8' },
  montoGasto: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
  botonGasto: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  },
  textoBotonGasto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});