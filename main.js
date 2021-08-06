// Elements:
const rhoInput = document.getElementById('rho-input');
const sigmaInput = document.getElementById('sigma-input');
const betaInput = document.getElementById('beta-input');
const maxtInput = document.getElementById('maxt-input');
const dtInput = document.getElementById('dt-input');
const calculateButton = document.getElementById('calculate-button');
const displayForm = document.getElementById('display-form');
const showGridInput = document.getElementById('show-grid-input');
const showAxesInput = document.getElementById('show-axes-input');
const showStatsInput = document.getElementById('show-stats-input');
const usePointerLockInput = document.getElementById('use-pointer-lock-input');
const canvas = document.getElementById('output-canvas');

// State:
let state = {
  data: [],
  camera: { lat: Math.PI / 6, long: 3 * Math.PI / 2, distance: 100 },
  zoom: 0,
  dragging: false
};

// Events:
function onCalculateButtonClick(event) {
  event.preventDefault();
  recalculate();
  draw();
}

function onCanvasPointerDown(event) {
  if (event.button == 0)
  {
    state.dragging = true;
    draw();

    if (usePointerLockInput.checked)
    {
      canvas.requestPointerLock();
    }
  }
}

function onCanvasPointerUp(event) {
  if (event.button == 0)
  {
    state.dragging = false;
    draw();

    if (document.pointerLockElement == canvas)
    {
      document.exitPointerLock();
    }
  }
}

function onCanvasPointerMove(event) {
  if (state.dragging) {
    let dLat = 0.005 * event.movementY;
    let dLong = -0.005 * event.movementX;
    let twoPi = 2 * Math.PI;
    let camera = state.camera;
    camera.lat = (camera.lat + dLat) % twoPi;
    camera.long = (camera.long + dLong) % twoPi;
    if (camera.long < 0) camera.long = twoPi - camera.long;
    draw();
  }
}

function onCanvasWheel(event) {
  event.preventDefault();
  if (event.deltaY < 0 && state.zoom < 10)
  {
    state.zoom += 1;
  } else if (event.deltaY > 0) {
    state.zoom -= 1;
  }
  state.camera.distance = 100 / (1.2 ** state.zoom);
  draw();
}

function onDisplayFormChange() {
  draw();
}

calculateButton.addEventListener('click', onCalculateButtonClick);
canvas.addEventListener('pointerdown', onCanvasPointerDown);
canvas.addEventListener('pointerup', onCanvasPointerUp);
canvas.addEventListener('pointermove', onCanvasPointerMove);
canvas.addEventListener('wheel', onCanvasWheel);
displayForm.addEventListener('change', onDisplayFormChange);

/**
 * Parse input as a number or fraction.
 *
 * parseFraction('2.5') === 2.5
 * parseFraction('5/2') === 2.5
 *
 * Returns NaN if the input is not valid.
 */
function parseRational(input) {
  let parts = input.split('/');
  if (parts.length === 1) {
    return parseFloat(input);
  } else if (parts.length === 2) {
    let numerator = parseFloat(parts[0]);
    let denominator = parseFloat(parts[1]);
    return numerator / denominator;
  } else {
    return NaN;
  }
}

function recalculate() {
  let rho = parseRational(rhoInput.value);
  let sigma = parseRational(sigmaInput.value);
  let beta = parseRational(betaInput.value);
  let maxt = parseRational(maxtInput.value);
  let dt = parseRational(dtInput.value);

  if (isNaN(rho)
      || isNaN(sigma)
      || isNaN(beta)
      || isNaN(maxt)
      || isNaN(dt)) {
    alert('Invalid input. Ensure all inputs are valid numbers or fractions.');
    return;
  }

  state.data = integrate(rho, sigma, beta, maxt, dt);
}

/**
 * Integrate the Lorenz system of ordinary differential equations using the
 * basic rectangle rule.
 *
 * Initial condition:
 *   x, y, z = 1, 1, 1
 */
function integrate(rho, sigma, beta, maxt, dt) {
  let x = 1.0;
  let y = 1.0;
  let z = 1.0;

  let data = [];

  for (let t = 0; t < maxt; t += dt) {
    // Add t,x,y,z to the result:
    data.push([t, x, y, z]);

    // Derivative:
    let dx = sigma * (y - x);
    let dy = x * (rho - z) - y;
    let dz = x * y - beta * z;

    // Integrate:
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
  }

  return data;
}

/**
 * 4x4 matrix multiplication.
 */
