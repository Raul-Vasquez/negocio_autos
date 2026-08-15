import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import VehiculoRepositoryImpl from '../../src/data/repositories/VehiculoRepositoryImpl';
import { Vehiculo } from '../../src/domain/entities/Vehiculo';
import ObtenerVehiculosUseCase from '../../src/domain/usecases/ObtenerVehiculosUseCase';

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

  useEffect(() => {
    cargarVehiculos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
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

        {/* Título */}
        <Text style={styles.mainTitle}>Gestion de Inventario de Orbita Rodante</Text>

        {/* Buscador */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Find your car"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Marcas */}
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

        {/* Lista de Autos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Listado</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Ver Todo</Text></TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#1F2937" style={{ marginTop: 20 }} />
        ) : (
          vehiculos.map((item, index) => (
            <View key={item.id?.toString() || index.toString()} style={styles.carCard}>
              {item.fotoPrincipal ? (
                <Image source={{ uri: item.fotoPrincipal }} style={styles.carImage} resizeMode="contain" />
              ) : (
                <View style={[styles.carImage, styles.noImage]}>
                  <Ionicons name="car-outline" size={40} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{item.marca} {item.modelo}</Text>
                <Text style={styles.carPrice}>${item.precioCompra} <Text style={styles.perDay}>/Day</Text></Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
                <TouchableOpacity style={styles.rentBtn}>
                  <Text style={styles.rentBtnText}>Ver detalle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botón Flotante para ir al Formulario */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/formulario-vehiculo')}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  carCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  carImage: { width: 120, height: 90, borderRadius: 12 },
  noImage: { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  carInfo: { flex: 1, marginLeft: 16 },
  carName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  carPrice: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginVertical: 4 },
  perDay: { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { fontSize: 12, color: '#4B5563' },
  rentBtn: { backgroundColor: '#111827', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start' },
  rentBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});