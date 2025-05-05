class Matriz {
    constructor(filas, columnas) {
        if (!Number.isInteger(filas) || !Number.isInteger(columnas) || filas <= 0 || columnas <= 0) {
            throw new Error("Las dimensiones deben ser enteros positivos");
        }
        
        this.filas = filas;
        this.columnas = columnas;
        this.matriz = this._crearMatrizVacia();
    }

    // Crea una matriz llena de ceros
    _crearMatrizVacia() {
        return Array.from({length: this.filas}, () => 
            Array.from({length: this.columnas}, () => 0)
        );
    }

    // Llena la matriz desde un array bidimensional
    llenarDesdeArray(valores) {
        if (!Array.isArray(valores)) {
            throw new Error("Debe proporcionar un array bidimensional");
        }
        
        if (valores.length !== this.filas || valores[0].length !== this.columnas) {
            throw new Error("Las dimensiones del array no coinciden con la matriz");
        }
        
        this.matriz = valores.map(fila => [...fila]);
    }

    // Suma esta matriz con otra
    sumar(otraMatriz) {
        if (!(otraMatriz instanceof Matriz)) {
            throw new Error("Debe proporcionar una instancia de Matriz");
        }
        
        if (this.filas !== otraMatriz.filas || this.columnas !== otraMatriz.columnas) {
            throw new Error("Las matrices deben tener las mismas dimensiones para sumarse");
        }
        
        const resultado = new Matriz(this.filas, this.columnas);
        
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                resultado.matriz[i][j] = this.matriz[i][j] + otraMatriz.matriz[i][j];
            }
        }
        
        return resultado;
    }

    // Multiplica esta matriz por otra
    multiplicar(otraMatriz) {
        if (!(otraMatriz instanceof Matriz)) {
            throw new Error("Debe proporcionar una instancia de Matriz");
        }
        
        if (this.columnas !== otraMatriz.filas) {
            throw new Error("El número de columnas de la primera matriz debe coincidir con el número de filas de la segunda");
        }
        
        const resultado = new Matriz(this.filas, otraMatriz.columnas);
        
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < otraMatriz.columnas; j++) {
                let suma = 0;
                for (let k = 0; k < this.columnas; k++) {
                    suma += this.matriz[i][k] * otraMatriz.matriz[k][j];
                }
                resultado.matriz[i][j] = suma;
            }
        }
        
        return resultado;
    }

    // Calcula el determinante (para matrices de cualquier tamaño)
    calcularDeterminante() {
        if (this.filas !== this.columnas) {
            throw new Error("La matriz debe ser cuadrada para calcular el determinante");
        }
        
        // Caso base para matriz 1x1
        if (this.filas === 1) return this.matriz[0][0];
        
        // Caso para matriz 2x2
        if (this.filas === 2) {
            return this.matriz[0][0] * this.matriz[1][1] - this.matriz[0][1] * this.matriz[1][0];
        }
        
        // Caso para matriz 3x3 (Regla de Sarrus)
        if (this.filas === 3) {
            const [a, b, c] = this.matriz[0];
            const [d, e, f] = this.matriz[1];
            const [g, h, i] = this.matriz[2];
            
            return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
        }
        
        // Para matrices grandes, usar eliminación gaussiana (más eficiente)
        if (this.filas > 10) {
            return this._calcularDeterminanteGauss();
        }
        
        // Para matrices medianas, usar expansión por cofactores
        let det = 0;
        for (let j = 0; j < this.columnas; j++) {
            det += this.matriz[0][j] * this._calcularCofactor(0, j);
        }
        
        return det;
    }

    // Método para calcular determinante mediante eliminación gaussiana
    // Más eficiente para matrices grandes
    _calcularDeterminanteGauss() {
        // Crear una copia de la matriz para no modificar la original
        const matrizTemp = this.matriz.map(fila => [...fila]);
        let det = 1;
        
        // Eliminación gaussiana
        for (let i = 0; i < this.filas; i++) {
            // Si el pivote es cero, buscar una fila no cero para intercambiar
            if (Math.abs(matrizTemp[i][i]) < 1e-10) {
                let pivotRow = -1;
                
                // Buscar fila con elemento no cero en la columna i
                for (let j = i + 1; j < this.filas; j++) {
                    if (Math.abs(matrizTemp[j][i]) > 1e-10) {
                        pivotRow = j;
                        break;
                    }
                }
                
                // Si no se encuentra una fila no cero, el determinante es cero
                if (pivotRow === -1) return 0;
                
                // Intercambiar filas
                [matrizTemp[i], matrizTemp[pivotRow]] = [matrizTemp[pivotRow], matrizTemp[i]];
                
                // Cambiar el signo del determinante al intercambiar filas
                det *= -1;
            }
            
            // Actualizar el determinante con el pivote
            det *= matrizTemp[i][i];
            
            // Reducir las filas debajo
            for (let j = i + 1; j < this.filas; j++) {
                const factor = matrizTemp[j][i] / matrizTemp[i][i];
                
                for (let k = i; k < this.columnas; k++) {
                    matrizTemp[j][k] -= factor * matrizTemp[i][k];
                }
            }
        }
        
        return det;
    }

    // Método auxiliar para calcular cofactores
    _calcularCofactor(fila, columna) {
        const submatriz = new Matriz(this.filas - 1, this.columnas - 1);
        let subi = 0;
        
        for (let i = 0; i < this.filas; i++) {
            if (i === fila) continue;
            
            let subj = 0;
            for (let j = 0; j < this.columnas; j++) {
                if (j === columna) continue;
                
                submatriz.matriz[subi][subj] = this.matriz[i][j];
                subj++;
            }
            subi++;
        }
        
        const signo = (fila + columna) % 2 === 0 ? 1 : -1;
        return signo * submatriz.calcularDeterminante();
    }

    // Calcula la matriz inversa (solo para matrices cuadradas invertibles)
    calcularInversa() {
        if (this.filas !== this.columnas) {
            throw new Error("La matriz debe ser cuadrada para calcular la inversa");
        }
        
        // Para matrices muy grandes, advertir sobre el rendimiento
        if (this.filas > 15) {
            console.warn("El cálculo de la inversa para matrices grandes puede llevar mucho tiempo");
        }
        
        const det = this.calcularDeterminante();
        if (Math.abs(det) < 1e-10) {
            throw new Error("La matriz no tiene inversa (determinante = 0)");
        }
        
        // Caso especial para matriz 2x2
        if (this.filas === 2) {
            const [[a, b], [c, d]] = this.matriz;
            const inversa = new Matriz(2, 2);
            
            inversa.matriz = [
                [d/det, -b/det],
                [-c/det, a/det]
            ];
            
            return inversa;
        }
        
        // Para matrices grandes, usar el método de Gauss-Jordan
        if (this.filas > 10) {
            return this._calcularInversaGaussJordan();
        }
        
        // Método general para matrices medianas (usando matriz adjunta)
        const cofactores = new Matriz(this.filas, this.columnas);
        
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                cofactores.matriz[i][j] = this._calcularCofactor(i, j);
            }
        }
        
        // Transponer la matriz de cofactores para obtener la adjunta
        const adjunta = cofactores.transponer();
        
        // Multiplicar cada elemento por 1/det
        const inversa = new Matriz(this.filas, this.columnas);
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                inversa.matriz[i][j] = adjunta.matriz[i][j] / det;
            }
        }
        
        return inversa;
    }
    
    // Calcula la inversa mediante el método de Gauss-Jordan
    // Más eficiente para matrices grandes
    _calcularInversaGaussJordan() {
        const n = this.filas;
        
        // Crear matriz aumentada [A|I]
        const aumentada = new Array(n);
        for (let i = 0; i < n; i++) {
            aumentada[i] = new Array(2 * n);
            
            // Copiar la matriz original
            for (let j = 0; j < n; j++) {
                aumentada[i][j] = this.matriz[i][j];
            }
            
            // Añadir la matriz identidad
            for (let j = n; j < 2 * n; j++) {
                aumentada[i][j] = (j - n === i) ? 1 : 0;
            }
        }
        
        // Aplicar eliminación de Gauss-Jordan
        for (let i = 0; i < n; i++) {
            // Encontrar pivote máximo en la columna actual
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(aumentada[j][i]) > Math.abs(aumentada[maxRow][i])) {
                    maxRow = j;
                }
            }
            
            // Intercambiar filas si es necesario
            if (maxRow !== i) {
                [aumentada[i], aumentada[maxRow]] = [aumentada[maxRow], aumentada[i]];
            }
            
            // Comprobar si el pivote es cero
            if (Math.abs(aumentada[i][i]) < 1e-10) {
                throw new Error("La matriz no tiene inversa");
            }
            
            // Escalar la fila para que el pivote sea 1
            const pivote = aumentada[i][i];
            for (let j = i; j < 2 * n; j++) {
                aumentada[i][j] /= pivote;
            }
            
            // Reducir las otras filas
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = aumentada[j][i];
                    for (let k = i; k < 2 * n; k++) {
                        aumentada[j][k] -= factor * aumentada[i][k];
                    }
                }
            }
        }
        
        // Extraer la parte derecha (matriz inversa)
        const inversa = new Matriz(n, n);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                inversa.matriz[i][j] = aumentada[i][j + n];
            }
        }
        
        return inversa;
    }

    // Devuelve la matriz transpuesta
    transponer() {
        const resultado = new Matriz(this.columnas, this.filas);
        
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                resultado.matriz[j][i] = this.matriz[i][j];
            }
        }
        
        return resultado;
    }

    // Resuelve un sistema de ecuaciones (matriz aumentada [A|B])
    resolverSistema() {
        if (this.columnas !== this.filas + 1) {
            throw new Error("La matriz debe ser aumentada (n filas × n+1 columnas)");
        }
        
        // Para matrices muy grandes, usar Gauss-Jordan directamente
        if (this.filas > 10) {
            return this._resolverSistemaGaussJordan();
        }
        
        // Método para matrices pequeñas y medianas: Por matriz inversa (A⁻¹·B)
        try {
            const A = new Matriz(this.filas, this.filas);
            const B = new Matriz(this.filas, 1);
            
            // Separar la matriz de coeficientes y términos independientes
            for (let i = 0; i < this.filas; i++) {
                for (let j = 0; j < this.filas; j++) {
                    A.matriz[i][j] = this.matriz[i][j];
                }
                B.matriz[i][0] = this.matriz[i][this.filas]; // Última columna
            }
            
            const AInversa = A.calcularInversa();
            const X = AInversa.multiplicar(B);
            
            // Convertir el resultado a un array simple
            return X.matriz.map(fila => fila[0]);
            
        } catch (error) {
            throw new Error(`No se pudo resolver por inversa: ${error.message}`);
        }
    }
    
    // Resuelve un sistema de ecuaciones usando Gauss-Jordan directamente
    _resolverSistemaGaussJordan() {
        const n = this.filas;
        const aumentada = this.matriz.map(fila => [...fila]);
        
        // Eliminación hacia adelante
        for (let i = 0; i < n; i++) {
            // Buscar el pivote máximo
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(aumentada[j][i]) > Math.abs(aumentada[maxRow][i])) {
                    maxRow = j;
                }
            }
            
            // Intercambiar filas si es necesario
            if (maxRow !== i) {
                [aumentada[i], aumentada[maxRow]] = [aumentada[maxRow], aumentada[i]];
            }
            
            // Si el pivote es cero, el sistema puede no tener solución única
            if (Math.abs(aumentada[i][i]) < 1e-10) {
                continue; // Intentar con el siguiente pivote
            }
            
            // Escalar la fila para que el pivote sea 1
            const pivote = aumentada[i][i];
            for (let j = i; j <= n; j++) {
                aumentada[i][j] /= pivote;
            }
            
            // Reducir las otras filas
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = aumentada[j][i];
                    for (let k = i; k <= n; k++) {
                        aumentada[j][k] -= factor * aumentada[i][k];
                    }
                }
            }
        }
        
        // Verificar si hay filas inconsistentes (0 = no cero)
        for (let i = 0; i < n; i++) {
            let esFilaCero = true;
            for (let j = 0; j < n; j++) {
                if (Math.abs(aumentada[i][j]) > 1e-10) {
                    esFilaCero = false;
                    break;
                }
            }
            
            if (esFilaCero && Math.abs(aumentada[i][n]) > 1e-10) {
                throw new Error("El sistema no tiene solución");
            }
        }
        
        // Extraer la solución
        const solucion = new Array(n);
        for (let i = 0; i < n; i++) {
            solucion[i] = aumentada[i][n];
        }
        
        return solucion;
    }

    // Método estático para crear matriz desde array
    static desdeArray(arr) {
        if (!Array.isArray(arr)) {
            throw new Error("Debe proporcionar un array");
        }
        
        const filas = arr.length;
        const columnas = arr[0].length;
        
        const matriz = new Matriz(filas, columnas);
        matriz.llenarDesdeArray(arr);
        
        return matriz;
    }
}

