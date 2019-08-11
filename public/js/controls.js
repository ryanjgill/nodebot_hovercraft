window.onload = function () {
  document.oncontextmenu = new Function("return false;");

  socket = io();

  let leftForce = null
    , rightForce = null;

  let joystickL = nipplejs.create({
    zone: document.getElementById('left'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'red',
    size: 300,
    threshold: 0.05,
    lockY: true
  });

  let joystickR = nipplejs.create({
    zone: document.getElementById('right'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'red',
    size: 300,
    threshold: 0.05,
    lockY: true
  });

  joystickL.on('end', function (joystick, data) {
    socket.emit('stop', 'leftMotor');
    document.getElementById('leftMotor').innerHTML = 'stop()';
  });

  joystickR.on('end', function (joystick, data) {
    socket.emit('stop', 'rightMotor');
    document.getElementById('rightMotor').innerHTML = 'stop()';
  });

  joystickL.on('move', function (joystick, data) {
    if (!data.hasOwnProperty('direction')) { return; }
    let direction = data.direction.y === 'up'
      ? 'forward'
      : 'reverse';
    let force = data.force * 255;
  
    force = force > 255 ? 255 : force.toFixed(0);

    if (force !== leftForce) {
      leftForce = force;
      throttle(socket.emit('leftMotor', {direction, force}), 50)
    
      document.getElementById('leftMotor').innerHTML = `${direction}(${force})`;
    }
  })

  joystickR.on('move', function (joystick, data) {
    if (!data.hasOwnProperty('direction')) { return; }
    let direction = data.direction.y === 'up'
      ? 'forward'
      : 'reverse';
    let force = data.force * 255;
  
    force = force > 255 ? 255 : force.toFixed(0);

    if (force !== rightForce) {
      rightForce = force;
      throttle(socket.emit('rightMotor', {direction, force}), 50);
      document.getElementById('rightMotor').innerHTML = `${direction}(${force})`;
    }
    
  });

  document.getElementById('hoverToggle').addEventListener('click', (evt) => {
    socket.emit('toggleHover', evt.target.checked)
  })
};

const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}