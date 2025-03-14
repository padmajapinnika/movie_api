const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy for Login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'password',
    },
    async (username, password, callback) => {
      try {
        console.log(`Login attempt: ${username} ${password}`);
        
        const user = await Users.findOne({ Username: username });

        if (!user) {
          console.log('Incorrect username');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        // **Compare Passwords Manually**
        if (user.password !== password) {
          console.log('Incorrect password');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        console.log('Login successful');
        return callback(null, user);
      } catch (error) {
        console.error('Error during authentication:', error);
        return callback(error);
      }
    }
  )
);

// JWT Strategy for Authentication
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
          return callback(null, false);
        }
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);
