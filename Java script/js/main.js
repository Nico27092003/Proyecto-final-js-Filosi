// Variables que se van a cargar desde JSON
let INTERES = 0;
let cuotasDisponibles = [];

// Función para cargar configuración remota
async function cargarConfig() {
  try {
    const res = await fetch("../data/config.json");
    const data = await res.json();

    INTERES = data.interes;
    cuotasDisponibles = data.cuotasDisponibles;

    // Llenar el select dinámicamente
    const select = document.getElementById("cuotas");
    select.innerHTML = "";
    cuotasDisponibles.forEach(c => {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = `${c} cuotas`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    Swal.fire("Error", "No se pudo cargar la configuración", "error");
  }
}

// Función para calcular total a pagar
function calcularPrestamo(monto, cuotas) {
  let interesTotal = monto * INTERES;
  let total = monto + interesTotal;
  let valorCuota = total / cuotas;

  return { total, valorCuota };
}

// Mostrar resultados en el DOM con SweetAlert2
function mostrarResultados(nombre, monto, cuotas, total, cuotaMensual) {
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = `
    <h3>Resultado:</h3>
    <p><strong>Usuario:</strong> ${nombre}</p>
    <p><strong>Monto:</strong> $${monto}</p>
    <p><strong>Cuotas:</strong> ${cuotas}</p>
    <p><strong>Total a pagar:</strong> $${total.toFixed(2)}</p>
    <p><strong>Valor por cuota:</strong> $${cuotaMensual.toFixed(2)}</p>
  `;

  Swal.fire({
    title: "Simulación exitosa",
    text: `Préstamo calculado para ${nombre}`,
    icon: "success",
    confirmButtonText: "Aceptar"
  });
}

// Guardar en localStorage
function guardarEnHistorial(simulacion) {
  let historial = JSON.parse(localStorage.getItem("simulaciones")) || [];
  historial.push(simulacion);
  localStorage.setItem("simulaciones", JSON.stringify(historial));
}

// Mostrar historial en la web
function actualizarHistorial() {
  const historial = JSON.parse(localStorage.getItem("simulaciones")) || [];
  const historialUl = document.getElementById("historial");
  historialUl.innerHTML = "";

  historial.forEach((sim) => {
    const li = document.createElement("li");
    li.textContent = `${sim.nombre} - $${sim.monto} en ${sim.cuotas} cuotas - Total: $${sim.total.toFixed(2)} - Cuota: $${sim.valorCuota.toFixed(2)}`;
    historialUl.appendChild(li);
  });
}

// Cargar al inicio
document.addEventListener("DOMContentLoaded", async () => {
  await cargarConfig();
  actualizarHistorial();
});

// Evento de envío del formulario
document.getElementById("form-simulador").addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const monto = parseFloat(document.getElementById("monto").value);
  const cuotas = parseInt(document.getElementById("cuotas").value);

  if (!nombre || isNaN(monto) || monto <= 0 || !cuotasDisponibles.includes(cuotas)) {
    Swal.fire({
      title: "Error en los datos",
      text: "Completá todos los campos correctamente.",
      icon: "error",
      confirmButtonText: "OK"
    });
    return;
  }

  const resultado = calcularPrestamo(monto, cuotas);
  mostrarResultados(nombre, monto, cuotas, resultado.total, resultado.valorCuota);

  const simulacion = {
    nombre,
    monto,
    cuotas,
    total: resultado.total,
    valorCuota: resultado.valorCuota
  };

  guardarEnHistorial(simulacion);
  actualizarHistorial();
  this.reset();
});
