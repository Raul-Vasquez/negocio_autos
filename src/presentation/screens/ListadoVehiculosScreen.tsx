import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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
const TIPOS_VEHICULOS = ['SUV', 'Camioneta', 'Camión', 'Auto'];

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
        (vehiculo.modelo || '').toLowerCase().includes(criterio);

      return coincideTipo && coincideBusqueda;
    });
  }, [busqueda, tipoSeleccionado, vehiculos]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Listado de vehículos</Text>
        <TouchableOpacity onPress={() => { setBusqueda(''); setTipoSeleccionado(null); }}>
          <Text style={styles.link}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por placa, marca o modelo"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {TIPOS_VEHICULOS.map((tipo) => {
          const activo = tipoSeleccionado === tipo;
          return (
            <TouchableOpacity
              key={tipo}
              style={[styles.filterChip, activo && styles.filterChipActive]}
              onPress={() => setTipoSeleccionado(activo ? null : tipo)}
            >
              <Text style={[styles.filterText, activo && styles.filterTextActive]}>{tipo}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.emptyText}>Cargando inventario...</Text>
        </View>
      ) : vehiculosFiltrados.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="car-outline" size={32} color="#94A3B8" />
          <Text style={styles.emptyText}>No hay vehículos disponibles con ese filtro.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {vehiculosFiltrados.map((vehiculo) => {
            const foto = resolveVehicleImage(vehiculo.fotoPrincipal || vehiculo.foto_principal);
            const tipo = (vehiculo.tipoVehiculo || vehiculo.tipo_vehiculo || 'Camioneta').trim();

            return (
              <View key={`${vehiculo.placa}-${vehiculo.modelo}`} style={styles.card}>
                <Image
                  source={foto ? { uri: foto } : FALLBACK_IMAGE}
                  style={styles.image}
                  resizeMode="cover"
                  defaultSource={FALLBACK_IMAGE}
                />

                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.placa}>{vehiculo.placa}</Text>
                      <Text style={styles.model}>{vehiculo.marca} {vehiculo.modelo}</Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{tipo}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText}>{vehiculo.anio || 'N/A'}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="cash-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText}>Compra: ${Number(vehiculo.precioCompra || 0).toFixed(2)}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText}>{vehiculo.nombreDueno || vehiculo.cedulaDueno || 'Sin dueño registrado'}</Text>
                  </View>
                </View>
              </View>
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
    paddingTop: 18,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  link: {
    color: '#2563EB',
    fontWeight: '700',
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
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#0F172A',
    fontSize: 14,
  },
  filters: {
    marginTop: 16,
    maxHeight: 52,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingRight: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  image: {
    width: 104,
    height: 104,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placa: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  model: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    marginLeft: 7,
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
});
