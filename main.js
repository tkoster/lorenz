// Elements:
const rhoInput = document.getElementById('rho-input');
const sigmaInput = document.getElementById('sigma-input');
const betaInput = document.getElementById('beta-input');
const calculateButton = document.getElementById('calculate-button');
const canvas = document.getElementById('output-canvas');

// Events:
function onCalculateButtonClick() {
  const rho = parseRational(rhoInput.value);
  const sigma = parseRational(sigmaInput.value);
  const beta = parseRational(betaInput.value);

  if (isNaN(rho) || isNaN(sigma) || isNaN(beta)) {
    alert('Invalid input. Ensure all inputs are valid numbers or fractions.');
    return;
  }

  const data = integrate(rho, sigma, beta);
  draw(data);
}

calculateButton.addEventListener('click', onCalculateButtonClick);

/**
 * Parse input as a number or fraction.
 *
 * parseFraction('2.5') === 2.5
 * parseFraction('5/2') === 2.5
 *
 * Returns NaN if the input is not valid.
 */
function parseRational(input) {
  const parts = input.split('/');
  if (parts.length === 1) {
    return parseFloat(input);
  } else if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return numerator / denominator;
  } else {
    return NaN;
  }
}

/**
 * Integrate the Lorenz system of ordinary differential equations using the
 * basic rectangle rule.
 *
 * Integration parameters:
 *   t = [0,40)
 *   dt = 0.001
 * Initial condition:
 *   x, y, z = 1, 1, 1
 */
function integrate(rho, sigma, beta) {
  const mint = 0.0;
  const maxt = 40.0;
  const dt = 0.001;

  let x = 1.0;
  let y = 1.0;
  let z = 1.0;

  const data = [];

  for (let t = mint; t < maxt; t += dt) {
    // Add t,x,y,z to the result:
    data.push([t, x, y, z]);

    // Derivative:
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;

    // Integrate:
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
  }

  return data;
}

/**
 * Draw the path traced out by the integration on the canvas.
 *
 * The (t,x,y,z) path is projected onto the 2D canvas by tracing (x,y) over all t.
 */
function draw(data) {
  const originX = 400;
  const originY = 300;
  const scaleX = 10.0;
  const scaleY = 10.0;
  const u = 1; // x
  const v = 2; // y

  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 800, 600);

  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'black');
  ctx.strokeStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(data[0][u] * scaleX + originX, data[0][v] * scaleY + originY);
  for (let i = 1; i < data.length; ++i) {
    ctx.lineTo(data[i][u] * scaleX + originX, data[i][v] * scaleY + originY);
  }
  ctx.stroke();
}
