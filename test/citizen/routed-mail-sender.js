var citizen = require('../../index');

citizen.mail.send({ to: 'routed-mail-receiver' }, 'hello receiver' );