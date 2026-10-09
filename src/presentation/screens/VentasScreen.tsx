import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
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
import { ObtenerVentasUseCase } from '../../domain/usecases/ObtenerVehiculosUseCase';
import { API_BASE_URL } from '../../shared/constants/api';

const vehiculoRepo = new VehiculoRepositoryImpl();
const obtenerVentasUseCase = new ObtenerVentasUseCase(vehiculoRepo);
const FALLBACK_IMAGE = require('../../../assets/images/icon.png');

const resolveVehicleImage = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  if (url.startsWith('file://')) return null;
  return `${API_BASE_URL}/uploads/${url}`;
};

export default function VentasScreen() {
  const [ventas, setVentas] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Vehiculo | null>(null);

  // Estados de Búsqueda y Filtro Dinámico
  const [busqueda, setBusqueda] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('TODAS');
  const [mostrarDropdownMarcas, setMostrarDropdownMarcas] = useState(false);

  const cargarVentas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerVentasUseCase.execute();
      setVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar el historial de ventas y liquidaciones:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarVentas();
    }, [cargarVentas])
  );

  // Extraer únicamente las marcas que existen en los vehículos vendidos en la BD
  const marcasDisponibles = useMemo(() => {
    const marcasSet = new Set<string>();
    ventas.forEach((v) => {
      if (v.marca && v.marca.trim() !== '') {
        marcasSet.add(v.marca.trim().toUpperCase());
      }
    });
    return ['TODAS', ...Array.from(marcasSet)];
  }, [ventas]);

  // Filtrado dinámico por texto de búsqueda y por marca seleccionada
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto =
        !q ||
        (venta.placa && venta.placa.toLowerCase().includes(q)) ||
        (venta.marca && venta.marca.toLowerCase().includes(q)) ||
        (venta.modelo && venta.modelo.toLowerCase().includes(q)) ||
        (venta.anio && String(venta.anio).includes(q));

      const coincideMarca =
        marcaSeleccionada === 'TODAS' ||
        (venta.marca && venta.marca.trim().toUpperCase() === marcaSeleccionada);

      return coincideTexto && coincideMarca;
    });
  }, [ventas, busqueda, marcaSeleccionada]);

  const totalGanancias = useMemo(
    () => ventas.reduce((acumulado, venta) => acumulado + Number(venta.gananciaNeta ?? venta.ganancia_neta ?? 0), 0),
    [ventas]
  );

  const detalleActiva = useMemo(() => {
    if (!ventaSeleccionada) return null;

    const precioCompra = Number(ventaSeleccionada.precioCompra ?? 0);
    const precioVenta = Number(ventaSeleccionada.precioVenta || ventaSeleccionada.precio_venta || 0);
    const totalGastos = Number(ventaSeleccionada.totalGastos || 0);
    const gananciaNeta = Number(ventaSeleccionada.gananciaNeta ?? ventaSeleccionada.ganancia_neta ?? 0);

    const aporteRaul = Number(ventaSeleccionada.aporteRaul ?? 0);
    const aporteHector = Number(ventaSeleccionada.aporteHector ?? 0);
    const gastosRaul = Number(ventaSeleccionada.gastosRaul ?? (totalGastos / 2));
    const gastosHector = Number(ventaSeleccionada.gastosHector ?? (totalGastos / 2));
    const gananciaRaul = Number(ventaSeleccionada.gananciaRaul ?? (gananciaNeta / 2));
    const gananciaHector = Number(ventaSeleccionada.gananciaHector ?? (gananciaNeta / 2));

    const totalRaul = Number(
      ventaSeleccionada.totalRaul ??
      ventaSeleccionada.liquidacionRaul ??
      ventaSeleccionada.liquidacion_raul ??
      (aporteRaul + gastosRaul + gananciaRaul)
    );
    const totalHector = Number(
      ventaSeleccionada.totalHector ??
      ventaSeleccionada.liquidacionHector ??
      ventaSeleccionada.liquidacion_hector ??
      (aporteHector + gastosHector + gananciaHector)
    );

    return {
      precioCompra,
      precioVenta,
      totalGastos,
      gananciaNeta,
      aporteRaul,
      aporteHector,
      gastosRaul,
      gastosHector,
      gananciaRaul,
      gananciaHector,
      totalRaul,
      totalHector,
    };
  }, [ventaSeleccionada]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ventas y liquidaciones</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Ganancia neta total</Text>
        <Text style={styles.summaryValue}>${totalGanancias.toFixed(2)}</Text>
      </View>

      {/* Buscador y Selector Desplegable de Marcas */}
      <View style={styles.filterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo o placa..."
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Desplegable Profesional de Marcas */}
        <TouchableOpacity
          style={styles.dropdownSelector}
          activeOpacity={0.8}
          onPress={() => setMostrarDropdownMarcas(!mostrarDropdownMarcas)}
        >
          <View style={styles.dropdownLeft}>
            <Ionicons name="filter-outline" size={18} color="#0F172A" />
            <Text style={styles.dropdownSelectedText}>
              Marca: {marcaSeleccionada === 'TODAS' ? 'Todas las marcas' : marcaSeleccionada}
            </Text>
          </View>
          <Ionicons
            name={mostrarDropdownMarcas ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={18}
            color="#0F172A"
          />
        </TouchableOpacity>

        {mostrarDropdownMarcas && (
          <View style={styles.dropdownMenu}>
            {marcasDisponibles.map((marca) => (
              <TouchableOpacity
                key={marca}
                style={[
                  styles.dropdownOption,
                  marcaSeleccionada === marca && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setMarcaSeleccionada(marca);
                  setMostrarDropdownMarcas(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    marcaSeleccionada === marca && styles.dropdownOptionTextActive,
                  ]}
                >
                  {marca === 'TODAS' ? 'Todas las marcas' : marca}
                </Text>
                {marcaSeleccionada === marca && (
                  <Ionicons name="checkmark-sharp" size={16} color="#0F172A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.emptyText}>Cargando ventas...</Text>
        </View>
      ) : ventasFiltradas.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cash-outline" size={32} color="#94A3B8" />
          <Text style={styles.emptyText}>No se encontraron vehículos vendidos con este filtro.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {ventasFiltradas.map((venta) => {
            const foto = resolveVehicleImage(venta.fotoPrincipal || venta.foto_principal);
            const fechaVenta = venta.fechaVenta || 'Sin fecha';
            const precioVenta = Number(venta.precioVenta || venta.precio_venta || 0);
            const gananciaNeta = Number(venta.gananciaNeta ?? venta.ganancia_neta ?? 0);

            return (
              <TouchableOpacity
                key={`${venta.placa}-${venta.modelo}`}
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => setVentaSeleccionada(venta)}
              >
                <Image
                  source={foto ? { uri: foto } : FALLBACK_IMAGE}
                  style={styles.image}
                  resizeMode="cover"
                  defaultSource={FALLBACK_IMAGE}
                />

                <View style={styles.body}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.placa}>{venta.placa}</Text>
                    <Text style={styles.estado}>VENDIDO</Text>
                  </View>

                  <Text style={styles.model}>{venta.marca} {venta.modelo}</Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText}>{fechaVenta}</Text>
                  </View>

                  <View style={styles.valueRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="cash-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
                      <Text style={styles.valueLabel}>Venta</Text>
                    </View>
                    <Text style={styles.valueAmount}>${precioVenta.toFixed(2)}</Text>
                  </View>

                  <View style={styles.valueRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="trending-up-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={[styles.valueLabel, { color: '#059669' }]}>Ganancia</Text>
                    </View>
                    <Text style={[styles.valueAmount, { color: '#059669' }]}>${gananciaNeta.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.detailButton}
                    onPress={() => setVentaSeleccionada(venta)}
                  >
                    <Text style={styles.detailButtonText}>Ver detalle de liquidación {'>'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Modal de Liquidación */}
      <Modal
        visible={Boolean(ventaSeleccionada)}
        transparent
        animationType="slide"
        onRequestClose={() => setVentaSeleccionada(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setVentaSeleccionada(null)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Detalle de liquidación</Text>
                <Text style={styles.modalSubtitle}>
                  {ventaSeleccionada?.placa} • {ventaSeleccionada?.marca} {ventaSeleccionada?.modelo}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setVentaSeleccionada(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ventaSeleccionada && (
                <View style={styles.vehicleHeaderCard}>
                  <Image
                    source={
                      resolveVehicleImage(ventaSeleccionada.fotoPrincipal || ventaSeleccionada.foto_principal)
                        ? { uri: resolveVehicleImage(ventaSeleccionada.fotoPrincipal || ventaSeleccionada.foto_principal)! }
                        : FALLBACK_IMAGE
                    }
                    style={styles.modalVehicleImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalVehicleInfo}>
                    <Text style={styles.modalVehicleTitle}>
                      {ventaSeleccionada.marca} {ventaSeleccionada.modelo}
                    </Text>
                    <Text style={styles.modalVehiclePlaca}>{ventaSeleccionada.placa}</Text>
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="car-outline" size={14} color="#64748B" />
                      <Text style={styles.modalMetaText}>{ventaSeleccionada.tipo_vehiculo || 'Auto'}</Text>
                    </View>
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" />
                      <Text style={styles.modalMetaText}>Venta: {ventaSeleccionada.fechaVenta || 'Sin fecha'}</Text>
                    </View>
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="cart-outline" size={14} color="#64748B" />
                      <Text style={styles.modalMetaText}>
                        Precio Compra: ${Number(ventaSeleccionada.precioCompra ?? 0).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="build-outline" size={14} color="#64748B" />
                      <Text style={styles.modalMetaText}>
                        Gastos Realizados: ${Number(ventaSeleccionada.totalGastos || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {detalleActiva && (
                <>
                  <View style={styles.resumenCard}>
                    <Text style={styles.resumenTitle}>Resumen</Text>
                    <View style={styles.resumenRow}>
                      <Text style={styles.resumenLabel}>Precio de venta</Text>
                      <Text style={styles.resumenValue}>${detalleActiva.precioVenta.toFixed(2)}</Text>
                    </View>
                    <View style={styles.resumenRow}>
                      <Text style={styles.resumenLabel}>Ganancia neta total</Text>
                      <Text style={styles.resumenValue}>${detalleActiva.gananciaNeta.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSocioSection}>
                    <View style={styles.socioHeader}>
                      <Ionicons name="person-outline" size={18} color="#7C2D12" />
                      <Text style={styles.modalSocioName}>Raúl</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Aporte inicial</Text>
                      <Text style={styles.modalValue}>${detalleActiva.aporteRaul.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Gastos cubiertos</Text>
                      <Text style={styles.modalValue}>${detalleActiva.gastosRaul.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Ganancia (50%)</Text>
                      <Text style={styles.modalValue}>${detalleActiva.gananciaRaul.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalTotalBox}>
                      <Text style={styles.modalTotalLabel}>TOTAL A RECIBIR</Text>
                      <Text style={styles.modalTotalValue}>${detalleActiva.totalRaul.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSocioSection}>
                    <View style={styles.socioHeader}>
                      <Ionicons name="person-outline" size={18} color="#7C2D12" />
                      <Text style={styles.modalSocioName}>Héctor</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Aporte inicial</Text>
                      <Text style={styles.modalValue}>${detalleActiva.aporteHector.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Gastos cubiertos</Text>
                      <Text style={styles.modalValue}>${detalleActiva.gastosHector.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Ganancia (50%)</Text>
                      <Text style={styles.modalValue}>${detalleActiva.gananciaHector.toFixed(2)}</Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalTotalBox}>
                      <Text style={styles.modalTotalLabel}>TOTAL A RECIBIR</Text>
                      <Text style={styles.modalTotalValue}>${detalleActiva.totalHector.toFixed(2)}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionActive: {
    backgroundColor: '#F8FAFC',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  dropdownOptionTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  body: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placa: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 15,
  },
  estado: {
    color: '#047857',
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '800',
  },
  model: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 6,
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  valueLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  valueAmount: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  detailButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  closeButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  vehicleHeaderCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  modalVehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  modalVehicleInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  modalVehicleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalVehiclePlaca: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  modalMetaText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  resumenCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  resumenTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  resumenValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
  },
  modalSocioSection: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  socioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSocioName: {
    color: '#7C2D12',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 6,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalLabel: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '600',
  },
  modalValue: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '800',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#FCD34D',
    marginVertical: 8,
  },
  modalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  modalTotalLabel: {
    color: '#7C2D12',
    fontSize: 11,
    fontWeight: '900',
  },
  modalTotalValue: {
    color: '#7C2D12',
    fontSize: 14,
    fontWeight: '900',
  },
});