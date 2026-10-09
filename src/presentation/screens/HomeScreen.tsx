import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../domain/usecases/ObtenerVehiculosUseCase';
import { API_BASE_URL } from '../../shared/constants/api';

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

const CATEGORIAS_REGISTRO = [
  { id: '1', name: 'SUV', icon: 'car-sport-outline', value: 'SUV' },
  { id: '2', name: 'Camioneta', icon: 'car-outline', value: 'Camioneta' },
  { id: '3', name: 'Camión', icon: 'bus-outline', value: 'Camión' },
  { id: '4', name: 'Auto', icon: 'car-sport', value: 'Auto' },
];

export default function HomeScreen() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Estados para Modales
  const [menuUsuarioVisible, setMenuUsuarioVisible] = useState(false);
  const [menuMetricsVisible, setMenuMetricsVisible] = useState(false);
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);

  // Estados para Filtros Avanzados
  const [filtroSocio, setFiltroSocio] = useState<'TODOS' | 'RAUL' | 'HECTOR'>('TODOS');
  const [filtroCombustible, setFiltroCombustible] = useState<string>('TODOS');
  const [precioMaximo, setPrecioMaximo] = useState<string>('');

  // Modo Oscuro Toggle
  const [modoOscuro, setModoOscuro] = useState(false);

  const [usuarioActual, setUsuarioActual] = useState({
    nombres: 'Usuario',
    apellidos: '',
    rol: '',
  });

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
      console.error('Error al leer la sesión:', error);
    }
  };

  const cargarVehiculos = async () => {
    try {
      setCargando(true);
      const data = await obtenerVehiculosUseCase.execute();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
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

  // Búsqueda inteligente (Placa, Marca, Modelo) y Filtros Avanzados
  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((item) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        (item.placa || '').toLowerCase().includes(q) ||
        (item.marca || '').toLowerCase().includes(q) ||
        (item.modelo || '').toLowerCase().includes(q);

      const aporteRaul = Number(item.aporteRaul || 0);
      const aporteHector = Number(item.aporteHector || 0);

      const coincideSocio =
        filtroSocio === 'TODOS' ||
        (filtroSocio === 'RAUL' && aporteRaul > 0) ||
        (filtroSocio === 'HECTOR' && aporteHector > 0);

      const coincideCombustible =
        filtroCombustible === 'TODOS' ||
        (item.combustible && item.combustible.toUpperCase() === filtroCombustible.toUpperCase());

      const precioCompra = Number(item.precioCompra || 0);
      const limitePrecio = precioMaximo ? Number(precioMaximo) : Infinity;
      const coincidePrecio = precioCompra <= limitePrecio;

      return coincideBusqueda && coincideSocio && coincideCombustible && coincidePrecio;
    });
  }, [vehiculos, busqueda, filtroSocio, filtroCombustible, precioMaximo]);

  // Cálculos de Métricas Ejecutivas para el Menú Hamburguesa
  const metricasResumen = useMemo(() => {
    let totalInvertidoStock = 0;
    let totalGastosStock = 0;
    let totalAporteRaulStock = 0;
    let totalAporteHectorStock = 0;

    vehiculos.forEach((v) => {
      totalInvertidoStock += Number(v.precioCompra || 0);
      totalGastosStock += Number(v.totalGastos || 0);
      totalAporteRaulStock += Number(v.aporteRaul || 0);
      totalAporteHectorStock += Number(v.aporteHector || 0);
    });

    return {
      totalInvertidoStock,
      totalGastosStock,
      totalAporteRaulStock,
      totalAporteHectorStock,
      cantidadVehiculos: vehiculos.length,
    };
  }, [vehiculos]);

  const irARegistrarConCategoria = (tipo: string) => {
    router.push({
      pathname: '/formulario-vehiculo',
      params: { tipoVehiculo: tipo },
    });
  };

  const limpiarFiltrosAvanzados = () => {
    setFiltroSocio('TODOS');
    setFiltroCombustible('TODOS');
    setPrecioMaximo('');
    setModalFiltrosVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO LIMPIO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuMetricsVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="menu-outline" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.brandBadge}>
            <Ionicons name="car-sport-outline" size={16} color="#2563EB" />
            <Text style={styles.brandBadgeText}>Órbita Rodante</Text>
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

        {/* TÍTULO SALUDO PERSONALIZADO */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainGreeting}>
            ¡Hola, {usuarioActual?.nombres ? usuarioActual.nombres.split(' ')[0] : 'Socio'}! 👋
          </Text>
          <Text style={styles.subGreeting}>Inventario de Vehículos Activos</Text>
        </View>

        {/* BÚSQUEDA Y FILTROS */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Buscar por placa, marca o modelo..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              (filtroSocio !== 'TODOS' || filtroCombustible !== 'TODOS' || precioMaximo !== '') &&
                styles.filterBtnActive,
            ]}
            onPress={() => setModalFiltrosVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ACCESOS DIRECTOS POR CATEGORÍA DE REGISTRO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registrar por Categoría</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandsScroll}
        >
          {CATEGORIAS_REGISTRO.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.brandCard}
              onPress={() => irARegistrarConCategoria(cat.value)}
              activeOpacity={0.7}
            >
              <View style={styles.brandIconBox}>
                <Ionicons name={cat.icon as any} size={22} color="#0F172A" />
              </View>
              <Text style={styles.brandName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTADO DE VEHÍCULOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehículos Disponibles ({vehiculosFiltrados.length})</Text>
          {(busqueda.length > 0 || filtroSocio !== 'TODOS' || precioMaximo !== '') && (
            <TouchableOpacity
              onPress={() => {
                setBusqueda('');
                limpiarFiltrosAvanzados();
              }}
            >
              <Text style={styles.viewAll}>Ver Todos</Text>
            </TouchableOpacity>
          )}
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
            <Text style={styles.emptyText}>No se encontraron vehículos disponibles</Text>
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

                {/* DETALLES EN CHIPS / PILLS REUTILIZABLES CON MICRO-ÍCONO */}
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
                    <Ionicons name="people-outline" size={13} color="#92400E" style={{ marginRight: 3 }} />
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

      {/* BOTÓN FLOTANTE REGISTRO (+)} */}
      {esAdminOGerencia && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/formulario-vehiculo')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* MODAL MENÚ DE HAMBURGUESA (MÉTRICAS Y RESUMEN DE SOCIOS) */}
      <Modal
        visible={menuMetricsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuMetricsVisible(false)}
      >
        <View style={styles.modalMetricsOverlay}>
          <TouchableOpacity
            style={styles.modalMetricsBackdrop}
            activeOpacity={1}
            onPress={() => setMenuMetricsVisible(false)}
          />
          <View style={styles.metricsCard}>
            <View style={styles.metricsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="stats-chart" size={20} color="#0F172A" />
                <Text style={styles.metricsTitle}>Resumen del Negocio</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuMetricsVisible(false)} style={styles.closeBtnSmall}>
                <Ionicons name="close" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* BLOQUE INVENTARIO */}
              <View style={styles.metricSection}>
                <Text style={styles.metricSectionTitle}>📊 Inventario en Stock</Text>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Autos activos</Text>
                  <Text style={styles.metricValue}>{metricasResumen.cantidadVehiculos} unidades</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Capital invertido en compras</Text>
                  <Text style={styles.metricValue}>${metricasResumen.totalInvertidoStock.toFixed(2)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Gastos acumulados en stock</Text>
                  <Text style={styles.metricValue}>${metricasResumen.totalGastosStock.toFixed(2)}</Text>
                </View>
              </View>

              {/* BLOQUE SOCIOS */}
              <View style={styles.metricSectionSocio}>
                <Text style={styles.metricSectionTitle}>🤝 Balance de Capital Activo</Text>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Aportes activos Raúl</Text>
                  <Text style={styles.metricValueSocio}>${metricasResumen.totalAporteRaulStock.toFixed(2)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Aportes activos Héctor</Text>
                  <Text style={styles.metricValueSocio}>${metricasResumen.totalAporteHectorStock.toFixed(2)}</Text>
                </View>
              </View>

              {/* ACCIÓN EXPORTAR / REPORTES */}
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => {
                  setMenuMetricsVisible(false);
                  Alert.alert('Reporte', 'Función para exportar inventario en desarrollo.');
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#FFF" />
                <Text style={styles.reportBtnText}>Generar Reporte de Inventario</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL FILTROS AVANZADOS */}
      <Modal
        visible={modalFiltrosVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalFiltrosVisible(false)}
      >
        <View style={styles.modalFiltrosOverlay}>
          <View style={styles.filtrosCard}>
            <Text style={styles.filtrosTitle}>Filtros Avanzados</Text>

            {/* FILTRO SOCIO */}
            <Text style={styles.filtroLabel}>Socio Inversionista:</Text>
            <View style={styles.socioFilterRow}>
              {(['TODOS', 'RAUL', 'HECTOR'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.socioFilterOption, filtroSocio === s && styles.socioFilterOptionActive]}
                  onPress={() => setFiltroSocio(s)}
                >
                  <Text style={[styles.socioFilterText, filtroSocio === s && styles.socioFilterTextActive]}>
                    {s === 'TODOS' ? 'Todos' : s === 'RAUL' ? 'Raúl' : 'Héctor'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PRECIO MÁXIMO */}
            <Text style={styles.filtroLabel}>Precio Compra Máximo ($):</Text>
            <TextInput
              style={styles.precioInput}
              placeholder="Ej: 15000"
              keyboardType="numeric"
              value={precioMaximo}
              onChangeText={setPrecioMaximo}
            />

            <View style={styles.filtrosActions}>
              <TouchableOpacity style={styles.btnLimpiar} onPress={limpiarFiltrosAvanzados}>
                <Text style={styles.btnLimpiarText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAplicar} onPress={() => setModalFiltrosVisible(false)}>
                <Text style={styles.btnAplicarText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL USUARIO ENRIQUECIDO */}
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
                    {`${usuarioActual?.nombres || ''} ${usuarioActual?.apellidos || ''}`.trim()}
                  </Text>
                  <Text style={styles.menuUsuarioSub}>
                    {esAdmin ? 'Administrador' : usuarioActual?.rol || 'Gerencia'}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                {/* MODO OSCURO SWITCH */}
                <View style={styles.menuOptionRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="moon-outline" size={18} color="#0F172A" />
                    <Text style={styles.menuOptionText}>Modo Oscuro</Text>
                  </View>
                  <Switch
                    value={modoOscuro}
                    onValueChange={setModoOscuro}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                  />
                </View>

                {/* CAMBIAR CONTRASEÑA / AJUSTES */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={() => {
                    setMenuUsuarioVisible(false);
                    Alert.alert('Ajustes', 'Opción de cambio de contraseña.');
                  }}
                >
                  <Ionicons name="settings-outline" size={18} color="#0F172A" />
                  <Text style={styles.menuOptionText}>Ajustes de cuenta</Text>
                </TouchableOpacity>

                {/* VERSIÓN */}
                <View style={styles.menuOptionRow}>
                  <Ionicons name="phone-portrait-outline" size={16} color="#64748B" />
                  <Text style={styles.versionText}>v1.0.4 - Órbita Rodante</Text>
                </View>

                <View style={styles.menuDivider} />

                {/* CERRAR SESIÓN */}
                <TouchableOpacity style={styles.menuOptionBtn} onPress={confirmarCerrarSesion}>
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
    marginBottom: 12,
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
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  brandBadgeText: {
    fontWeight: '800',
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
  titleContainer: {
    marginBottom: 16,
  },
  mainGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subGreeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
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
    fontSize: 13,
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
  filterBtnActive: {
    backgroundColor: '#2563EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  viewAll: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  brandsScroll: {
    marginBottom: 20,
  },
  brandCard: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
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
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  carImageRight: {
    width: 105,
    height: 82,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#059669',
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
    fontSize: 13,
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
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
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
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  menuOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  menuOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cerrarSesionText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  modalMetricsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalMetricsBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '75%',
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  closeBtnSmall: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  metricSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  metricSectionSocio: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 14,
  },
  metricSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  metricValueSocio: {
    fontSize: 12,
    color: '#7C2D12',
    fontWeight: '800',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  modalFiltrosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filtrosCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    elevation: 6,
  },
  filtrosTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  filtroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  socioFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  socioFilterOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socioFilterOptionActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  socioFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  socioFilterTextActive: {
    color: '#FFFFFF',
  },
  precioInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 18,
  },
  filtrosActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnLimpiar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  btnLimpiarText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  btnAplicar: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  btnAplicarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});