// Funciones adicionales (métodos estáticos)
Matriz.resolverSistema2x2 = function(matriz) {
    const sistema = Matriz.desdeArray(matriz);
    return sistema.resolverSistema();
};

Matriz.resolverSistema3x3 = function(matriz) {
    const sistema = Matriz.desdeArray(matriz);
    return sistema.resolverSistema();
};

// Función actualizada para obtener la matriz desde los inputs
function obtenerMatrizDesdeInputs() {
    // Utilizamos el tamaño de matriz que se muestra actualmente
    const inputs = document.querySelectorAll('#matrizInputs input[type="number"]');
    if (inputs.length === 0) {
        throw new Error("No se ha creado una matriz válida");
    }
    
    // Determinamos el tamaño de la matriz basado en los inputs visibles
    const tamano = Math.sqrt(inputs.length);
    if (!Number.isInteger(tamano)) {
        throw new Error("La matriz no es cuadrada");
    }
    
    const valores = [];
    for (let i = 0; i < tamano; i++) {
        valores[i] = [];
        for (let j = 0; j < tamano; j++) {
            const input = document.getElementById(`valor-${i}-${j}`);
            if (!input) {
                throw new Error(`No se encontró el input para la posición ${i+1},${j+1}`);
            }
            const valor = parseFloat(input.value);
            if (isNaN(valor)) {
                throw new Error(`El valor en la posición ${i+1},${j+1} no es un número válido`);
            }
            valores[i][j] = valor;
        }
    }
    
    return valores;
}

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const btn2x2 = document.getElementById('btn2x2');
    const btn3x3 = document.getElementById('btn3x3');
    const matrizContainer = document.getElementById('matrizContainer');
    const matrizInputs = document.getElementById('matrizInputs');
    const btnDeterminante = document.getElementById('btnDeterminante');
    const btnInversa = document.getElementById('btnInversa');
    const resultado = document.getElementById('resultado');
    
    // Event listeners para los botones de tamaño de matriz
    btn2x2.addEventListener('click', function() {
        crearMatriz(2);
    });
    
    btn3x3.addEventListener('click', function() {
        crearMatriz(3);
    });
    
    // Event listeners para los botones de operaciones
    btnDeterminante.addEventListener('click', function() {
        calcularDeterminante();
    });
    
    btnInversa.addEventListener('click', function() {
        calcularInversa();
    });
    
    // Función para crear la matriz según el tamaño seleccionado
    function crearMatriz(tamano) {
        matrizContainer.style.display = 'block';
        matrizInputs.innerHTML = '';
        
        const tabla = document.createElement('table');
        
        for (let i = 0; i < tamano; i++) {
            const fila = document.createElement('tr');
            
            for (let j = 0; j < tamano; j++) {
                const celda = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.step = 'any'; // Permite decimales
                input.id = `valor-${i}-${j}`;
                input.value = '0';
                celda.appendChild(input);
                fila.appendChild(celda);
            }
            
            tabla.appendChild(fila);
        }
        
        matrizInputs.appendChild(tabla);
        resultado.style.display = 'none'; // Ocultar resultados previos
    }
});

