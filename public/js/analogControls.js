window.onload = function () {
  socket = io();

  let joystickL = nipplejs.create({
    zone: document.getElementById('left'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'green',
    size: 300,
    name: 'LEFT',
    lockX: true
  });

  let joystickR = nipplejs.create({
    zone: document.getElementById('right'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'red',
    size: 300,
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
    let direction = data.direction.x;
    let force = data.force * 255;
  
    force = force > 255 ? 255 : force.toFixed(0);

    socket.emit('steer', {direction, force});
    document.getElementById('leftMotor').innerHTML = `${direction}(${force})`;
  });

  joystickR.on('move', function (joystick, data) {
    if (!data.hasOwnProperty('direction')) { return; }
    let direction = data.direction.y === 'up'
      ? 'forward'
      : 'reverse';
    let force = data.force * 255;
  
    force = force > 255 ? 255 : force.toFixed(0);

    socket.emit('drive', {direction, force});
    document.getElementById('rightMotor').innerHTML = `${direction}(${force})`;
  });
};
