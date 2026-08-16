import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/*
|--------------------------------------------------------------------------
| IMPORTACIONES DE ARQUITECTURA (DATA Y DOMINIO)
|--------------------------------------------------------------------------
*/
import VehiculoRepositoryImpl from '../../src/data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../src/domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../src/domain/usecases/ObtenerVehiculosUseCase';

const vehiculoRepo = new VehiculoRepositoryImpl();
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(vehiculoRepo);

/*
|--------------------------------------------------------------------------
| CATEGORÍAS / MARCAS DE VEHÍCULOS
|--------------------------------------------------------------------------
*/
const BRANDS = [
  { id: '1', name: 'SUV', icon: 'car-sport' },
  { id: '2', name: 'Camioneta', icon: 'car' },
  { id: '3', name: 'Camion', icon: 'flash' },
  { id: '4', name: 'Auto', icon: 'car-outline' },
];

export default function HomeScreen() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | CARGA DE VEHÍCULOS DESDE EL USE CASE
  |--------------------------------------------------------------------------
  */
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

  /*
  | Recarga la lista cada vez que la pantalla pasa a estar enfocada
  */
  useFocusEffect(
    useCallback(() => {
      cargarVehiculos();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ENCABEZADO DE LA APLICACIÓN */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#1F2937" />
            <Text style={styles.locationText}>Orellana, EC</Text>
            <Ionicons name="chevron-down" size={16} color="#1F2937" />
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#6B21A8" />
          </View>
        </View>

        {/* TÍTULO PRINCIPAL */}
        <Text style={styles.mainTitle}>Gestion de Inventario de Orbita Rodante</Text>

        {/* BARRA DE BÚSQUEDA Y FILTRO */}
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

        {/* CATEGORÍAS / TIPO DE VEHÍCULO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias de Vehiculos</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Ver Todo</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
          {BRANDS.map((brand) => (
            <TouchableOpacity key={brand.id} style={styles.brandCard}>
              <View style={styles.brandIconBox}>
                <Ionicons name={brand.icon as any} size={24} color="#1F2937" />
              </View>
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECCIÓN LISTADO DE VEHÍCULOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Listado</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Ver Todo</Text></TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#1F2937" style={{ marginTop: 20 }} />
        ) : (
          vehiculos.map((item: any, index) => (
            <View key={item.placa || index.toString()} style={styles.cardContainer}>
              
              {/* FILA SUPERIOR: INFORMACIÓN PRINCIPAL Y FOTO DERECHA */}
              <View style={styles.cardTopRow}>
                <View style={styles.infoLeft}>
                  <Text style={styles.carTitle} numberOfLines={1}>
                    {item.marca} {item.modelo} {item.anio ? `(${item.anio})` : ''}
                  </Text>
                  
                  {/* BADGE DE PLACA */}
                  <View style={styles.placaBadge}>
                    <Text style={styles.placaText}>{item.placa || 'SIN PLACA'}</Text>
                  </View>

                  {/* PRECIO DE COMPRA */}
                  <Text style={styles.priceText}>
                    ${item.precioCompra ? Number(item.precioCompra).toLocaleString() : '0.00'}
                  </Text>
                  <Text style={styles.priceSubtext}>Precio Compra</Text>
                </View>

                {/* FOTO DERECHA DEL VEHÍCULO */}
                {item.fotoPrincipal ? (
                  <Image source={{ uri: item.fotoPrincipal }} style={styles.carImageRight} resizeMode="cover" />
                ) : (
                  <View style={[styles.carImageRight, styles.noImage]}>
                    <Ionicons name="car-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* BARRA INTERMEDIA: DETALLES RÁPIDOS Y APORTES DE SOCIOS */}
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>{item.combustible || 'N/A'}</Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.detailText}>{item.color || 'N/A'}</Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.detailTextBold}>
                  R: ${item.aporteRaul || 0} / H: ${item.aporteHector || 0}
                </Text>
              </View>

              {/* FILA INFERIOR: BOTONES DE ACCIÓN */}
              <View style={styles.actionsRow}>
                {/* BOTÓN REGISTRAR GASTOS */}
                <TouchableOpacity style={styles.actionBtnOutline}>
                  <Ionicons name="add-circle-outline" size={16} color="#111827" />
                  <Text style={styles.actionBtnOutlineText}>Gastos</Text>
                </TouchableOpacity>

                {/* BOTÓN VENDER VEHÍCULO */}
                <TouchableOpacity style={styles.actionBtnGreen}>
                  <Ionicons name="cash-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnGreenText}>Vender</Text>
                </TouchableOpacity>

                {/* BOTÓN VER DETALLE COMPLETO */}
                <TouchableOpacity style={styles.actionBtnPrimary}>
                  <Text style={styles.actionBtnPrimaryText}>Ver detalle</Text>
                </TouchableOpacity>
              </View>

            </View>
          ))
        )}
      </ScrollView>

      {/* BOTÓN FLOTANTE PARA INGRESAR NUEVO VEHÍCULO */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/formulario-vehiculo')}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| ESTILOS DE LA PANTALLA Y TARJETAS
|--------------------------------------------------------------------------
*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ccd6e0' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontWeight: '600', color: '#1F2937' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', width: '80%', marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, gap: 8, height: 50 },
  searchInput: { flex: 1, color: '#1F2937' },
  filterBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  viewAll: { color: '#9CA3AF', fontSize: 14 },
  brandsScroll: { marginBottom: 24 },
  brandCard: { alignItems: 'center', marginRight: 16 },
  brandIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  brandName: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  
  /* ESTILOS DE LA TARJETA DE VEHÍCULO */
  cardContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLeft: { flex: 1, marginRight: 12 },
  carTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  placaBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginVertical: 6 },
  placaText: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  priceSubtext: { fontSize: 11, color: '#9CA3AF' },
  carImageRight: { width: 110, height: 85, borderRadius: 14 },
  noImage: { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  
  /* BARRA INTERMEDIA DE DETALLES */
  detailsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginVertical: 12, gap: 6 },
  detailText: { fontSize: 12, color: '#6B7280' },
  detailTextBold: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  divider: { color: '#D1D5DB', fontSize: 12 },

  /* BOTONES DE ACCIÓN DE LA TARJETA */
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 8, borderRadius: 12 },
  actionBtnOutlineText: { fontSize: 12, fontWeight: '600', color: '#271d11' },
  actionBtnGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#16A34A', paddingVertical: 8, borderRadius: 12 },
  actionBtnGreenText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  actionBtnPrimary: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', paddingVertical: 8, borderRadius: 12 },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});