// Función para crear una gráfica de dispersión (opcional)
function crearGraficaDispersion(matriz, titulo) {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está disponible para crear la gráfica');
        return;
    }
    
    const canvas = document.getElementById('graficaDispersion');
    if (!canvas) {
        console.warn('No se encontró el elemento canvas para la gráfica');
        return;
    }
    
    // Convertir la matriz a un formato adecuado para la gráfica
    const datos = [];
    for (let i = 0; i < matriz.length; i++) {
        for (let j = 0; j < matriz[i].length; j++) {
            datos.push({
                x: j,
                y: i,
                r: Math.abs(matriz[i][j]) * 5, // Tamaño proporcional al valor absoluto
                valor: matriz[i][j]
            });
        }
    }
    
    // Crear o actualizar la gráfica
    if (window.matrizChart) {
        window.matrizChart.destroy();
    }
    
    window.matrizChart = new Chart(canvas, {
        type: 'bubble',
        data: {
            datasets: [{
                label: titulo,
                data: datos,
                backgroundColor: function(context) {
                    const value = context.raw.valor;
                    return value >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)';
                }
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -0.5,
                    max: matriz[0].length - 0.5,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Columna'
                    }
                },
                y: {
                    min: -0.5,
                    max: matriz.length - 0.5,
                    ticks: {
                        stepSize: 1,
                        reverse: true
                    },
                    title: {
                        display: true,
                        text: 'Fila'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Valor: ${context.raw.valor}`;
                        }
                    }
                }
            }
        }
    });
}
// Función para calcular el determinante
function calcularDeterminante(matrizId) {
    try {
        const valores = obtenerMatrizDesdeInputs(matrizId);
        const matriz = Matriz.desdeArray(valores);
        const determinante = matriz.calcularDeterminante();
        
        mostrarResultado(`El determinante de la matriz ${matrizId.endsWith('A') ? 'A' : 'B'} es: <span class="resultado-numero">${determinante.toFixed(4)}</span>`);
    } catch (error) {
        mostrarError(`Error al calcular determinante: ${error.message}`);
    }
}

// Función para calcular la inversa
function calcularInversa(matrizId) {
    try {
        const valores = obtenerMatrizDesdeInputs(matrizId);
        const matriz = Matriz.desdeArray(valores);
        const inversa = matriz.calcularInversa();
        
        // Formatear la matriz inversa para mostrarla
        let html = `<p>La matriz inversa de ${matrizId.endsWith('A') ? 'A' : 'B'} es:</p>`;
        html += formatearMatrizHTML(inversa.matriz);
        
        mostrarResultado(html);
        
        // Opcional: visualizar la matriz como gráfica
        crearGraficaDispersion(inversa.matriz, `Matriz Inversa de ${matrizId.endsWith('A') ? 'A' : 'B'}`);
    } catch (error) {
        mostrarError(`Error al calcular inversa: ${error.message}`);
    }
}

// Función para calcular la transpuesta
function calcularTraspuesta(matrizId) {
    try {
        const valores = obtenerMatrizDesdeInputs(matrizId);
        const matriz = Matriz.desdeArray(valores);
        const transpuesta = matriz.transponer();
        
        // Formatear la matriz transpuesta para mostrarla
        let html = `<p>La matriz transpuesta de ${matrizId.endsWith('A') ? 'A' : 'B'} es:</p>`;
        html += formatearMatrizHTML(transpuesta.matriz);
        
        mostrarResultado(html);
    } catch (error) {
        mostrarError(`Error al calcular transpuesta: ${error.message}`);
    }
}

// Función para multiplicar matrices
function multiplicarMatrices() {
    try {
        const valoresA = obtenerMatrizDesdeInputs('matrizInputsA');
        const valoresB = obtenerMatrizDesdeInputs('matrizInputsB');
        
        const matrizA = Matriz.desdeArray(valoresA);
        const matrizB = Matriz.desdeArray(valoresB);
        
        const resultado = matrizA.multiplicar(matrizB);
        
        // Formatear la matriz resultante para mostrarla
        let html = '<p>El resultado de A × B es:</p>';
        html += formatearMatrizHTML(resultado.matriz);
        
        mostrarResultado(html);
    } catch (error) {
        mostrarError(`Error al multiplicar matrices: ${error.message}`);
    }
}

// Función para sumar matrices
function sumarMatrices() {
    try {
        const valoresA = obtenerMatrizDesdeInputs('matrizInputsA');
        const valoresB = obtenerMatrizDesdeInputs('matrizInputsB');
        
        const matrizA = Matriz.desdeArray(valoresA);
        const matrizB = Matriz.desdeArray(valoresB);
        
        const resultado = matrizA.sumar(matrizB);
        
        // Formatear la matriz resultante para mostrarla
        let html = '<p>El resultado de A + B es:</p>';
        html += formatearMatrizHTML(resultado.matriz);
        
        mostrarResultado(html);
    } catch (error) {
        mostrarError(`Error al sumar matrices: ${error.message}`);
    }
}

// Función para restar matrices
function restarMatrices() {
    try {
        const valoresA = obtenerMatrizDesdeInputs('matrizInputsA');
        const valoresB = obtenerMatrizDesdeInputs('matrizInputsB');
        
        const matrizA = Matriz.desdeArray(valoresA);
        // Para restar, multiplicamos la matriz B por -1 y luego sumamos
        const matrizB = Matriz.desdeArray(valoresB);
        
        // Crear una matriz con todos los elementos de B multiplicados por -1
        const matrizBNegativa = new Matriz(matrizB.filas, matrizB.columnas);
        for (let i = 0; i < matrizB.filas; i++) {
            for (let j = 0; j < matrizB.columnas; j++) {
                matrizBNegativa.matriz[i][j] = -matrizB.matriz[i][j];
            }
        }
        
        const resultado = matrizA.sumar(matrizBNegativa);
        
        // Formatear la matriz resultante para mostrarla
        let html = '<p>El resultado de A - B es:</p>';
        html += formatearMatrizHTML(resultado.matriz);
        
        mostrarResultado(html);
    } catch (error) {
        mostrarError(`Error al restar matrices: ${error.message}`);
    }
}

// Función actualizada para obtener la matriz desde los inputs
function obtenerMatrizDesdeInputs(matrizId) {
    const inputs = document.querySelectorAll(`#${matrizId} input[type="number"]`);
    if (inputs.length === 0) {
        throw new Error("No se ha creado una matriz válida");
    }
    
    // Determinar el número de filas y columnas
    let filas = 0;
    let columnas = 0;
    let lastRow = -1;
    
    inputs.forEach(input => {
        const position = input.id.split('-');
        const row = parseInt(position[1]);
        const col = parseInt(position[2]);
        
        if (row > lastRow) {
            filas++;
            lastRow = row;
        }
        if (row === 0 && col + 1 > columnas) {
            columnas = col + 1;
        }
    });
    
    // Crear la matriz
    const valores = Array.from({length: filas}, () => Array(columnas).fill(0));
    
    inputs.forEach(input => {
        const position = input.id.split('-');
        const row = parseInt(position[1]);
        const col = parseInt(position[2]);
        const valor = parseFloat(input.value);
        valores[row][col] = isNaN(valor) ? 0 : valor;
    });
    
    return valores;
}

// Formato de matriz para HTML
function formatearMatrizHTML(matriz) {
    let html = '<table class="resultado-tabla">';
    for (let i = 0; i < matriz.length; i++) {
        html += '<tr>';
        for (let j = 0; j < matriz[i].length; j++) {
            // Redondear a 4 decimales para mejor visualización
            const valor = parseFloat(matriz[i][j].toFixed(4));
            html += `<td><span class="resultado-numero">${valor}</span></td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

// Mostrar resultado
function mostrarResultado(contenido) {
    const resultadoDiv = document.getElementById('resultado');
    const resultadoContenido = document.getElementById('resultadoContenido');
    
    resultadoContenido.innerHTML = contenido;
    resultadoDiv.style.display = 'block';
    
    // Scroll al resultado
    resultadoDiv.scrollIntoView({ behavior: 'smooth' });
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const resultadoDiv = document.getElementById('resultado');
    const resultadoContenido = document.getElementById('resultadoContenido');
    
    resultadoContenido.innerHTML = `<div class="error">${mensaje}</div>`;
    resultadoDiv.style.display = 'block';
    
    // Scroll al resultado
    resultadoDiv.scrollIntoView({ behavior: 'smooth' });
}

// Función para crear matriz personalizada
function crearMatrizPersonalizada(matrizId, filas, columnas) {
    const container = document.getElementById(matrizId);
    container.innerHTML = '';
    
    const tabla = document.createElement('table');
    
    for (let i = 0; i < filas; i++) {
        const fila = document.createElement('tr');
        
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any'; // Permite decimales
            input.id = `valor-${i}-${j}-${matrizId}`;
            input.className = 'matriz-input';
            input.value = '0';
            celda.appendChild(input);
            fila.appendChild(celda);
        }
        
        tabla.appendChild(fila);
    }
    
    container.appendChild(tabla);
    
    // Mostrar el contenedor
    const containerDiv = matrizId === 'matrizInputsA' ? 
        document.getElementById('matrizContainerA') : 
        document.getElementById('matrizContainerB');
    containerDiv.style.display = 'block';
    
    // Si ambas matrices están visibles, mostrar los botones de operaciones
    if (document.getElementById('matrizContainerA').style.display === 'block' && 
        document.getElementById('matrizContainerB').style.display === 'block') {
        document.getElementById('operacionesEntreMatrices').style.display = 'flex';
    }
}

// Función para limpiar matriz (poner todos los valores a 0)
function limpiarMatriz(matrizId) {
    const inputs = document.querySelectorAll(`#${matrizId} input[type="number"]`);
    inputs.forEach(input => {
        input.value = '0';
    });
}

// Función para eliminar matriz
function eliminarMatriz(matrizId) {
    const containerDiv = matrizId === 'matrizInputsA' ? 
        document.getElementById('matrizContainerA') : 
        document.getElementById('matrizContainerB');
    containerDiv.style.display = 'none';
    
    document.getElementById(matrizId).innerHTML = '';
    
    // Ocultar operaciones entre matrices si alguna está oculta
    if (document.getElementById('matrizContainerA').style.display === 'none' || 
        document.getElementById('matrizContainerB').style.display === 'none') {
        document.getElementById('operacionesEntreMatrices').style.display = 'none';
    }
}

// Event listeners cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM para tamaños de matriz
    const btn2x2 = document.getElementById('btn2x2');
    const btn3x3 = document.getElementById('btn3x3');
    const btnPersonalizar = document.getElementById('btnPersonalizar');
    const personalizarMatriz = document.getElementById('personalizarMatriz');
    const btnCrearMatriz = document.getElementById('btnCrearMatriz');
    
    // Referencias para operaciones con matrices
    const btnDeterminanteA = document.getElementById('btnDeterminanteA');
    const btnInversaA = document.getElementById('btnInversaA');
    const btnTraspuestaA = document.getElementById('btnTraspuestaA');
    const btnEliminarA = document.getElementById('btnEliminarA');
    const btnLimpiarA = document.getElementById('btnLimpiarA');
    
    const btnDeterminanteB = document.getElementById('btnDeterminanteB');
    const btnInversaB = document.getElementById('btnInversaB');
    const btnTraspuestaB = document.getElementById('btnTraspuestaB');
    const btnEliminarB = document.getElementById('btnEliminarB');
    const btnLimpiarB = document.getElementById('btnLimpiarB');
    
    // Referencias para operaciones entre matrices
    const btnMultiplicar = document.getElementById('btnMultiplicar');
    const btnSumar = document.getElementById('btnSumar');
    const btnRestar = document.getElementById('btnRestar');
    
    // Event listeners para los botones de tamaño de matriz
    btn2x2.addEventListener('click', function() {
        crearMatrizPersonalizada('matrizInputsA', 2, 2);
        crearMatrizPersonalizada('matrizInputsB', 2, 2);
    });
    
    btn3x3.addEventListener('click', function() {
        crearMatrizPersonalizada('matrizInputsA', 3, 3);
        crearMatrizPersonalizada('matrizInputsB', 3, 3);
    });
    
    // Event listener para mostrar/ocultar el panel de personalización
    btnPersonalizar.addEventListener('click', function() {
        personalizarMatriz.style.display = personalizarMatriz.style.display === 'block' ? 'none' : 'block';
    });
    
    // Event listener para crear matriz personalizada
    btnCrearMatriz.addEventListener('click', function() {
        const filas = parseInt(document.getElementById('numFilas').value);
        const columnas = parseInt(document.getElementById('numColumnas').value);
        
        if (isNaN(filas) || isNaN(columnas) || filas <= 0 || columnas <= 0 || filas > 30 || columnas > 30) {
            mostrarError('Por favor, ingrese dimensiones válidas (entre 1 y 30)');
            return;
        }
        
        crearMatrizPersonalizada('matrizInputsA', filas, columnas);
        crearMatrizPersonalizada('matrizInputsB', filas, columnas);
        personalizarMatriz.style.display = 'none';
    });
    
    // Event listeners para operaciones con matriz A
    btnDeterminanteA.addEventListener('click', function() {
        calcularDeterminante('matrizInputsA');
    });
    
    btnInversaA.addEventListener('click', function() {
        calcularInversa('matrizInputsA');
    });
    
    btnTraspuestaA.addEventListener('click', function() {
        calcularTraspuesta('matrizInputsA');
    });
    
    btnLimpiarA.addEventListener('click', function() {
        limpiarMatriz('matrizInputsA');
    });
    
    btnEliminarA.addEventListener('click', function() {
        eliminarMatriz('matrizInputsA');
    });
    
    // Event listeners para operaciones con matriz B
    btnDeterminanteB.addEventListener('click', function() {
        calcularDeterminante('matrizInputsB');
    });
    
    btnInversaB.addEventListener('click', function() {
        calcularInversa('matrizInputsB');
    });
    
    btnTraspuestaB.addEventListener('click', function() {
        calcularTraspuesta('matrizInputsB');
    });
    
    btnLimpiarB.addEventListener('click', function() {
        limpiarMatriz('matrizInputsB');
    });
    
    btnEliminarB.addEventListener('click', function() {
        eliminarMatriz('matrizInputsB');
    });
    
    // Event listeners para operaciones entre matrices
    btnMultiplicar.addEventListener('click', function() {
        multiplicarMatrices();
    });
    
    btnSumar.addEventListener('click', function() {
        sumarMatrices();
    });
    
    btnRestar.addEventListener('click', function() {
        restarMatrices();
    });
    
    // Ocultar las matrices y operaciones al inicio
    document.getElementById('matrizContainerA').style.display = 'none';
    document.getElementById('matrizContainerB').style.display = 'none';
    document.getElementById('operacionesEntreMatrices').style.display = 'none';
});