function mmul(a, b) {
  return [
    a[0]  * b[0]  + a[1]  * b[4]  + a[2]  * b[8]  + a[3]  * b[12],
    a[0]  * b[1]  + a[1]  * b[5]  + a[2]  * b[9]  + a[3]  * b[13],
    a[0]  * b[2]  + a[1]  * b[6]  + a[2]  * b[10] + a[3]  * b[14],
    a[0]  * b[3]  + a[1]  * b[7]  + a[2]  * b[11] + a[3]  * b[15],

    a[4]  * b[0]  + a[5]  * b[4]  + a[6]  * b[8]  + a[7]  * b[12],
    a[4]  * b[1]  + a[5]  * b[5]  + a[6]  * b[9]  + a[7]  * b[13],
    a[4]  * b[2]  + a[5]  * b[6]  + a[6]  * b[10] + a[7]  * b[14],
    a[4]  * b[3]  + a[5]  * b[7]  + a[6]  * b[11] + a[7]  * b[15],

    a[8]  * b[0]  + a[9]  * b[4]  + a[10] * b[8]  + a[11] * b[12],
    a[8]  * b[1]  + a[9]  * b[5]  + a[10] * b[9]  + a[11] * b[13],
    a[8]  * b[2]  + a[9]  * b[6]  + a[10] * b[10] + a[11] * b[14],
    a[8]  * b[3]  + a[9]  * b[7]  + a[10] * b[11] + a[11] * b[15],

    a[12] * b[0]  + a[13] * b[4]  + a[14] * b[8]  + a[15] * b[12],
    a[12] * b[1]  + a[13] * b[5]  + a[14] * b[9]  + a[15] * b[13],
    a[12] * b[2]  + a[13] * b[6]  + a[14] * b[10] + a[15] * b[14],
    a[12] * b[3]  + a[13] * b[7]  + a[14] * b[11] + a[15] * b[15]
  ];
}

/**
 * Multiply a 4D vector by a 4x4 matrix.
 */
function vmul(mat, v) {
  return [
    mat[0]  * v[0] + mat[1]  * v[1] + mat[2]  * v[2] + mat[3]  + v[3],
    mat[4]  * v[0] + mat[5]  * v[1] + mat[6]  * v[2] + mat[7]  + v[3],
    mat[8]  * v[0] + mat[9]  * v[1] + mat[10] * v[2] + mat[11] + v[3],
    mat[12] * v[0] + mat[13] * v[1] + mat[14] * v[2] + mat[15] + v[3]
  ];
}

/**
 * Create a 4x4 translation matrix.
 */
function translation(x, y, z) {
  return [
    1.0, 0.0, 0.0, x,
    0.0, 1.0, 0.0, y,
    0.0, 0.0, 1.0, z,
    0.0, 0.0, 0.0, 1.0
  ];
}

/**
 * Create a 4x4 rotation matrix about the Y axis.
 */
function rotationY(angle) {
  let c = Math.cos(angle);
  let s = Math.sin(angle);
  return [
    c,   0.0, s,   0.0,
    0.0, 1.0, 0.0, 0.0,
    -s,  0.0, c,   0.0,
    0.0, 0.0, 0.0, 1.0
  ];
}

/**
 * Create a 4x4 rotation matrix about the Z axis.
 */
function rotationZ(angle) {
  let c = Math.cos(angle);
  let s = Math.sin(angle);
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, c,   -s,  0.0,
    0.0, s,   c,   0.0,
    0.0, 0.0, 0.0, 1.0
  ];
}

/**
 * Create a 4x4 perspective projection matrix.
 */
function perspectiveProjection(left, right, bottom, top, near, far) {
  return [
    2.0 * near / (right - left), 0.0, (right + left) / (right - left), 0.0,
    0.0, 2.0 * near / (top - bottom), (top + bottom) / (top - bottom), 0.0,
    0.0, 0.0, -(far + near) / (far - near), -2.0 * far * near / (far - near),
    0.0, 0.0, -1.0, 0.0
  ];
}

/**
 * Perform the perspective divide on a vector.
 * The vector is modified in place.
 */
function perspectiveDivide(v) {
  v[0] /= v[3];
  v[1] /= v[3];
  v[2] /= v[3];
  v[3] = 1.0;
  return v;
}

/**
 * Calculate the Manhattan distance between two 2D points.
 */
function manhattanDistance(v0, v1) {
  return Math.abs(v0[0] - v1[0]) + Math.abs(v0[1] - v1[1]);
}

/**
 * Draw the data points as a curve on the canvas.
 */
