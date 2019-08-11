let express = require('express')
  , app = express()
  , path = require('path')
  , http = require('http').createServer(app)
  , socketIO = require('socket.io')(http)
  , five = require('johnny-five')
  , Tessel = require('tessel-io')
  , ip = require('ip')
  , ADDRESS = ip.address()
  , PORT = 3030
  , board = new five.Board({
      io: new Tessel()
    })
  , enableLogging = true


function emitUserCount(socketIO) {
  socketIO.sockets.emit('user:count', socketIO.engine.clientsCount)
  console.log('Total users: ', socketIO.engine.clientsCount)
}

function log(text) {
  if (enableLogging) {
    console.log(text);
  }
}

app.use(express.static(path.join(__dirname + '/public')))

// index route
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
})

// board ready event
board.on('ready', function (err) {
  if (err) {
    console.log(err)
    board.reset()
    return
  }

  function checkForZeroUsers(socketIO) {
    if (socketIO.engine.clientsCount === 0) {
      stop()
    }
  }

  console.log('board connected! Johnny-Five ready to go.')

  // setup motors 
  // steering 
  let motor1 = new five.Motor({
    pins: {
      pwm: 'a5',
      dir: 'a4'
    },
    invertPWM: true
  }),
  motor11 = new five.Motor({
    pins: {
      pwm: 'a6',
      dir: 'a7'
    },
    invertPWM: true
  })
  // power
  , motor2 = new five.Motor({
    pins: {
      pwm: 'b5',
      dir: 'b4'
    },
    invertPWM: true
  }),
  motor22 = new five.Motor({
    pins: {
      pwm: 'b6',
      dir: 'b7'
    },
    invertPWM: true
  }),
  hoverMotor = new five.Relay({
    pin: 'a3'
  })

  function stop() {
    motor1.stop()
    motor11.stop()
    motor2.stop()
    motor22.stop()
  }

  // SocketIO events
  socketIO.on('connection', function (socket) {
    console.log('New connection!')

    emitUserCount(socketIO)

    // nipplejs variable input events
    socket.on('leftMotor', function (input) {
      if (input.direction === 'forward') {
        log('motor1:forward(' + input.force + ')')
        motor1.forward(input.force)
        motor11.forward(input.force)
      } else {
        log('motor1:reverse(' + input.force + ')')
        motor1.reverse(input.force)
        motor11.reverse(input.force)
      }
    })

    socket.on('rightMotor', function (input) {
      if (input.direction === 'forward') {
        log('motor2:forward(' + input.force + ')')
        motor2.forward(input.force)
        motor22.forward(input.force)
      } else {
        log('motor2:reverse(' + input.force + ')')
        motor2.reverse(input.force)
        motor22.reverse(input.force)
      }
    })

    socket.on('stop', function (motor) {
      if (!motor) {
        stop()
      } else if (motor === 'leftMotor') {
        log('motor1:stop')
        motor1.stop()
        motor11.stop()
      } else {
        log('motor2:stop')
        motor2.stop()
        motor22.stop()
      }
    })

    socket.on('toggleHover', function (value) {
      console.log(value)
      if (value && value === true) {
        console.log('hoverMotor on')
        hoverMotor.on()
      } else {
        console.log('hoverMotor off')
        hoverMotor.off()
      }
    })

    socket.on('disconnect', function() {
      checkForZeroUsers(socketIO)
      emitUserCount(socketIO)
    })
  })

  // set the app to listen on PORT
  http.listen(PORT)

  // log the address and port
  console.log('Up and running on ' + ADDRESS + ':' + PORT)
})