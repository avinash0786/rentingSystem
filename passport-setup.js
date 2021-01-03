const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const passport=require('passport');
const googleStrategy=require('passport-google-oauth2');

passport.serializeUser(function(user, done) {
    console.log("Serialize")
    console.log(user)
    if(user._id){
        console.log("USer exist in Db")
        done(null, user._id);
    }
    else {
        console.log("Google user save")
        done(null, user);
    }
});

passport.deserializeUser(function(userId, done) {
    console.log("Deserilize uid: ")
    console.log(userId)
    landlord.findById(userId)
        .then((dat)=>{
            if(dat){
                console.log("Landlord deserialize")
                console.log(dat)
                return done(null, dat);
            }
            else {
                console.log("Not in landlord")
            }
        })
        .catch(err=>{
            return done(null, userId);
        })
    tenant.findById(userId)
        .then((dat)=>{
            if(dat){
                console.log("Tenant deserialize")
                console.log(dat)
                return done(null, dat);
            }
            else {
                console.log("Not in tenant")
            }
        })
        .catch(err=>{
            return done(null, userId);
        })
    console.log("DE-Serialize")
    // return done(null, userId);
});

passport.use(new googleStrategy({
        clientID:     "788746063080-vm2a0i26sr9oqomo5i86ns5ff3nb34ts.apps.googleusercontent.com",
        clientSecret: "d8VtFHKLYpFuVbx4y3I3oiDN",
        callbackURL:process.env.AUTH_URL ,
        passReqToCallback   : true
    },
    async function(request, accessToken, refreshToken, profile, done) {
        let data
    if(request.session.landlordLog){
        data=await landlord.findOne({email:profile.email})
        if(data){
            // console.log(data)
            console.log("Landlord found")
            return done(null, data);
        }
        else {
            console.log("No landlord found")
            return done(null, profile);
        }
    }
    else{
        data=await tenant.findOne({email:profile.email});
        if(data){
            console.log("User found")
            return done(null, data);
        }
        else {
            console.log("No user found")
            return done(null, profile.id);
        }
    }
    }
));