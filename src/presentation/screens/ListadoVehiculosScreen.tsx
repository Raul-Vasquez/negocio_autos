import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../domain/usecases/ObtenerVehiculosUseCase';
import { API_BASE_URL } from '../../shared/constants/api';

const vehiculoRepo = new VehiculoRepositoryImpl();
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(vehiculoRepo);
const FALLBACK_IMAGE = require('../../../assets/images/icon.png');

const TIPOS_VEHICULOS = [
  { id: 'SUV', name: 'SUV', icon: 'car-sport-outline' },
  { id: 'Camioneta', name: 'Camioneta', icon: 'car-outline' },
  { id: 'Camión', name: 'Camión', icon: 'bus-outline' },
  { id: 'Auto', name: 'Auto', icon: 'car-sport' },
];

const normalizarTipo = (tipo?: string | null): string => {
  return (tipo || '').trim().toUpperCase();
};

const resolveVehicleImage = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  if (url.startsWith('file://')) return null;
  return `${API_BASE_URL}/uploads/${url}`;
};

export default function ListadoVehiculosScreen() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);

  const cargarVehiculos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerVehiculosUseCase.execute();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar el listado de vehículos disponibles:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarVehiculos();
    }, [cargarVehiculos])
  );

  const vehiculosFiltrados = useMemo(() => {
    const criterio = busqueda.trim().toLowerCase();

    return vehiculos.filter((vehiculo) => {
      const tipoVehiculo = normalizarTipo(vehiculo.tipoVehiculo || vehiculo.tipo_vehiculo);
      const coincideTipo = !tipoSeleccionado || tipoVehiculo === normalizarTipo(tipoSeleccionado);
      const coincideBusqueda =
        criterio.length === 0 ||
        (vehiculo.placa || '').toLowerCase().includes(criterio) ||
        (vehiculo.marca || '').toLowerCase().includes(criterio) ||
        (vehiculo.modelo || '').toLowerCase().includes(criterio) ||
        (vehiculo.nombreDueno || '').toLowerCase().includes(criterio) ||
        (vehiculo.cedulaDueno || '').toLowerCase().includes(criterio);

      return coincideTipo && coincideBusqueda;
    });
  }, [busqueda, tipoSeleccionado, vehiculos]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ENCABEZADO Y CONTADOR DE INVENTARIO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventario de Vehículos</Text>
          <Text style={styles.subtitle}>
            {vehiculosFiltrados.length} {vehiculosFiltrados.length === 1 ? 'vehículo disponible' : 'vehículos disponibles'}
          </Text>
        </View>
        {(busqueda.length > 0 || tipoSeleccionado !== null) && (
          <TouchableOpacity
            onPress={() => {
              setBusqueda('');
              setTipoSeleccionado(null);
            }}
          >
            <Text style={styles.link}>Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BARRA DE BÚSQUEDA MULTI-CAMPO */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por placa, marca, modelo o dueño..."
          placeholderTextColor="#94A3B8"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS POR CATEGORÍA CON ICONOS */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {TIPOS_VEHICULOS.map((cat) => {
            const activo = tipoSeleccionado === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, activo && styles.filterChipActive]}
                onPress={() => setTipoSeleccionado(activo ? null : cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={activo ? '#FFFFFF' : '#0F172A'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterText, activo && styles.filterTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.emptyText}>Cargando inventario...</Text>
        </View>
      ) : vehiculosFiltrados.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="car-outline" size={38} color="#94A3B8" />
          <Text style={styles.emptyText}>No hay vehículos disponibles con esos criterios.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {vehiculosFiltrados.map((vehiculo) => {
            const foto = resolveVehicleImage(vehiculo.fotoPrincipal || vehiculo.foto_principal);
            const tipo = (vehiculo.tipoVehiculo || vehiculo.tipo_vehiculo || 'Auto').trim();
            const precioCompra = Number(vehiculo.precioCompra ?? 0);

            return (
              <TouchableOpacity
                key={`${vehiculo.placa}-${vehiculo.modelo}`}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/detalle-vehiculo',
                    params: { placa: vehiculo.placa || '' },
                  })
                }
              >
                {/* LADO IZQUIERDO: FOTO TIPO BANNER VERTICAL QUE LLENA LA TARJETA */}
                <View style={styles.imageContainer}>
                  <Image
                    source={foto ? { uri: foto } : FALLBACK_IMAGE}
                    style={styles.imageBanner}
                    resizeMode="cover"
                    defaultSource={FALLBACK_IMAGE}
                  />
                  <View style={styles.badgeState}>
                    <Text style={styles.badgeStateText}>DISPONIBLE</Text>
                  </View>
                </View>

                {/* LADO DERECHO: INFORMACIÓN TÉCNICA Y FINANCIERA */}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text style={styles.carTitle} numberOfLines={1}>
                        {vehiculo.marca} {vehiculo.modelo}
                      </Text>
                      <Text style={styles.carYear}>
                        {vehiculo.anio ? `Año ${vehiculo.anio}` : 'Año N/A'}
                      </Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{tipo}</Text>
                    </View>
                  </View>

                  <View style={styles.placaRow}>
                    <View style={styles.placaChip}>
                      <Text style={styles.placaText}>{vehiculo.placa || 'SIN PLACA'}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* PRECIO Y DETALLES CON ICONOS */}
                  <View style={styles.infoRow}>
                    <Ionicons name="cart-outline" size={14} color="#2563EB" />
                    <Text style={styles.priceLabel}>Compra: </Text>
                    <Text style={styles.priceValue}>
                      ${precioCompra.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      Dueño: {vehiculo.nombreDueno || 'Sin registrar'}
                    </Text>
                  </View>

                  {/* MICRO CHIP DE CAPITAL / SOCIOS */}
                  <View style={styles.capitalChip}>
                    <Ionicons name="people-outline" size={13} color="#92400E" style={{ marginRight: 4 }} />
                    <Text style={styles.capitalText}>
                      R: ${Number(vehiculo.aporteRaul ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} / H: ${Number(vehiculo.aporteHector ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  link: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 46,
    marginTop: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#0F172A',
    fontSize: 13,
  },
  filtersWrapper: {
    marginTop: 12,
    marginBottom: 4,
  },
  filters: {
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  imageContainer: {
    width: 120,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  imageBanner: {
    width: '100%',
    height: '100%',
    minHeight: 140,
  },
  badgeState: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeStateText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  carYear: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  typeBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '700',
  },
  placaRow: {
    marginTop: 4,
  },
  placaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoText: {
    marginLeft: 5,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  capitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  capitalText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});