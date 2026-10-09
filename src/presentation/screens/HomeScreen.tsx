import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../../shared/constants/api';
import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../domain/usecases/ObtenerVehiculosUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(vehiculoRepo);
const DEFAULT_VEHICLE_IMAGE = require('../../../assets/images/icon.png');

const resolveVehicleImage = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('file://')) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/uploads/${url}`;
};

const BRANDS = [
  { id: '1', name: 'SUV', icon: 'car-sport-outline' },
  { id: '2', name: 'Camioneta', icon: 'car-outline' },
  { id: '3', name: 'Camión', icon: 'bus-outline' },
  { id: '4', name: 'Auto', icon: 'car-sport' },
];

export default function HomeScreen() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const [usuarioActual, setUsuarioActual] = useState({
    nombres: 'Cargando...',
    apellidos: '',
    rol: '',
  });

  const [menuUsuarioVisible, setMenuUsuarioVisible] = useState(false);
  const [imagenesFallidas, setImagenesFallidas] = useState<Record<string, boolean>>({});

  const cargarSesionUsuario = async () => {
    try {
      const sesionGuardada = await AsyncStorage.getItem('usuarioSesion');
      if (sesionGuardada) {
        const usuarioParsed = JSON.parse(sesionGuardada);
        const rolDetectado =
          usuarioParsed.rol ||
          usuarioParsed.role ||
          usuarioParsed.id_rol ||
          usuarioParsed.rol_id ||
          'GERENCIA';

        setUsuarioActual({
          ...usuarioParsed,
          rol: String(rolDetectado).toUpperCase(),
        });
      }
    } catch (error) {
      console.log('Error al leer la sesión:', error);
    }
  };

  const cargarVehiculos = async () => {
    try {
      setCargando(true);
      const data = await obtenerVehiculosUseCase.execute();
      setVehiculos(data);
    } catch (error) {
      console.log('Error al cargar vehículos:', error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarSesionUsuario();
      cargarVehiculos();
    }, [])
  );

  const confirmarCerrarSesion = () => {
    setMenuUsuarioVisible(false);
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('usuarioSesion');
            router.replace('/login');
          },
        },
      ]
    );
  };

  const rolNormalizado = String(usuarioActual?.rol || '').toUpperCase();
  const esAdmin =
    rolNormalizado === 'ADMIN' ||
    rolNormalizado === 'ADMINISTRADOR' ||
    rolNormalizado === '1';

  const esAdminOGerencia =
    esAdmin || rolNormalizado === 'GERENCIA' || rolNormalizado === '2';

  // Filtrado optimizado por placa o categoría
  const vehiculosFiltrados = vehiculos.filter((item) => {
    const coincidePlaca = (item.placa || '').toLowerCase().includes(busqueda.toLowerCase());
    return coincidePlaca;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={15} color="#2563EB" />
            <Text style={styles.locationText}>Orellana, EC</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </View>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setMenuUsuarioVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#6366F1" />
            </View>
            <View style={styles.statusBadge} />
          </TouchableOpacity>
        </View>

        {/* TÍTULO */}
        <Text style={styles.mainTitle}>
          Gestión de Inventario Órbita Rodante
        </Text>

        {/* BÚSQUEDA */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Buscar por placa..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="characters"
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* CATEGORÍAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {categoriaSeleccionada && (
            <TouchableOpacity onPress={() => setCategoriaSeleccionada(null)}>
              <Text style={styles.viewAll}>Limpiar filtro</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandsScroll}
        >
          {BRANDS.map((brand) => {
            const esSeleccionada = categoriaSeleccionada === brand.name;
            return (
              <TouchableOpacity
                key={brand.id}
                style={[styles.brandCard, esSeleccionada && styles.brandCardSelected]}
                onPress={() => setCategoriaSeleccionada(esSeleccionada ? null : brand.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.brandIconBox, esSeleccionada && styles.brandIconBoxSelected]}>
                  <Ionicons
                    name={brand.icon as any}
                    size={22}
                    color={esSeleccionada ? '#FFFFFF' : '#0F172A'}
                  />
                </View>
                <Text style={[styles.brandName, esSeleccionada && styles.brandNameSelected]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LISTADO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehículos Disponibles</Text>
          <TouchableOpacity onPress={() => { setBusqueda(''); setCategoriaSeleccionada(null); }}>
            <Text style={styles.viewAll}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator
            size="large"
            color="#0F172A"
            style={{ marginTop: 24 }}
          />
        ) : vehiculosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No se encontraron vehículos</Text>
          </View>
        ) : (
          vehiculosFiltrados.map((item: any, index) => {
            const claveVehiculo = item.placa || `${item.marca}-${index}`;
            const fotoUrl = resolveVehicleImage(item.fotoPrincipal);
            const mostrarImagenFallback = !fotoUrl || !!imagenesFallidas[claveVehiculo];

            const precioFormateado = item.precioCompra
              ? Number(item.precioCompra).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00';

            return (
              <TouchableOpacity
                key={item.placa || index.toString()}
                style={styles.cardContainer}
                activeOpacity={0.92}
                onPress={() =>
                  router.push({
                    pathname: '/detalle-vehiculo',
                    params: { placa: item.placa || '' },
                  })
                }
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.carTitle} numberOfLines={1}>
                      {item.marca} {item.modelo}{' '}
                      {item.anio ? `(${item.anio})` : ''}
                    </Text>

                    <View style={styles.placaBadge}>
                      <Text style={styles.placaText}>
                        {item.placa || 'SIN PLACA'}
                      </Text>
                    </View>

                    <Text style={styles.priceText}>
                      ${precioFormateado}
                    </Text>
                    <Text style={styles.priceSubtext}>Precio Compra</Text>
                  </View>

                  {mostrarImagenFallback ? (
                    <Image
                      source={DEFAULT_VEHICLE_IMAGE}
                      style={styles.carImageRight}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: fotoUrl || '' }}
                      style={styles.carImageRight}
                      resizeMode="cover"
                      onError={() =>
                        setImagenesFallidas((prev) => ({
                          ...prev,
                          [claveVehiculo]: true,
                        }))
                      }
                    />
                  )}
                </View>

                {/* DETALLES EN CHIPS / PILLS REUTILIZABLES */}
                <View style={styles.detailsRow}>
                  {item.combustible && (
                    <View style={styles.chip}>
                      <Ionicons name="color-fill-outline" size={12} color="#64748B" />
                      <Text style={styles.chipText}>{item.combustible}</Text>
                    </View>
                  )}
                  {item.color && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText} numberOfLines={1}>
                        {item.color.split('(')[0].trim()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.chipHighlight}>
                    <Text style={styles.chipTextHighlight}>
                      R: ${item.aporteRaul || 0} / H:${item.aporteHector || 0}
                    </Text>
                  </View>
                </View>

                {/* ACCIONES PRINCIPALES */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() =>
                      router.push({
                        pathname: '/formulario-gasto',
                        params: { placa: item.placa || '' },
                      })
                    }
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#0F172A" />
                    <Text style={styles.actionBtnOutlineText}>+ Gastos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnGreen}
                    onPress={() =>
                      router.push({
                        pathname: '/formulario-venta',
                        params: { placa: item.placa || '' },
                      })
                    }
                  >
                    <Ionicons name="cash-outline" size={16} color="#FFF" />
                    <Text style={styles.actionBtnGreenText}>Vender</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() =>
                      router.push({
                        pathname: '/detalle-vehiculo',
                        params: { placa: item.placa || '' },
                      })
                    }
                  >
                    <Text style={styles.actionBtnPrimaryText}>Detalles</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* BOTÓN FLOTANTE (+) */}
      {esAdminOGerencia && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/formulario-vehiculo')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* MODAL USUARIO */}
      <Modal
        visible={menuUsuarioVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuUsuarioVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuUsuarioVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuCard}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuUsuarioTitle}>
                    {`${usuarioActual?.nombres || ''} ${
                      usuarioActual?.apellidos || ''
                    }`.trim()}
                  </Text>
                  <Text style={styles.menuUsuarioSub}>
                    {esAdmin
                      ? 'Administrador'
                      : usuarioActual?.rol || 'Gerencia'}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={confirmarCerrarSesion}
                >
                  <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                  <Text style={styles.cerrarSesionText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  locationText: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    width: '85%',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  viewAll: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  brandsScroll: {
    marginBottom: 20,
  },
  brandCard: {
    alignItems: 'center',
    marginRight: 12,
    width: 76,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandCardSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandIconBoxSelected: {
    backgroundColor: '#1E293B',
  },
  brandName: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  brandNameSelected: {
    color: '#FFFFFF',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLeft: {
    flex: 1,
    marginRight: 10,
  },
  carTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  placaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  carImageRight: {
    width: 110,
    height: 85,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  chipHighlight: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipTextHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionBtnGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  actionBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  emptyText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 16,
  },
  menuCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuHeader: {
    marginBottom: 4,
  },
  menuUsuarioTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuUsuarioSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  menuOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  cerrarSesionText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
});