function draw()
{
  let { data, camera } = state;

  // Find the midpoint of the data points to centre them in the camera view:
  let minX = 0.0;
  let minY = 0.0;
  let minZ = 0.0;
  let maxX = 0.0;
  let maxY = 0.0;
  let maxZ = 0.0;
  for (let i = 0; i < data.length; ++i)
  {
    let [t, x, y, z] = data[i];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  let midX = (maxX + minX) / 2;
  let midY = (maxY + minY) / 2;
  let midZ = (maxZ + minZ) / 2;

  // Calculate camera transforms:
  let dataLocationTransform = translation(-midX, -midY, -midZ);
  let cameraLocationTransform = translation(0, 0, camera.distance);
  let cameraRotationTransform = mmul(rotationZ(-camera.lat), rotationY(camera.long));
  let projection = perspectiveProjection(-2, 2, 1.5, -1.5, 100, 1000);
  let viewportTransform = [
    -10.0, 0.0, 0.0, canvas.width / 2,
    0.0, -10.0, 0.0, canvas.height / 2,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ];
  let originCameraTransform = mmul(viewportTransform, mmul(projection, mmul(cameraLocationTransform, cameraRotationTransform)));
  let dataCameraTransform = mmul(originCameraTransform, dataLocationTransform);
  let axesCameraTransform = mmul(translation(canvas.width / 2 - 80, canvas.height / 2 - 80, 0), mmul(viewportTransform, mmul(projection, mmul(translation(0, 0, 10), cameraRotationTransform))));

  // Draw:
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (showGridInput.checked) {
    drawGrid(originCameraTransform, ctx);
  }
  let pointCount = drawData(data, dataCameraTransform, ctx);
  if (showAxesInput.checked) {
    drawAxes(axesCameraTransform, ctx);
  }
  if (showStatsInput.checked) {
    drawStats(data.length, pointCount, camera, ctx);
  }
}

/**
 * Draw the path traced out by the integration on the canvas.
 */
function drawData(data, transform, ctx) {
  // Project data points using the camera transform.
  let curvePoints = [];
  if (data.length > 0)
  {
    let point0 = perspectiveDivide(vmul(transform, [data[0][1], data[0][2], data[0][3], 1.0]));
    curvePoints.push(point0);
    let lastPoint = 0;
    for (let i = 1; i < data.length; ++i)
    {
      let point = perspectiveDivide(vmul(transform, [data[i][1], data[i][2], data[i][3], 1.0]));
      if (manhattanDistance(point, curvePoints[lastPoint]) >= 2.0) // cull points that are too close
      {
        curvePoints.push(point);
        ++lastPoint;
      }
    }
  }

  if (curvePoints.length > 1)
  {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f22');
    gradient.addColorStop(1, '#fcc');
    ctx.lineWidth = 1;
    ctx.strokeStyle = gradient;
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(curvePoints[0][0], curvePoints[0][1], 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(curvePoints[0][0], curvePoints[0][1]);
    for (let i = 1; i < curvePoints.length; ++i) {
      ctx.lineTo(curvePoints[i][0], curvePoints[i][1]);
    }
    ctx.stroke();
  }

  return curvePoints.length;
}

const zero = [0.0, 0.0, 0.0, 0.0];
const unitX = [1.0, 0.0, 0.0, 0.0];
const unitY = [0.0, 1.0, 0.0, 0.0];
const unitZ = [0.0, 0.0, 1.0, 0.0];

/**
 * Draw axes.
 */
function drawAxes(transform, ctx) {
  let origin = perspectiveDivide(vmul(transform, zero));
  let x = perspectiveDivide(vmul(transform, unitX));
  let y = perspectiveDivide(vmul(transform, unitY));
  let z = perspectiveDivide(vmul(transform, unitZ));

  ctx.font = 'italic 32px serif';
  ctx.textBaseline = 'alphabetic';

  function drawAxis(axis) {
    let { to, label, color } = axis;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    ctx.strokeText(label, to[0], to[1]);
    ctx.fillStyle = color;
    ctx.fillText(label, to[0], to[1]);
  }

  let axes = [
    { to: x, label: 'x', color: '#f33' },
    { to: y, label: 'y', color: '#3f3' },
    { to: z, label: 'z', color: '#33f' }
  ];
  axes.sort((a, b) => b.to[2] - a.to[2]); // depth sort

  for (let i = 0; i < axes.length; ++i) {
    drawAxis(axes[i]);
  }
}

/**
 * Draw a 10x10 grid on the X-Z plane.
 */
function drawGrid(transform, ctx) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#333';
  for (let i = 0; i < 11; ++i)
  {
    let t = 10 * (i - 5);
    let x0 = perspectiveDivide(vmul(transform, [t, 0, -50, 1]));
    let x1 = perspectiveDivide(vmul(transform, [t, 0, 50, 1]));
    let z0 = perspectiveDivide(vmul(transform, [-50, 0, t, 1]));
    let z1 = perspectiveDivide(vmul(transform, [50, 0, t, 1]));
    // TODO: Better near plane clipping. Intersect grid lines with the near plane instead of culling entirely.
    if (x0[2] < 0 && x1[2] < 0) {
      ctx.beginPath();
      ctx.moveTo(x0[0], x0[1]);
      ctx.lineTo(x1[0], x1[1]);
      ctx.stroke();
    }
    if (z0[2] < 0 && z1[2] < 0) {
      ctx.beginPath();
      ctx.moveTo(z0[0], z0[1]);
      ctx.lineTo(z1[0], z1[1]);
      ctx.stroke();
    }
  }
}

/**
 * Draw some information about the scene at the top of the canvas.
 */
function drawStats(dataLength, curveLength, camera, ctx) {
  let latDegrees = (180 * camera.lat / Math.PI).toFixed(2);
  let longDegrees = (180 * camera.long / Math.PI).toFixed(2);
  let message = `${dataLength} data points, ${curveLength} curve segments, camera lat=${latDegrees} long=${longDegrees}`;
  ctx.fillStyle = '#aaa';
  ctx.font = 'bold 16px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(message, 0, 0);
}

recalculate();
draw();
