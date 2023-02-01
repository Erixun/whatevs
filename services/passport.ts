import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as dotenv from "dotenv";
dotenv.config();
//ts-ignore
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config/keys.js";

//model Class, use Pascal case
import User, { IUser } from "../models/User.js";

// const User = mongoose.model("users");
// import keys from "../config/keys.js";
// import { env } from "process";
// const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// console.log(process.env);
passport.serializeUser((user, done) => {
  done(null, user.id);
  // this is NOT the profile id (from google) but an alias for the
  // document _id generated by mongoose
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

const passportConfig = passport.use(
  new GoogleStrategy( //I am known as a strategy called 'google'
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      //relative address causes reversion to http!
      //absolute address can solve the problem
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      //code received at /auth/google/callback
      console.log(accessToken); //"Hey, this user said we're allowed to read their profile"
      //we may take this identifying info and save it to DB
      console.log("refresh token", refreshToken); //allows us to refresh the access token post expiration
      console.log("profile", profile);

      //every time we reach out to our DB
      // we are initiating an async action
      const existingUser = await User.findOne({ googleId: profile.id });
      // .then((existingUser) => {
      //we already have a record with the given profile ID
      if (existingUser) return done(null, existingUser);

      //we don't have a user record with this ID,
      //make a new record in the DB
      const user = await new User({ googleId: profile.id }).save();
      // .then((user) => done(null, user));
      done(null, user);
      // });
    }
  )
); //generic register of strategies

export default passportConfig;
