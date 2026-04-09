const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? `${process.env.BACKEND_URL}/api/auth/google/callback`
        : 'http://localhost:5000/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ 
          $or: [
            { providerId: profile.id },
            { email: email }
          ]
        });

        if (user) {
          // If user exists but via different provider, link them or update
          user.provider = 'google';
          user.providerId = profile.id;
          if (!user.isVerified) user.isVerified = true; // OAuth is trusted
          if (!user.avatar) user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: email,
          provider: 'google',
          providerId: profile.id,
          isVerified: true,
          avatar: profile.photos[0]?.value,
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? `${process.env.BACKEND_URL}/api/auth/github/callback`
        : 'http://localhost:5000/api/auth/github/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
        let user = await User.findOne({ 
          $or: [
            { providerId: profile.id },
            { email: email }
          ]
        });

        if (user) {
          user.provider = 'github';
          user.providerId = profile.id;
          if (!user.isVerified) user.isVerified = true;
          if (!user.avatar) user.avatar = profile._json.avatar_url;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          provider: 'github',
          providerId: profile.id,
          isVerified: true,
          avatar: profile._json.avatar_url,
          githubUrl: profile.profileUrl
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
