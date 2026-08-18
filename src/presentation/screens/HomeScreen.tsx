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

// IMPORTANTE: Importación necesaria para evitar superposición con la barra de estado o notch del celular
import { SafeAreaView } from 'react-native-safe-area-context';

import VehiculoRepositoryImpl from '../../data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../domain/usecases/ObtenerVehiculosUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(vehiculoRepo);

const BRANDS = [
  { id: '1', name: 'SUV', icon: 'car-sport' },
  { id: '2', name: 'Camioneta', icon: 'car' },
  { id: '3', name: 'Camion', icon: 'flash' },
  { id: '4', name: 'Auto', icon: 'car-outline' },
];

export default function HomeScreen() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);

  const [usuarioActual, setUsuarioActual] = useState({
    nombres: 'Cargando...',
    apellidos: '',
    rol: '',
  });

  const [menuUsuarioVisible, setMenuUsuarioVisible] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#1F2937" />
            <Text style={styles.locationText}>Orellana, EC</Text>
            <Ionicons name="chevron-down" size={16} color="#1F2937" />
          </View>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setMenuUsuarioVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#6B21A8" />
            </View>
            <View style={styles.statusBadge} />
          </TouchableOpacity>
        </View>

        {/* TÍTULO */}
        <Text style={styles.mainTitle}>
          Gestion de Inventario de Orbita Rodante
        </Text>

        {/* BÚSQUEDA */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar por placa"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* CATEGORÍAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias de Vehiculos</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver Todo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandsScroll}
        >
          {BRANDS.map((brand) => (
            <TouchableOpacity key={brand.id} style={styles.brandCard}>
              <View style={styles.brandIconBox}>
                <Ionicons name={brand.icon as any} size={24} color="#1F2937" />
              </View>
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTADO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Listado</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver Todo</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator
            size="large"
            color="#1F2937"
            style={{ marginTop: 20 }}
          />
        ) : (
          vehiculos.map((item: any, index) => (
            <View
              key={item.placa || index.toString()}
              style={styles.cardContainer}
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
                    $
                    {item.precioCompra
                      ? Number(item.precioCompra).toLocaleString()
                      : '0.00'}
                  </Text>
                  <Text style={styles.priceSubtext}>Precio Compra</Text>
                </View>

                {item.fotoPrincipal ? (
                  <Image
                    source={{ uri: item.fotoPrincipal }}
                    style={styles.carImageRight}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.carImageRight, styles.noImage]}>
                    <Ionicons name="car-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                  {item.combustible || 'N/A'}
                </Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.detailText}>{item.color || 'N/A'}</Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.detailTextBold}>
                  R: ${item.aporteRaul || 0} / H: ${item.aporteHector || 0}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                {/* BOTÓN GASTOS CONECTADO CON LA NAVEGACIÓN Y LA PLACA */}
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() =>
                    router.push({
                      pathname: '/formulario-gasto',
                      params: { placa: item.placa || '' },
                    })
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color="#111827"
                  />
                  <Text style={styles.actionBtnOutlineText}>Gastos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnGreen}>
                  <Ionicons name="cash-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnGreenText}>Vender</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnPrimary}>
                  <Text style={styles.actionBtnPrimaryText}>Ver detalle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* BOTÓN FLOTANTE (+) MUESTRA PARA ADMIN Y GERENCIA */}
      {esAdminOGerencia && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/formulario-vehiculo')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
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
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                  <Text style={styles.cerrarSesionText}>Salir</Text>
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
  container: { flex: 1, backgroundColor: '#eceef0', position: 'relative' },
  scrollContent: { padding: 20 },
 header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontWeight: '600', color: '#1F2937' },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    width: '80%',
    marginBottom: 20,
  },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 8,
    height: 50,
  },
  searchInput: { flex: 1, color: '#1F2937' },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  viewAll: { color: '#9CA3AF', fontSize: 14 },
  brandsScroll: { marginBottom: 24 },
  brandCard: { alignItems: 'center', marginRight: 16 },
  brandIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLeft: { flex: 1, marginRight: 12 },
  carTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  placaBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  placaText: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  priceSubtext: { fontSize: 11, color: '#9CA3AF' },
  carImageRight: { width: 110, height: 85, borderRadius: 14 },
  noImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 12,
    gap: 6,
  },
  detailText: { fontSize: 12, color: '#6B7280' },
  detailTextBold: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  divider: { color: '#D1D5DB', fontSize: 12 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnOutlineText: { fontSize: 12, fontWeight: '600', color: '#271d11' },
  actionBtnGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnGreenText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  actionBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 20,
  },
  menuCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuHeader: { marginBottom: 6 },
  menuUsuarioTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  menuUsuarioSub: { fontSize: 12, color: '#6B7280' },
  menuDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  menuOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  cerrarSesionText: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },
});