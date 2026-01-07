# Documentacion de KPIs - Dashboard Financiero

## Indicadores Principales

### 1. Ventas Totales
- **Que mide**: Suma total del importe de todas las ventas realizadas en el periodo seleccionado.
- **Calculo**: `SUM(ventaTotal)` de todas las ventas en el rango de fechas.
- **Interpretacion**:
  - Indica el volumen de facturacion bruta del negocio.
  - Un aumento sostenido indica crecimiento en las operaciones.
  - Comparar con periodos anteriores para identificar estacionalidad.

### 2. Compras Totales
- **Que mide**: Total invertido en compras a proveedores durante el periodo.
- **Calculo**: `SUM(costoTotal)` de todas las compras en el rango de fechas.
- **Interpretacion**:
  - Un aumento puede indicar reposicion de stock o incorporacion de nuevos productos.
  - Debe correlacionarse con las ventas; si crece sin incremento de ventas, revisar la estrategia de compras.
  - Ideal: mantener un ratio compras/ventas estable.

### 3. Ganancia Bruta
- **Que mide**: La utilidad obtenida despues de descontar el Costo de Mercaderia Vendida (CMV).
- **Calculo**: `Ventas Totales - CMV`
  - El CMV se calcula usando el metodo de **Costo Promedio Ponderado**:
    - Cada vez que se realiza una compra, se recalcula el costo promedio del producto.
    - Al vender, se asigna el costo promedio vigente al momento de la venta.
- **Interpretacion**:
  - Representa la utilidad antes de gastos operativos (alquiler, sueldos, servicios).
  - Una ganancia bruta positiva es requisito minimo para la viabilidad del negocio.
  - Margen negativo indica que se vende por debajo del costo.

### 4. Margen Bruto (%)
- **Que mide**: Porcentaje de ganancia sobre el total de ventas.
- **Calculo**: `(Ganancia Bruta / Ventas Totales) * 100`
- **Interpretacion**:
  - **25-40%**: Margen sano para retail general.
  - **40-60%**: Excelente, tipico de productos de alto valor agregado.
  - **< 20%**: Revisar precios o buscar proveedores mas competitivos.
  - **Negativo**: Urgente revisar estrategia de precios.

### 5. Ticket Promedio
- **Que mide**: Valor promedio de cada operacion de venta.
- **Calculo**: `Ventas Totales / Cantidad de Ventas`
- **Interpretacion**:
  - Aumentar el ticket promedio mejora la rentabilidad sin necesitar mas clientes.
  - Estrategias: venta cruzada, combos, productos premium.
  - Comparar por tipo de cliente o forma de pago.

### 6. Unidades Vendidas
- **Que mide**: Cantidad total de productos vendidos en el periodo.
- **Calculo**: `SUM(unidades)` de todas las ventas.
- **Interpretacion**:
  - Mide el volumen de operaciones independiente del valor monetario.
  - Util para planificar reposicion de stock.
  - Comparar con unidades compradas para detectar desequilibrios.

---

## Indicadores de Inventario

### Rotacion de Inventario
- **Que mide**: Cuantas veces se renueva el stock en un periodo (anualizado).
- **Calculo**: `(CMV del periodo * 365 / dias del periodo) / Inventario Promedio Valorizado`
- **Interpretacion**:
  - **>= 4 veces/año**: Excelente, stock se mueve rapidamente.
  - **2-4 veces/año**: Aceptable, hay margen de mejora.
  - **< 2 veces/año**: Stock estancado, revisar productos de baja rotacion.

### Dias de Inventario
- **Que mide**: Cuantos dias en promedio tarda en venderse el stock actual.
- **Calculo**: `365 / Rotacion` o `(Inventario Promedio * dias del periodo) / CMV`
- **Interpretacion**:
  - **<= 90 dias**: Optimo para la mayoria de los rubros.
  - **90-180 dias**: Aceptable, monitorear.
  - **> 180 dias**: Riesgo de obsolescencia, capital inmovilizado.

### Productos Sin Movimiento
- **Que mide**: Cantidad de productos que no tuvieron ventas en los ultimos 30 dias.
- **Calculo**: Productos con stock > 0 que no aparecen en ventas de los ultimos 30 dias.
- **Interpretacion**:
  - **0 productos**: Ideal, todo el catalogo activo.
  - **1-3 productos**: Normal, monitorear.
  - **> 3 productos**: Revisar, considerar promociones o discontinuar.

---

## Graficos y Visualizaciones

### Ventas en el Tiempo
- Muestra la evolucion diaria de las ventas.
- Permite identificar tendencias, picos y caidas.
- Util para detectar estacionalidad y planificar promociones.

### Ventas vs Costos
- Compara visualmente Ventas, CMV y Ganancia.
- Permite ver si los margenes se mantienen estables.
- Alertar si el CMV crece mas rapido que las ventas.

### Top Productos
- Ranking de productos mas vendidos (por monto o unidades).
- Identificar productos estrella del negocio.
- Enfocar esfuerzos de reposicion y promocion.

### Margen por Producto
- Tabla con margen porcentual de cada producto.
- Identificar productos de alto y bajo margen.
- Tomar decisiones de pricing.

### Ranking de Clientes
- Top 5 clientes por volumen de compra.
- Identificar clientes clave para fidelizacion.
- Alerta si un cliente representa > 30% del total.

### Dependencia de Proveedores
- Distribucion de compras por proveedor.
- Alerta si un proveedor representa > 50% de las compras.
- Diversificar para reducir riesgos.

---

## Notas sobre el Calculo del CMV

Este sistema utiliza el metodo de **Costo Promedio Ponderado** para calcular el CMV:

1. **Al registrar una compra**: Se recalcula el costo promedio del producto.
   ```
   Nuevo Costo Promedio = (Stock Actual * Costo Anterior + Unidades Compradas * Costo Nuevo) / (Stock Actual + Unidades Compradas)
   ```

2. **Al registrar una venta**: Se asigna el costo promedio vigente.
   ```
   Costo Asignado = Unidades Vendidas * Costo Promedio Actual
   ```

Este metodo es mas simple que FIFO/LIFO y es ampliamente aceptado contablemente.

---

## Periodos de Comparacion

- Todos los KPIs incluyen variacion porcentual vs el periodo anterior equivalente.
- Ejemplo: Si seleccionas "Ultimos 30 dias", la comparacion es contra los 30 dias previos.
- Variacion positiva (verde): mejora.
- Variacion negativa (rojo): empeoramiento.
